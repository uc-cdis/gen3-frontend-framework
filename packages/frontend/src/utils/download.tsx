import Cookies from 'universal-cookie';
import { CoreDispatch, Modals, showModal } from '@gen3/core';
import { Button } from '@mantine/core';
import { cleanNotifications, showNotification } from '@mantine/notifications';
import { includes, isPlainObject, reduce, uniqueId } from 'lodash';
import { RiCloseCircleLine as CloseIcon } from 'react-icons/ri';

const hashString = (s: string) =>
  s.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0);

const getBody = (iframe: HTMLIFrameElement) => {
  const document = iframe?.contentWindow || iframe?.contentDocument;
  return (document as Window)?.document?.body || (document as Document)?.body;
};

const toHtml = (key: string, value: any) =>
  `<input
    type="hidden"
    name="${key}"
    value="${
      isPlainObject(value)
        ? JSON.stringify(value).replace(/"/g, '&quot;')
        : value
    }"
  />`;

const customKeys = ['expand', 'fields', 'facets'];

const processParamObj = (key: string, value: any) =>
  includes(customKeys, key) ? [].concat(value).join() : value;

/**
 * A notification box that is used to alert the user that their
 * selected file downloads are in progress
 * @param onClick - Function to handle click on cancel button
 */
export const DownloadNotification = ({ onClick }: { onClick: () => void }) => {
  return (
    <div>
      <p>Download preparation in progress. Please wait...</p>
      <Button
        variant="white"
        leftSection={<CloseIcon aria-hidden="true" />}
        style={{ color: '#155276', cursor: 'pointer' }}
        onClick={onClick}
      >
        Cancel Download
      </Button>
    </div>
  );
};

/*
TODO - handle slow download notification PEAR-624
const SlowDownloadNotification = ({ onClick }: { onClick: () => void }) => (
  <>
    <div>
      <div>
        The download preparation can take time due to different factors (total
        file size, number of files, or number of concurrent users).
      </div>
      <div>
        We recommend that you use the{" "}
        <a
          href="https://gdc.cancer.gov/access-data/gdc-data-transfer-tool"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          GDC Data Transfer Tool
        </a>{" "}
        or cancel the download and try again later.
      </div>
      <Button
        variant="white"
        leftIcon={<CloseIcon />}
        style={{ color: "#155276", cursor: "pointer" }}
        onClick={onClick}
      >
        Cancel Download
      </Button>
    </div>
  </>
);
*/

export interface DownloadFunctionParams<
  T extends Record<string, any> = Record<string, any>,
> {
  endpoint: string;
  params: T;
  method: string;
  dispatch: CoreDispatch;
  done?: () => void;
  Modal403?: Modals;
  Modal400?: Modals;
  customErrorMessage?: string;
  hideNotification?: boolean;
}

export type DownloadFunction<
  T extends Record<string, any> = Record<string, any>,
> = (params: DownloadFunctionParams<T>) => Promise<void>;

/**
 * Trigger a download by attaching an iFrame to the document with the parameters of the request as fields in a form
 * @param endpoint - endpoint to be attached with
 * @param params - body to be attached with post request
 * @param method - Request Method: GET, PUT, POST
 * @param dispatch - dispatch send from the parent component to dispatch Modals
 * @param done - callback function to be called after the download has been initiated
 * @param Modal400 - Modal for 400 error
 * @param Modal403 - Modal for 403 error
 * @param customErrorMessage - custom message to be passed for 400 errors
 * @param hideNotification - hide the notification
 */

const download = async <T extends Record<string, any> = Record<string, any>>({
  endpoint,
  params,
  method,
  dispatch,
  done,
  Modal400 = Modals.GeneralErrorModal,
  Modal403 = Modals.NoAccessModal,
  customErrorMessage,
  hideNotification = false,
}: DownloadFunctionParams<T>): Promise<void> => {
  const cookies = new Cookies();

  /* Create a cookie with a unique identifier to attach to request. Response from server will use the set-cookie header
    to remove the cookie when the response is received (aka the download starts). This will only work on when the FE and BE
    are on the same domain.
  */

  const downloadToken = uniqueId(`${+new Date()}-`);
  const cookieKey = navigator.cookieEnabled
    ? Math.abs(hashString(JSON.stringify(params) + downloadToken)).toString(16)
    : null;

  if (cookieKey) {
    cookies.set(cookieKey, downloadToken);
  }

  // place notification in timeout to avoid flicker on fast calls
  const showNotificationTimeout = setTimeout(
    () =>
      showNotification({
        message: (
          <DownloadNotification
            onClick={() => {
              iFrame.remove();
              cleanNotifications();
              if (done) {
                done();
              }
            }}
          />
        ),
        styles: () => ({
          root: {
            textAlign: 'center',
            display: hideNotification ? 'none' : 'block',
          },
          closeButton: {
            color: 'black',
            '&:hover': {
              backgroundColor: 'lightslategray',
            },
          },
        }),
        closeButtonProps: { 'aria-label': 'Close notification' },
      }),
    100,
  ); // set to 100 as that is perceived as instant

  const fields = reduce(
    {
      ...params,
      downloadCookieKey: cookieKey,
      downloadCookiePath: '/',
      attachment: true,
      ...(params.filename !== undefined ? { download: params.filename } : {}),
    },
    (result, value, key) => {
      const paramValue = processParamObj(key, value);
      return (
        result +
        [].concat(paramValue).reduce((acc, v) => acc + toHtml(key, v), '')
      );
    },
    '',
  );

  const iFrame = document.createElement('iframe');
  iFrame.style.display = 'none';
  iFrame.src = 'about:blank';

  // Appending to document body to allow navigation away from the current
  // page and downloads in the background
  document.body.appendChild(iFrame);

  const pollForDownloadResult = async () => {
    const executePoll = async (resolve: (value?: unknown) => void) => {
      // Request has been canceled
      const body = getBody(iFrame);
      if (body === undefined) {
        resolve();
        return;
      }

      const content = body?.textContent;
      // Download has started
      if (cookieKey !== null && !cookies.get(cookieKey)) {
        clearTimeout(showNotificationTimeout);
        cleanNotifications();
        if (done) {
          done();
        }
        resolve();
      } else {
        const iFrameHasContent = iFrame.contentWindow?.document.body;
        const requestError =
          iFrame.contentWindow?.document.getElementsByTagName('form').length ===
            0 && content !== '';
        if (iFrameHasContent && requestError) {
          clearTimeout(showNotificationTimeout);
          cleanNotifications();

          const errorMessage = /{"(?:message|error)":"([^"]*)"/g.exec(
            content ?? 'Undefined',
          )?.[1];
          if (
            errorMessage === 'internal server error' ||
            errorMessage === undefined
          ) {
            dispatch(showModal({ modal: Modal400, message: errorMessage }));
          } else if (
            errorMessage ===
            'Your token is invalid or expired. Please get a new token.'
          ) {
            dispatch(showModal({ modal: Modal403, message: errorMessage }));
          } else {
            dispatch(
              showModal({
                modal: Modal400,
                message: customErrorMessage || errorMessage,
              }),
            );
          }

          if (done) {
            done();
          }
          resolve();
        } else {
          setTimeout(executePoll, 1000, resolve);
        }
      }
    };

    return new Promise(executePoll);
  };

  const addFormAndSubmit = () => {
    //do all of this together for FireFox support
    const form = document.createElement('form');
    form.method = method.toUpperCase();
    form.action = endpoint;
    form.innerHTML = fields;

    getBody(iFrame).appendChild(form);

    form.submit();
  };

  addFormAndSubmit();
  await pollForDownloadResult();
  iFrame.remove();
};

export default download;

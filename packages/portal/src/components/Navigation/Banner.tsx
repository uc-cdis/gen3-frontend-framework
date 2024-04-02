import {
  FaQuestion as InfoIcon,
  FaExclamation as WarningIcon,
  FaExclamationTriangle as ErrorIcon,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import Markdown from 'react-markdown';

export interface BannerProps {
  readonly message: string;
  readonly level: 'INFO' | 'WARNING' | 'ERROR';
  readonly dismissible: boolean;
  readonly isExternalLink: boolean;
  readonly id: number;
}

const backgroundColor = {
  INFO: 'bg-utility-info',
  WARNING: 'bg-utility-warning',
  ERROR: 'bg-utility-error',
  MESSAGE: 'bg-utility-warning',
};

const textColor = {
  INFO: 'text-utility-contrast-info',
  WARNING: 'text-utility-contrast-warning',
  ERROR: 'text-utility-contrast-error',
  MESSAGE: 'text-utility-contrast-warning',
};

const icon = {
  INFO: <InfoIcon className='text-utility-contrast-info' title='Info icon.' />,
  WARNING: (
    <WarningIcon
      className='text-utility-contrast-warning'
      title='Warning icon.'
    />
  ),
  ERROR: (
    <ErrorIcon className='text-utility-contrast-error' title='Error icon.' />
  ),
};



export const Banner: React.FC<BannerProps> = ({
  message,
  level,
  isExternalLink
}: BannerProps) => {
  const linkTarget = isExternalLink ? '_target': '_self';
  return (
    <div
      className={`w-full p-1 flex justify-between ${backgroundColor[level]}`}
    >
      <div className='flex items-center m-auto'>
        {icon[level]}
        <span className={`pl-4 ${textColor[level]}`}>
          <Markdown
            components={{
              // eslint-disable-next-line react/prop-types
              a: ({ children, ...props }) => (
                <a className='underline' {...props} target={linkTarget} rel='noreferrer'>
                  {children}
                  {isExternalLink && <FaExternalLinkAlt className='pl-1 inline-block' title='External Link'/>}
                </a>
              ),
            }}
          >
            {message}
          </Markdown>
        </span>
      </div>
      {/*dismissible && (
        <div className="flex items-center pl-1">
          <Button
            onClick={() => dispatch(dismissNotification(id))}
            rightIcon={<MdClose className={`${textColor[level]}`} />}
            styles={{
              root: {
                background: "transparent",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              },
            }}
          >
            <div className={`${textColor[level]}`}>Dismiss</div>
          </Button>
        </div>
          )*/}
    </div>
  );
};

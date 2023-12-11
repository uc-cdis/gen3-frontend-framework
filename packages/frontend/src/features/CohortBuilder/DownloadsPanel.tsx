import { DropdownsWithButtonsProps } from './types';
import {
  DropdownButton,
  DownloadButtonProps,
} from '../../components/Buttons/DropdownButtons';
import ActionButton from '../../components/Buttons/ActionButton';
import { useIsUserLoggedIn } from '@gen3/core';


interface DownloadsPanelProps {
  dropdowns: Record<string, DropdownsWithButtonsProps>;
  buttons: DownloadButtonProps[];
  loginForDownload?: boolean;
}

const DownloadsPanel = ({
  dropdowns,
  buttons,
  loginForDownload,
}: DownloadsPanelProps): JSX.Element => {
  const isUserLoggedIn = useIsUserLoggedIn();

  console.log("DownloadsPanel: dropdowns: ", dropdowns);

  const loginRequired = loginForDownload ? loginForDownload : false;

  let dropdownsToRender = dropdowns;

  if (loginRequired && !isUserLoggedIn) {
    dropdownsToRender = Object.entries(dropdowns ?? {}).reduce(
      (acc, [key, dropdown]) => {
        return {
          ...acc,
          [key]: {
            ...dropdown,
            title: `${dropdown.title} (Login Required)`,
            buttons: dropdown.buttons.map((button) => ({
              ...button,
              title: `${button.title} (Login Required)`,
              enabled: false,
            })),
          },
        };
      },
      {},
    );
  }

  return dropdowns ? (
    <div className="flex space-x-1">
      {Object.values(dropdownsToRender).map((dropdown) => (
        <DropdownButton {...dropdown} key={dropdown.title} />
      ))}
      {buttons.map((button) => (
        <ActionButton {...button} key={button.title} />
      ))}
    </div>
  ) : (
    <></>
  );
};

export default DownloadsPanel;

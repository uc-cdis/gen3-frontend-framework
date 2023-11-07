import { DropdownsWithButtonsProps } from "./types";
import { DownloadButton, DownloadButtonProps } from "../../components/Buttons/DropdownButtons";
import { useIsUserLoggedIn } from "@gen3/core";


interface DownloadsPanelProps {
  dropdowns: Record<string, DropdownsWithButtonsProps>;
  buttons: DownloadButtonProps[];
  loginForDownload?: boolean;
}

const DownloadsPanel = ({ dropdowns, loginForDownload }: DownloadsPanelProps): JSX.Element => {
  const isUserLoggedIn = useIsUserLoggedIn();

  const loginRequired = loginForDownload ? loginForDownload : false;

  let dropdownsToRender = dropdowns;

  if (loginRequired && !isUserLoggedIn) {
    dropdownsToRender = Object.entries(dropdowns ?? {}).reduce((acc, [key, dropdown]) => {
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
    }, {});
  }

  return dropdowns ? (
    <div className="flex">
      {Object.values(dropdownsToRender).map((dropdown) => (
        <DownloadButton {...dropdown} key={dropdown.title} />
      ))}
    </div>
  ) : (
    <></>
  );
};

export default DownloadsPanel;

import { DownloadButtonConfig, DropdownButtonsConfig, DropdownsWithButtonsProps } from './types';

/**
 * Function given an object of DropdownButtonsConfig will return an object of DropdownsWithButtonsProps
 * with the buttons property added to each DropdownButtonsConfig
 * this is to support the legacy config format
 * @param dropdowns
 * @returns Record<string, DropdownsWithButtonsProps> | {}
 */
export const AddButtonsArrayToDropdowns = (dropdowns?: Record<string, DropdownButtonsConfig>): Record<string, DropdownsWithButtonsProps> => {

  if (!dropdowns) {
    return {};
  }
  const dropdownsWithButtons: Record<string, DropdownsWithButtonsProps> = {};
  Object.keys(dropdowns).forEach((key) => {
    const dropdown = dropdowns[key];
    dropdownsWithButtons[key] = {
      ...dropdown,
      buttons: [],
    };
  });
  return dropdownsWithButtons;
};

export const AddButtonsToDropdown = (dropdowns: Record<string, DropdownsWithButtonsProps>,
                                     buttons?: ReadonlyArray<DownloadButtonConfig> ): Record<string, DropdownsWithButtonsProps> => {

  if (!buttons) {
    return dropdowns;
  }

  const dropdownsWithButtons: Record<string, DropdownsWithButtonsProps> = {};
  Object.keys(dropdowns).forEach((key) => {
    const dropdown = dropdowns[key];
    dropdownsWithButtons[key] = {
      ...dropdown,
      buttons: buttons.filter((button) => button.dropdownId === key).map((button) => {
        const { dropdownId : _, ...rest } = button;
        return rest;
      }),
    };
  });
  return dropdownsWithButtons;
};

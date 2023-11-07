import { AddButtonsArrayToDropdowns, AddButtonsToDropdown } from '../utils';
import { DownloadButtonConfig, DropdownButtonsConfig, DropdownsWithButtonsProps } from "../types";

describe('AddButtonsToDropdowns', () => {
  // Should return an empty object if no dropdowns are provided
  it('should return an empty object when no dropdowns are provided', () => {
    const result = AddButtonsArrayToDropdowns();
    expect(result).toEqual({});
  });

  // Should handle an input object with one dropdown
  it('should handle an input object with one dropdown', () => {
    const dropdowns = {
      dropdown1: {
        title: 'Dropdown 1',
      },
    };
    const result = AddButtonsArrayToDropdowns(dropdowns);
    expect(result).toEqual({
      dropdown1: {
        title: 'Dropdown 1',
        buttons: [],
      },
    });
  });

  // Should handle an input object with multiple dropdowns
  it('should handle an input object with multiple dropdowns', () => {
    const dropdowns = {
      dropdown1: {
        title: 'Dropdown 1',
      },
      dropdown2: {
        title: 'Dropdown 2',
      },
    };
    const result = AddButtonsArrayToDropdowns(dropdowns);
    expect(result).toEqual({
      dropdown1: {
        title: 'Dropdown 1',
        buttons: [],
      },
      dropdown2: {
        title: 'Dropdown 2',
        buttons: [],
      },
    });
  });
});


describe('AddButtonsToDropdown', () => {

  // Should return the same input if no buttons are provided
  it('should return the same input if no buttons are provided', () => {
    const dropdowns : Record<string, DropdownsWithButtonsProps> = {
      dropdown1: {
        buttons: [],
        title: 'dropdown1'
      },
      dropdown2: {
        buttons: [],
        title: 'dropdown2'
      }
    };
    const result = AddButtonsToDropdown(dropdowns);
    expect(result).toEqual(dropdowns);
  });

  // Should return a new object with buttons added to the corresponding dropdowns
  it('should return a new object with buttons added to the corresponding dropdowns', () => {
    const dropdowns = {
      dropdown1: {
        buttons: [],
        title: 'Dropdown 1',
      },
      dropdown2: {
        buttons: [],
        title: 'Dropdown 2'
      }
    };

    const buttons : DownloadButtonConfig[] = [
      {
        dropdownId: 'dropdown1',
        title: 'Button 1',
        enabled: true,
        type: 'csv',
        leftIcon: 'download',
        rightIcon: '',
        fileName: 'test.csv',
        tooltipText: 'test tooltip',
      },
      {
        dropdownId: 'dropdown2',
        title: 'Button 2',
        enabled: true,
        type: 'csv',
        fileName: 'test.csv',
        leftIcon: 'download',
        tooltipText: 'test tooltip',
        rightIcon: '',
      }
    ];
    const expected : Record<string, DropdownsWithButtonsProps> = {
      dropdown1: {
        buttons: [
          {
            title: 'Button 1',
            enabled: true,
            type: 'csv',
            leftIcon: 'download',
            rightIcon: '',
            fileName: 'test.csv',
            tooltipText: 'test tooltip',
          }
        ],
        title: 'Dropdown 1',
      },
      dropdown2: {
        buttons: [
          {
            title: 'Button 2',
            enabled: true,
            type: 'csv',
            fileName: 'test.csv',
            leftIcon: 'download',
            tooltipText: 'test tooltip',
            rightIcon: '',
          }
        ],
        title: 'Dropdown 2',
      }
    };
    const result = AddButtonsToDropdown(dropdowns, buttons);
    expect(result).toEqual(expected);
  });

  // Should handle a single dropdown object in the input
  it('should handle a single dropdown object in the input', () => {
    const dropdowns = {
      dropdown1: {
        buttons: [],
        title: 'Dropdown 1',
      }
    };
    const buttons : DownloadButtonConfig[] = [
      {
        dropdownId: 'dropdown1',
        title: 'Button 1',
        enabled: true,
        type: 'csv',
        fileName: 'test.csv',
      }
    ];
    const expected : Record<string, DropdownsWithButtonsProps> = {
      dropdown1: {
        buttons: [
          {
            title: 'Button 1',
            enabled: true,
            type: 'csv',
            fileName: 'test.csv',
          }
        ],
        title: 'Dropdown 1',
      }
    };
    const result = AddButtonsToDropdown(dropdowns, buttons);
    expect(result).toEqual(expected);
  });

  // Should handle a button object with dropdownId not present in the input dropdowns
  it('should handle a button object with dropdownId not present in the input dropdowns', () => {
    const dropdowns = {
      dropdown1: {
        buttons: [],
        title: 'Dropdown 1',
      },
      dropdown2: {
        buttons: [],
        title: 'Dropdown 2'
      }
    };

    const buttons : DownloadButtonConfig[] = [
      {
        dropdownId: 'dropdown3',
        title: 'Button 3',
        enabled: true,
        type: 'csv',
        fileName: 'test.csv',
      }
    ];
    const expected : Record<string, DropdownsWithButtonsProps> = {
      dropdown1: {
        buttons: [],
        title: 'Dropdown 1'
      },
      dropdown2: {
        buttons: [],
        title: 'Dropdown 2'
      }
    };
    const result = AddButtonsToDropdown(dropdowns, buttons);
    expect(result).toEqual(expected);
  });

});

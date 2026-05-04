import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Combobox,
  LoadingOverlay,
  ScrollArea,
  TextInput,
  Tooltip,
  useCombobox,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  type CoreState,
  type DataLibrary,
  DataLibraryStoreMode,
  DatasetOrCohort,
  isAuthenticated,
  selectUserAuthStatus,
  StorageOperationResults,
  useCoreSelector,
  useDataLibrary,
} from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { mergeDefaultTailwindClassnames } from '../../../utils/mergeDefaultTailwindClassnames';
import { StylingOverride } from '../../../types';
import { ActionButtonConfig } from '../../../components/Buttons/types';
import { useRouter } from 'next/router';
import { Icon } from '@iconify-icon/react';
import { extractClassName } from '../../Navigation/utils';

const STATUS_TO_MESSAGE: Record<number, string> = {
  401: 'Please log in to save to data library',
  404: 'Cannot query data library. Please try again later.',
  409: 'Selections are already saved to the list.',
};

const getNumberOfDatasets = (selected: DatasetOrCohort) =>
  Object.keys(selected).length;

const isListDifferent = (items: DatasetOrCohort, newItems: DatasetOrCohort) => {
  // test if the new items are different from the current items in the list
  const newNumberOfDatasets = getNumberOfDatasets(newItems);
  const currentNumberOfDatasets = getNumberOfDatasets(items);
  if (newNumberOfDatasets !== currentNumberOfDatasets) return true;
  return Object.keys(newItems).some(
    (key) => newItems[key].id !== items[key].id,
  );
};

type SelectOptions = Record<string, string>;

const extractIdToLabel = (data: DataLibrary): SelectOptions =>
  !data
    ? {}
    : Object.keys(data).reduce((acc: SelectOptions, id) => {
        acc[id] = data[id].name;
        return acc;
      }, {});

const buildErrorMessage = (error: StorageOperationResults): string => {
  if (STATUS_TO_MESSAGE?.[error.status]) return STATUS_TO_MESSAGE[error.status];
  return 'Error saving to data library. Please try again later.';
};
const createTooltipLabel = (
  error: StorageOperationResults | null,
  isLoggedIn: boolean,
  requiresLogin: boolean | undefined,
  numSelected: number,
  currentListName: string | undefined,
) => {
  if (!isLoggedIn && requiresLogin)
    return 'Please log in to save to data library';
  if (numSelected === 0)
    return 'Please select at least one study to save to data library';
  if (!currentListName) return "Datasets save datasets you've discovered";
  if (error) return buildErrorMessage(error);
  return 'Add selections to list';
};

export interface AddToDataLibraryComboButtonProps {
  items: DatasetOrCohort;
  buttonConfig: ActionButtonConfig;
  classNames?: StylingOverride;
  dataLibraryStoreMode?: DataLibraryStoreMode;
  isItemsLoading?: boolean;
}

const AddToDataLibraryComboButton = <T extends Record<any, any>>({
  buttonConfig,
  items,
  dataLibraryStoreMode = DataLibraryStoreMode.ApiOnly,
  classNames = {},
  isItemsLoading = false,
}: AddToDataLibraryComboButtonProps) => {
  const [selectItems, setSelectItems] = useState<SelectOptions>({});
  const [currentList, setCurrentList] = useState<string | null>(null);
  const [error, setError] = useState<StorageOperationResults | null>(null);
  const [currentListName, setCurrentListName] = useState<string>('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      setError(null);
    },
  });

  const router = useRouter();

  const gotoDataLibrary = () => {
    router.push('/DataLibrary');
  };

  const numItems = Object.keys(items).length;
  const userStatus = useCoreSelector((state: CoreState) =>
    selectUserAuthStatus(state),
  );

  const requiresLogin =
    (buttonConfig?.requiresLogin ? buttonConfig?.requiresLogin : false) ||
    dataLibraryStoreMode === DataLibraryStoreMode.ApiOnly;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (userStatus === 'pending') {
      return
    }
    const tempIsAuth = isAuthenticated(userStatus);
    if (tempIsAuth != isLoggedIn) {
      setIsLoggedIn(tempIsAuth);
    }
  }, [userStatus]);

  const isDisabled =
    error !== null ||
    numItems === 0 ||
    !currentListName ||
    (requiresLogin && !isLoggedIn);
  const tooltipLabel = createTooltipLabel(
    error,
    isLoggedIn,
    requiresLogin,
    numItems,
    currentListName,
  );
  const classNamesDefaults = {
    root: 'flex items-center justify-start',
    icon: 'rounded-s-none',
    input: 'w-full rounded-e-none',
  };

  const mergedClassnames = mergeDefaultTailwindClassnames(
    classNamesDefaults,
    classNames,
  );

  const {
    dataLibrary,
    updateListInDataLibrary,
    addListToDataLibrary,
    isLoading,
    isUpdating,
    error: dataLibraryError,
  } = useDataLibrary({ storageMode: dataLibraryStoreMode });

  const numLists = Object.keys(dataLibrary ?? {}).length;

  const saveToList = (
    listname: string,
    listId: string | undefined = undefined,
  ) => {
    if (numItems === 0) return;

    if (Object.keys(items).length === 0) {
      notifications.show({
        id: 'update-datalibrary-no-items-to-update-notification',
        position: 'top-center',
        withCloseButton: true,
        autoClose: 5000,
        title: 'Save to list',
        message: `No data objects selected to save to list ${listname}.`,
        loading: false,
      });
      return;
    }

    if (listId) {
      // updating list

      const isDifferent = isListDifferent(dataLibrary[listId].items, items);
      if (!isDifferent) {
        notifications.show({
          id: 'update-datalibrary-list-no-changes-notification',
          position: 'top-center',
          withCloseButton: true,
          autoClose: 5000,
          title: 'Save to list',
          message: `No changes to list ${listname}.`,
          loading: isUpdating !== null,
        });
        return;
      }

      updateListInDataLibrary({
        id: listId,
        name: listname,
        items: { ...dataLibrary[listId].items, ...items },
      }).then((results) => {
        if (results.isError) {
          notifications.show({
            id: 'update-datalibrary-list-error-notification',
            position: 'top-center',
            withCloseButton: true,
            autoClose: 5000,
            title: 'Save to list',
            message: `Error saving to list ${listname}: ${results.message}`,
            loading: isUpdating !== null,
          });
        } else
          notifications.show({
            id: 'update-datalibrary-list-notification',
            position: 'top-center',
            withCloseButton: true,
            autoClose: 5000,
            title: 'Save to list',
            message: `${Object.values(items).length} datasets saved to list ${listname}.`,
            loading: isUpdating !== null,
          });
      });
    } else {
      addListToDataLibrary(items, listname).then((results) => {
        if (results.isError) {
          notifications.show({
            id: 'update-datalibrary-list-error-notification',
            position: 'top-center',
            withCloseButton: true,
            autoClose: 5000,
            title: 'Save to list',
            message: `Error saving to list ${listname}: ${results.message}`,
            loading: isUpdating !== null,
          });
          setCurrentListName('');
          setCurrentList(null);
        } else {
          notifications.show({
            id: 'update-datalibrary-list-notification',
            position: 'top-center',
            withCloseButton: true,
            autoClose: 5000,
            title: 'Save to list',
            message: `${Object.values(items).length} datasets saved to list ${listname}.`,
            loading: isLoading || !!isUpdating,
          });
        }
      });
    }
  };

  const exactOptionMatch = Object.values(selectItems).some(
    (listName) => listName === currentListName,
  );
  const filteredOptions = exactOptionMatch
    ? selectItems
    : Object.entries(selectItems).reduce((acc, [listId, listName]) => {
        if (
          listName.toLowerCase().includes(currentListName.toLowerCase().trim())
        ) {
          acc[listId] = listName;
        }
        return acc;
      }, {} as SelectOptions);

  const options = useMemo(
    () =>
      Object.entries(filteredOptions).map(([listId, listName]) => (
        <Combobox.Option value={listId} key={listId}>
          {listName}
        </Combobox.Option>
      )),
    [filteredOptions],
  );

  useEffect(() => {
    if (options.length === 0) setCurrentList(null);
  }, [options]);

  useDeepCompareEffect(() => {
    if (dataLibrary)
      if (!dataLibraryError) {
        const listItems = extractIdToLabel(dataLibrary);
        setSelectItems(listItems);
      } else {
        setError(dataLibraryError);
      }
  }, [dataLibrary, dataLibraryError]);

  return (
    <div data-testid="add-to-data-library" className={mergedClassnames.root}>
      <Combobox
        onOptionSubmit={(selectedValue) => {
          setCurrentList(selectedValue);
          setCurrentListName(selectItems[selectedValue]);
          combobox.closeDropdown();
        }}
        store={combobox}
        withinPortal={false}
      >
        <Combobox.Target>
          <TextInput
            placeholder={numLists > 0 ? 'Select/Search' : 'Create List'}
            value={currentListName ?? ''}
            classNames={{ input: mergedClassnames.input }}
            onChange={(event) => {
              setCurrentListName(event.currentTarget.value);
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSection={<Combobox.Chevron />}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            <ScrollArea.Autosize mah={200} type="scroll">
              {options.length === 0 ? (
                <Combobox.Empty>Click button to create new list</Combobox.Empty>
              ) : (
                options
              )}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Tooltip label="Open Data Library">
        <ActionIcon
          size="lg"
          onClick={gotoDataLibrary}
          color="secondary.4"
          className={extractClassName('icon', mergedClassnames)}
        >
          <Icon
            icon="gen3:external-link"
            width={24}
            height={24}
            className={extractClassName('icon', mergedClassnames)}
          />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={tooltipLabel}>
        <Button
          color="secondary.4"
          classNames={{ root: 'w-1/3 ml-2' }}
          loading={isLoading || !!isUpdating}
          disabled={isDisabled}
          onClick={() => {
            if (currentList) {
              saveToList(selectItems[currentList], currentList);
            } else {
              saveToList(currentListName, undefined);
            }
          }}
        >
          {numLists === 0 ||
          (options.length === 0 && currentListName.length > 0)
            ? 'New List'
            : 'Add to List'}
        </Button>
      </Tooltip>
      <div className="flex items-center relative">
        <LoadingOverlay
          loaderProps={{ color: 'accent.4', size: 'sm' }}
          visible={isLoading || isItemsLoading  || !!isUpdating}
        />
        <Badge
          className="ml-2 max-w-48"
          variant="light"
          color="secondary.4"
          size="xl"
          radius="md"
          fullWidth
        >
          <span
            className="flex items-center justify-center gap-1"
            data-testid="num-items-badge"
          >
            {numItems} Datasets
          </span>
        </Badge>
      </div>
    </div>
  );
};

export default AddToDataLibraryComboButton;

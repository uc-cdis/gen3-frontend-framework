import React, { useEffect } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import {
  MdFlip as FlipIcon,
  MdSearch as SearchIcon,
  MdClose as CloseIcon,
  MdExpandLess as ExpandLessIcon,
  MdExpandMore as ExpandMoreIcon,
} from 'react-icons/md';
import { FaUndo as UndoIcon } from 'react-icons/fa';
import { fieldNameToTitle } from '@gen3/core';
import {
  FacetIconButton,
  controlsIconStyle,
  FacetText,
  FacetHeader,
} from './components';
import { FacetCardProps, FacetCommonHooks } from './types';
import { Icon } from '@iconify/react';

type FacetHeaderProps = Pick<
  FacetCardProps<FacetCommonHooks>,
  | 'field'
  | 'description'
  | 'hooks'
  | 'facetName'
  | 'showSearch'
  | 'showFlip'
  | 'dismissCallback'
  | 'isFacetView'
  | 'header'
  | 'sharedWithIndices'
> & {
  showSettings?: boolean;
  showClearSelection?: boolean;
  toggleFlip?: () => void;
  toggleSearch?: () => void;
  toggleSettings?: () => void;
};

/**
 * Component for the common controls on the header of different type facet cards
 * @param field - filter this FacetCard manages
 * @param description - describes information about the facet
 * @param hooks - object defining the hooks required by this facet component
 * @param facetName - name of the Facet in human-readable form
 * @param showSettings - show filter settings AND/OR
 * @param showSearch - if the search icon show be displayed
 * @param showFlip - if the flip icon should be displayed
 * @param showClearSelection - if the clear selection icon should be displayed
 * @param isFacetView - if the facet selection view (and not the chart view) is displayed
 * @param toggleSettings - toggle is setting button is visible
 * @param toggleFlip - function to switch the facet/chart view
 * @param toggleSearch - function to switch if the search bart is displayed
 * @param dismissCallback - if facet can be removed, supply a function which will ensure the "dismiss" control will be visible
 * @param sharedWithIndices
 * @param header - object containing the display components to use for the header
 */
const FacetControlsHeader = ({
  field,
  description,
  hooks,
  facetName,
  showSettings = true,
  showSearch = false,
  showFlip = false,
  showClearSelection = true,
  isFacetView = false,
  toggleSettings = undefined,
  toggleFlip = undefined,
  toggleSearch = undefined,
  dismissCallback = undefined,
  sharedWithIndices = undefined,
  header = {
    Panel: FacetHeader,
    Label: FacetText,
    iconStyle: controlsIconStyle,
  },
}: FacetHeaderProps) => {
  const clearFilters = hooks.useClearFilter();
  const isFilterExpanded =
    hooks?.useFilterExpanded && hooks.useFilterExpanded(field);
  const toggleExpandFilter =
    hooks?.useToggleExpandFilter && hooks.useToggleExpandFilter();

  useEffect(() => {
    // Initialize filter as expanded
    if (isFilterExpanded === undefined && toggleExpandFilter) {
      toggleExpandFilter(field, true);
    }
  }, [field, isFilterExpanded, toggleExpandFilter]);

  return (
    <header.Panel>
      <div className="flex flex-row items-center">
        {toggleExpandFilter && (
          <Tooltip label={isFilterExpanded ? 'Collapse card' : 'Expand card'}>
            <ActionIcon
              variant="subtle"
              onClick={() => {
                toggleExpandFilter(field, !isFilterExpanded);
              }}
              className="mt-0.5 -ml-1.5"
              aria-expanded={isFilterExpanded}
              aria-label={isFilterExpanded ? 'Collapse card' : 'Expand card'}
            >
              {isFilterExpanded ? (
                <ExpandLessIcon
                  size="3em"
                  className={header.iconStyle}
                  aria-hidden="true"
                />
              ) : (
                <ExpandMoreIcon
                  size="3em"
                  className={header.iconStyle}
                  aria-hidden="true"
                />
              )}
            </ActionIcon>
          </Tooltip>
        )}
        {sharedWithIndices && (
          <Tooltip label="Shared with indices">
            <Icon
              icon="gen3:share"
              className={header.iconStyle}
              width={12}
              height={12}
            />
          </Tooltip>
        )}
        <Tooltip
          label={description}
          position="bottom-start"
          multiline
          w={220}
          withArrow
          transitionProps={{ duration: 200, transition: 'fade' }}
          disabled={!description}
        >
          <header.Label>
            {facetName ? facetName : fieldNameToTitle(field)}
          </header.Label>
        </Tooltip>
      </div>
      <div className="flex flex-row">
        {showSettings ? (
          <Tooltip label="Filter Settings">
            <FacetIconButton
              onClick={() => {
                if (toggleExpandFilter) toggleExpandFilter(field, true);
                if (toggleSettings) toggleSettings();
              }}
              aria-label="Search"
            >
              <Icon
                width={12}
                height={12}
                icon="gen3:settings"
                aria-hidden="true"
              />
            </FacetIconButton>
          </Tooltip>
        ) : null}
        {showSearch ? (
          <Tooltip label="Search values">
            <FacetIconButton
              onClick={() => {
                if (toggleExpandFilter) toggleExpandFilter(field, true);
                if (toggleSearch) toggleSearch();
              }}
              aria-label="Search"
            >
              <SearchIcon
                size="1.45em"
                className={header.iconStyle}
                aria-hidden="true"
              />
            </FacetIconButton>
          </Tooltip>
        ) : null}
        {showFlip ? (
          <Tooltip label={isFacetView ? 'Chart view' : 'Selection view'}>
            <FacetIconButton
              onClick={() => {
                if (toggleExpandFilter) toggleExpandFilter(field, true);
                if (toggleFlip) toggleFlip();
              }}
              aria-pressed={!isFacetView}
              aria-label={isFacetView ? 'Chart view' : 'Selection view'}
            >
              <FlipIcon
                size="1.45em"
                className={header.iconStyle}
                aria-hidden="true"
              />
            </FacetIconButton>
          </Tooltip>
        ) : null}
        {showClearSelection && (
          <Tooltip label="Clear selection">
            <FacetIconButton
              onClick={() => clearFilters(field)}
              aria-label="clear selection"
            >
              <UndoIcon
                size="1.0em"
                className={header.iconStyle}
                aria-hidden="true"
              />
            </FacetIconButton>
          </Tooltip>
        )}
        {dismissCallback ? (
          <Tooltip label="Remove the facet">
            <FacetIconButton
              onClick={() => {
                dismissCallback(field);
              }}
              aria-label="Remove the facet"
            >
              <CloseIcon
                size="1.25em"
                className={header.iconStyle}
                aria-hidden="true"
              />
            </FacetIconButton>
          </Tooltip>
        ) : null}
      </div>
    </header.Panel>
  );
};

export default FacetControlsHeader;

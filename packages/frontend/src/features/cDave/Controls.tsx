import React, { useState } from 'react';
import { ActionIcon, Collapse, Highlight, Input, Switch, Tooltip, } from '@mantine/core';
import { createKeyboardAccessibleFunction } from '../../utils/keyboardAccessible';
import { toDisplayName } from './utils';
import FacetExpander from '../../components/facets/FacetExpander';
import { ClinicalDataFacet, ClinicalDataTab } from './types';
import { useDeepCompareCallback, useDeepCompareEffect, useDeepCompareMemo, } from 'use-deep-compare';
import { CloseIcon, DoubleLeftIcon, DoubleRightIcon, DownArrowIcon, SearchIcon, UpArrowIcon, } from './icons';

interface ControlGroupProps {
  name: string;
  fields: ClinicalDataFacet[];
  updateFields: (field: string) => void;
  activeFields: string[];
  searchTerm?: string;
  color: string;
}

const ControlGroup: React.FC<Readonly<ControlGroupProps>> = ({
  name,
  fields,
  updateFields,
  activeFields,
  searchTerm,
  color,
}) => {
  const [groupOpen, setGroupOpen] = useState(true);
  const [fieldsCollapsed, setFieldsCollapsed] = useState(true);

  const allFields = useDeepCompareMemo(
    () => fields.map((f) => f.field),
    [fields],
  );

  const filteredFields = useDeepCompareMemo(() => {
    if (!searchTerm) return fields;
    return fields.filter(
      (f) =>
        f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        toDisplayName(f.field).toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, fields]);

  const visibleFields = useDeepCompareMemo(
    () => (fieldsCollapsed ? filteredFields.slice(0, 5) : filteredFields),
    [fieldsCollapsed, filteredFields],
  );

  return filteredFields.length > 0 ? (
    <div className="mb-4 last:mb-0">
      <span
        onClick={() => setGroupOpen(!groupOpen)}
        onKeyDown={createKeyboardAccessibleFunction(() =>
          setGroupOpen(!groupOpen),
        )}
        tabIndex={0}
        role="button"
        className="text-sm xl:text-[1rem] text-primary-contrast cursor-pointer bg-primary-darker font-heading font-semibold flex items-center p-2 sticky top-0 z-10"
        aria-controls={`cdave-control-group-${name}`}
        aria-expanded={groupOpen}
      >
        {groupOpen ? (
          <UpArrowIcon aria-hidden="true" size={24} />
        ) : (
          <DownArrowIcon aria-hidden="true" size={24} />
        )}{' '}
        {name}
      </span>
      <Collapse
        in={groupOpen}
        id={`cdave-control-group-${name}`}
        className="border-1 border-base-lighter rounded-b-md"
      >
        <div className="flex flex-col">
          <ul className="bg-base-max text-md">
            {visibleFields.map((field) => (
              <FieldControl
                key={field.field}
                facet={field}
                updateFields={updateFields}
                activeFields={activeFields}
                defaultFields={allFields}
                searchTerm={searchTerm}
                fieldColor={color}
              />
            ))}
          </ul>
          <div className="text-sm">
            <FacetExpander
              remainingValues={filteredFields.length - 5}
              isGroupExpanded={!fieldsCollapsed}
              onShowChanged={() => setFieldsCollapsed(!fieldsCollapsed)}
            />
          </div>
        </div>
      </Collapse>
    </div>
  ) : null;
};

interface FieldControlProps {
  facet: ClinicalDataFacet;
  updateFields: (field: string) => void;
  activeFields: string[];
  defaultFields: string[];
  searchTerm?: string;
  fieldColor: string;
}

const FieldControl: React.FC<Readonly<FieldControlProps>> = ({
  facet,
  updateFields,
  activeFields,
  searchTerm = '',
  fieldColor,
  defaultFields,
}) => {
  const [checked, setChecked] = useState(defaultFields.includes(facet.field));

  useDeepCompareEffect(() => {
    setChecked(activeFields.includes(facet.field));
  }, [activeFields, facet.field]);

  const displayName = toDisplayName(facet.field);
  const handleChange = useDeepCompareCallback(
    (e: any) => {
      setChecked(e.currentTarget.checked);
      updateFields(facet.field);
    },
    [facet.field, updateFields],
  );

  return (
    <li data-testid={`row-field-${displayName}-cdave`} className="px-2">
      <Switch
        label={
          searchTerm ? (
            <Highlight highlight={searchTerm}>{displayName}</Highlight>
          ) : (
            <Tooltip
              label={facet?.description || 'No description available'}
              withArrow
              w={200}
              multiline
              zIndex={15}
            >
              <div>{displayName}</div>
            </Tooltip>
          )
        }
        labelPosition="left"
        color={fieldColor}
        classNames={{
          root: 'py-1',
          body: 'flex justify-between items-center',
          label: 'cursor-pointer text-sm text-black font-content font-medium',
          track: `cursor-pointer`,
        }}
        checked={checked}
        onChange={handleChange}
      />
      {searchTerm && (
        <Highlight highlight={searchTerm}>{facet?.description || ''}</Highlight>
      )}
    </li>
  );
};

interface ControlPanelProps {
  readonly updateFields: (field: string) => void;
  readonly fieldsWithData: string[];
  readonly activeFields: string[];
  readonly controlsExpanded: boolean;
  readonly setControlsExpanded: (expanded: boolean) => void;
  tabs: Array<ClinicalDataTab>;
}

const Controls: React.FC<ControlPanelProps> = ({
  updateFields,
  fieldsWithData,
  activeFields,
  controlsExpanded,
  setControlsExpanded,
  tabs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const facets = useDeepCompareMemo(
    () =>
      tabs.reduce(
        (acc: ClinicalDataFacet[], tab) => [...acc, ...tab.facets],
        [],
      ),
    [tabs],
  );

  return (
    <div
      className={`${
        controlsExpanded
          ? 'min-w-[14rem] w-3/12 max-w-[23rem] flex-shrink-0 flex flex-col min-h-[560px] max-h-screen'
          : ''
      }`}
    >
      <Tooltip
        withArrow
        withinPortal
        offset={-2}
        label={controlsExpanded ? 'Hide Control Panel' : 'Show Control Panel'}
      >
        <ActionIcon
          onClick={() => setControlsExpanded(!controlsExpanded)}
          aria-label="Collapse/Expand controls"
          aria-controls="cdave-control-panel"
          aria-expanded={controlsExpanded}
          className="text-accent"
          variant="subtle"
        >
          {controlsExpanded ? (
            <DoubleLeftIcon size="24" aria-hidden="true" />
          ) : (
            <DoubleRightIcon size="24" naria-hidden="true" />
          )}
        </ActionIcon>
      </Tooltip>
      <div
        className={controlsExpanded ? 'block' : 'hidden'}
        id="cdave-control-panel"
        data-testid="cdave-control-panel"
      >
        <Input
          data-testid="textbox-cdave-search-bar"
          placeholder="Search"
          className="py-2"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          rightSectionPointerEvents="all"
          leftSection={<SearchIcon size={24} />}
          rightSection={
            searchTerm && (
              <ActionIcon onClick={() => setSearchTerm('')} variant="subtle">
                <CloseIcon aria-label="clear search" />
              </ActionIcon>
            )
          }
          aria-label="Search fields"
        />

        <p data-testid="text-fields-with-values" className="p-2 font-heading">
          <strong>{fieldsWithData.length}</strong> of{' '}
          <strong>{facets.length}</strong> fields with values
        </p>
        <div className="max-h-screen overflow-y-auto border-t-1 border-b-1 border-base-lighter rounded-b-md rounded-t-md">
          {tabs.map((tab) => (
            <ControlGroup
              name={tab.label}
              fields={tab.facets}
              updateFields={updateFields}
              activeFields={activeFields}
              searchTerm={searchTerm}
              key={tab.label}
              color={tab.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Controls;

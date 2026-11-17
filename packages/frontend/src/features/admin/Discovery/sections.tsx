import React, { type ReactElement, type ReactNode } from 'react';
import { Accordion, ColorInput, Group, SimpleGrid, Stack } from '@mantine/core';
import { DiscoveryCellRendererFactory } from '../../Discovery/DiscoveryTable/TableRenderers/CellRendererFactory';
import {
  ArrayEditor,
  JsonField,
  NumberField,
  SelectField,
  StringListField,
  SwitchField,
  TextField,
  useConfigValue,
} from './fields';
import type { ConfigPath } from './configPath';
import { getIn } from './configPath';

const Section = ({
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children: ReactNode;
}): ReactElement => (
  <Accordion.Item value={value}>
    <Accordion.Control>{label}</Accordion.Control>
    <Accordion.Panel>
      <Stack gap="sm">{children}</Stack>
    </Accordion.Panel>
  </Accordion.Item>
);

const titleOf = (item: unknown, index: number, fallback: string): string => {
  const name = getIn(item, ['name']) ?? getIn(item, ['categoryDisplayName']);
  const field = getIn(item, ['field']);
  if (typeof name === 'string' && name) {
    return typeof field === 'string' && field ? `${name} — ${field}` : name;
  }
  return `${fallback} ${index + 1}`;
};

/* ---------------------------- General ----------------------------- */

const GeneralSection = (): ReactElement => (
  <Section value="general" label="General">
    <SimpleGrid cols={2} spacing="xs">
      <TextField
        path={['label']}
        label="Tab label"
        description="Shown when there are multiple indexes"
      />
      <TextField
        path={['guidType']}
        label="GUID type"
        placeholder="discovery_metadata"
      />
      <TextField
        path={['studyField']}
        label="Study field"
        placeholder="gen3_discovery"
      />
      <NumberField path={['maxStudies']} label="Max studies" />
      <SelectField
        path={['tabType']}
        label="Tab style"
        data={['pills', 'outline']}
      />
      <SelectField
        path={['features', 'dataLoader', 'sortingAndPagination']}
        label="Sorting & pagination"
        data={['client', 'server']}
      />
    </SimpleGrid>
    <SwitchField
      path={['features', 'pageTitle', 'enabled']}
      label="Show page title"
    />
    <TextField path={['features', 'pageTitle', 'text']} label="Page title" />
    <Group>
      <SwitchField
        path={['tableConfig', 'selectableRows']}
        label="Selectable rows"
      />
      <SwitchField
        path={['tableConfig', 'expandableRows']}
        label="Expandable rows"
      />
      <SwitchField path={['features', 'aiSearch']} label="AI search" />
    </Group>
  </Section>
);

/* ---------------------------- Search ------------------------------ */

const SearchSection = ({ fields }: { fields: string[] }): ReactElement => (
  <Section value="search" label="Search">
    <SwitchField
      path={['features', 'search', 'searchBar', 'enabled']}
      label="Keyword search bar"
    />
    <SimpleGrid cols={2} spacing="xs">
      <TextField
        path={['features', 'search', 'searchBar', 'inputSubtitle']}
        label="Subtitle"
      />
      <TextField
        path={['features', 'search', 'searchBar', 'placeholder']}
        label="Placeholder"
      />
    </SimpleGrid>
    <StringListField
      path={['features', 'search', 'searchBar', 'searchableTextFields']}
      label="Searchable text fields"
      suggestions={fields}
    />
    <SwitchField
      path={['features', 'search', 'tagSearchDropdown', 'enabled']}
      label="Tag search dropdown"
    />
    <TextField
      path={[
        'features',
        'search',
        'tagSearchDropdown',
        'collapsibleButtonText',
      ]}
      label="Dropdown button text"
    />
    <StringListField
      path={['features', 'search', 'tagSearchDropdown', 'categoryTypes']}
      label="Category types"
    />
  </Section>
);

/* ------------------------- Authorization -------------------------- */

const AUTHZ_VALUES = ['accessible', 'unaccessible', 'pending', 'notAvailable'];

const AuthorizationSection = (): ReactElement => (
  <Section value="authz" label="Data access / authorization">
    <Group>
      <SwitchField
        path={['features', 'authorization', 'enabled']}
        label="Show access column"
      />
      <SwitchField
        path={['features', 'authorization', 'isMesh']}
        label="Mesh"
      />
    </Group>
    <TextField
      path={['features', 'authorization', 'columnTooltip']}
      label="Column tooltip"
    />
    {AUTHZ_VALUES.map((v) => (
      <Group key={v} grow align="flex-end">
        <SwitchField
          path={['features', 'authorization', 'supportedValues', v, 'enabled']}
          label={v}
        />
        <TextField
          path={['features', 'authorization', 'supportedValues', v, 'menuText']}
          label="Menu text"
        />
      </Group>
    ))}
  </Section>
);

/* ------------------------- Field mapping -------------------------- */

const FieldMappingSection = ({
  fields,
}: {
  fields: string[];
}): ReactElement => (
  <Section value="mapping" label="Field mapping">
    <SimpleGrid cols={2} spacing="xs">
      <SelectField
        allowCustom
        data={fields}
        path={['minimalFieldMapping', 'uid']}
        label="Unique id field"
      />
      <SelectField
        allowCustom
        data={fields}
        path={['minimalFieldMapping', 'authzField']}
        label="Authz field"
      />
      <SelectField
        allowCustom
        data={fields}
        path={['minimalFieldMapping', 'tagsListField']}
        label="Tags list field"
      />
      <SelectField
        allowCustom
        data={fields}
        path={['minimalFieldMapping', 'dataAvailabilityField']}
        label="Data availability field"
      />
    </SimpleGrid>
  </Section>
);

/* ------------------------- Study columns -------------------------- */

const ColumnRendererFields = ({ path }: { path: ConfigPath }): ReactElement => {
  const renderers = DiscoveryCellRendererFactory.getRegisteredRenderers();
  const [contentType] = useConfigValue<string>([...path, 'contentType']);
  const fnNames = (contentType && renderers[contentType]) || ['default'];
  return (
    <SimpleGrid cols={2} spacing="xs">
      <SelectField
        allowCustom
        data={Object.keys(renderers)}
        path={[...path, 'contentType']}
        label="Content type"
      />
      <SelectField
        allowCustom
        data={fnNames}
        path={[...path, 'cellRenderFunction']}
        label="Cell renderer"
      />
    </SimpleGrid>
  );
};

const StudyColumnsSection = ({
  fields,
}: {
  fields: string[];
}): ReactElement => (
  <Section value="columns" label="Table columns">
    <ArrayEditor
      path={['studyColumns']}
      label="Study columns"
      description="Order here is the column order in the table"
      newItem={() => ({ name: 'New column', field: '', contentType: 'string' })}
      itemTitle={(item, i) => titleOf(item, i, 'Column')}
      renderItem={(p) => (
        <>
          <SimpleGrid cols={2} spacing="xs">
            <TextField path={[...p, 'name']} label="Header" />
            <SelectField
              allowCustom
              data={fields}
              path={[...p, 'field']}
              label="Field"
            />
          </SimpleGrid>
          <ColumnRendererFields path={p} />
          <SimpleGrid cols={2} spacing="xs">
            <TextField
              path={[...p, 'valueIfNotAvailable']}
              label="Value if not available"
            />
          </SimpleGrid>
          <Group>
            <SwitchField
              path={[...p, 'errorIfNotAvailable']}
              label="Error if not available"
            />
            <SwitchField path={[...p, 'sortable']} label="Sortable" />
          </Group>
          <JsonField
            path={[...p, 'params']}
            label="Renderer params (JSON)"
            minRows={2}
          />
        </>
      )}
    />
  </Section>
);

/* ------------------------- Study preview -------------------------- */

const StudyPreviewSection = ({
  fields,
}: {
  fields: string[];
}): ReactElement => (
  <Section value="preview" label="Row preview">
    <SimpleGrid cols={2} spacing="xs">
      <TextField path={['studyPreviewField', 'name']} label="Name" />
      <SelectField
        allowCustom
        data={fields}
        path={['studyPreviewField', 'field']}
        label="Field"
      />
      <TextField
        path={['studyPreviewField', 'contentType']}
        label="Content type"
      />
      <TextField
        path={['studyPreviewField', 'valueIfNotAvailable']}
        label="Value if not available"
      />
    </SimpleGrid>
    <Group>
      <SwitchField
        path={['studyPreviewField', 'includeLabel']}
        label="Include label"
      />
      <SwitchField
        path={['studyPreviewField', 'includeIfNotAvailable']}
        label="Include if not available"
      />
    </Group>
  </Section>
);

/* -------------------------- Aggregations -------------------------- */

const AggregationsSection = ({
  fields,
}: {
  fields: string[];
}): ReactElement => (
  <Section value="aggregations" label="Summary statistics">
    <ArrayEditor
      path={['aggregations']}
      label="Aggregations"
      newItem={() => ({ name: 'New statistic', field: '', type: 'count' })}
      itemTitle={(item, i) => titleOf(item, i, 'Aggregation')}
      renderItem={(p) => (
        <SimpleGrid cols={2} spacing="xs">
          <TextField path={[...p, 'name']} label="Label" />
          <SelectField
            allowCustom
            data={fields}
            path={[...p, 'field']}
            label="Field"
          />
          <SelectField
            data={['count', 'sum']}
            path={[...p, 'type']}
            label="Type"
          />
          <TextField
            path={[...p, 'displayFunction']}
            label="Display function"
          />
        </SimpleGrid>
      )}
    />
  </Section>
);

/* ------------------------------ Tags ------------------------------ */

const TagColorField = ({ path }: { path: ConfigPath }): ReactElement => {
  const [value, setValue] = useConfigValue<string>(path);
  return (
    <ColorInput
      size="xs"
      label="Color"
      value={value ?? ''}
      onChange={(v) => setValue(v || undefined)}
    />
  );
};

const TagsSection = (): ReactElement => (
  <Section value="tags" label="Tags">
    <SwitchField path={['tags', 'showUnknownTags']} label="Show unknown tags" />
    <ArrayEditor
      path={['tags', 'tagCategories']}
      label="Tag categories"
      newItem={() => ({
        name: 'New category',
        color: '#3b82f6',
        display: true,
      })}
      itemTitle={(item, i) => titleOf(item, i, 'Category')}
      renderItem={(p) => (
        <>
          <SimpleGrid cols={2} spacing="xs">
            <TextField
              path={[...p, 'name']}
              label="Name (matches tag category)"
            />
            <TextField path={[...p, 'displayName']} label="Display name" />
            <TagColorField path={[...p, 'color']} />
          </SimpleGrid>
          <SwitchField path={[...p, 'display']} label="Display" />
        </>
      )}
    />
  </Section>
);

/* ------------------------- Advanced (JSON) ------------------------ */

const AdvancedSection = (): ReactElement => (
  <Section value="advanced" label="Advanced (JSON)">
    <JsonField
      path={['features', 'advSearchFilters']}
      label="Advanced search filters"
    />
    <JsonField
      path={['features', 'exportFromDiscovery']}
      label="Export from discovery (action buttons)"
    />
    <JsonField path={['features', 'chartsSection']} label="Charts section" />
    <JsonField path={['simpleDetailsView']} label="Simple details view" />
    <JsonField path={['detailView']} label="Tabbed detail view" />
    <JsonField path={['exportToWorkspace']} label="Export to workspace" />
  </Section>
);

/* ----------------------------------------------------------------- */

export const IndexConfigForm = ({
  fields,
}: {
  fields: string[];
}): ReactElement => (
  <Accordion multiple defaultValue={['general']} variant="separated">
    <GeneralSection />
    <SearchSection fields={fields} />
    <StudyColumnsSection fields={fields} />
    <StudyPreviewSection fields={fields} />
    <AggregationsSection fields={fields} />
    <TagsSection />
    <AuthorizationSection />
    <FieldMappingSection fields={fields} />
    <AdvancedSection />
  </Accordion>
);

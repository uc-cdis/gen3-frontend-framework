# Setting up custom Table Details renderer

The explorer table details modal allows for modal showing row details when that row is clicked. The modal is a wrapper around a
custom React component. The component is registered with the ExplorerTableDetailsFactory. The steps use an
example Details Panel in the `sampleApplication`

## Creating the Custom component

In `packages/sampleCommons/src/lib/CohortBuilder` create a file called `FileDetailsPanel.tsx`

The structure of the component is:

```typescript
export const FileDetailsPanel = ({
                                   id,
                                   index,
                                   tableConfig,
                                   onClose,
                                 }: TableDetailsPanelProps) => {
```

The panel props are:

* `id`  - of the selected item which is the `idField` value from `tableConfig`
* `index` - guppy index of the table
* `tableConfig` - the table's config object
* `onClose` - optional function used to close the dialog

Next we get the `idField` from `TableConfig`:

```typescript
 const idField = tableConfig.detailsConfig?.idField;
```

Next we use the generic guppy query hook to construct a query: in this case just get the row's fields from guppy using
the passed id.

 ```typescript
 const { data, isLoading, isError } = useGeneralGQLQuery({
  query: `query ($filter: JSON) {
        ${index} (filter: $filter,  accessibility: all) {
        ${tableConfig.fields}
        }
      }`,
  variables: {
    filter: {
      AND: [
        {
          IN: {
            [idField ?? 0]: [id],
          },
        },
      ],
    },
  },
});
 ```

As this is a RTKQuery hook,  `data, isLoading, isError` are updated as the data is fetched.

Next we handle any errors:

```typescript

// handle misconfiguration
if (!idField || idField === null) {
  return (
    <ErrorCard message = { 'idField not configure in Tables Details Config' }
  />
)
  ;
}
// show data error if graphql fails
if (isError) {
  return <ErrorCard message = { 'Error occurred while fetching data' }
  />;
}
```

Then transform/extract the data since ```useGeneralGQLQuery``` returns the data as JSON without any additional processing. This means
transforming the data happens in this component.

```typescript
const queryData = isQueryResponse(data) ? extractData(data, index) : {};
```

The next code basically extract the data into table rows. If the field is ```object_id``` the row value is
a ```Anchor``` otherwise it ```Text```

```TSX
// create the rows for the table
  const rows = Object.entries(queryData).map(([field, value]) => (
    <tr key={field}>
      <td>
        <Text weight="bold">{field}</Text>
      </td>
      <td>
        {/*
          if field is one that we want a link for make it an Anchor otherwise
          render as text.
         */}
        {field === 'object_id' ? (
          <Anchor
            href={`${GEN3_FENCE_API}/user/data/download/${
              value ? (value as string) : ''
            }?redirect=true`}
            target="_blank"
          >
            {value ? (value as string) : ''}
          </Anchor>
        ) : (
          <Text>{value ? (value as string) : ''}</Text>
        )}
      </td>
    </tr>
  ));
```

Finally, render the table and a copy and Close button (which will call ```onClose``` if it's defined):

```tsx
return (
  <Stack>
    <LoadingOverlay visible={isLoading} />
    <Text color="primary.4">Results for {id}</Text>
    <Table withBorder withColumnBorders>
      <thead>
      <tr>
        <th>Field</th>
        <th>Value</th>
      </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
    <Group position="right">
      <CopyButton value={JSON.stringify(queryData)} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip
            label={copied ? 'Copied' : 'Copy'}
            withArrow
            position="right"
          >
            <ActionIcon color={copied ? 'accent.4' : 'gray'} onClick={copy}>
              {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
      <Button color="accent.5" onClick={() => onClose && onClose(id)}>
        Close
      </Button>
    </Group>
  </Stack>
);
```

## Panel Registration

Once the panel is complete, is needs to be registered with a name. This name is used in the TableConfig to select it.
This allows different indexes to have a custom table details modals.

To register the panel import the ```ExplorerTableDetailsPanelFactory```:

```typescript
import { ExplorerTableDetailsPanelFactory } from '@gen3/frontend';
```

and add it to the ```tableDetails``` catalog. This is done by creating a function that adds the above panel and
possibly others to the Panel factory.

```typescript
export const registerCustomExplorerDetailsPanels = () => {
  ExplorerTableDetailsPanelFactory().registerRendererCatalog({
    // NOTE: The catalog name must be tableDetails
    tableDetails: { fileDetails: FileDetailsPanel }, // TODO: add simpler registration function that ensures the catalog name is tableDetails
  });
};
```

In ```packages/sampleCommons/src/pages/Explorer.tsx``` make sure to import and call the function:

```typescript
import { registerCustomExplorerDetailsPanels } from '@/lib/CohortBuilder/FileDetailsPanel';

registerCustomExplorerDetailsPanels();
```

## Configuring the Table Details Modal

Now that you have registered a Panel it needs to added to the Explorer index table configuration:

```json
 "table": {
"enabled": true,
"detailsConfig": {
"panel": "fileDetails",
"mode": "click",
"idField": "file_name",
"title": "File Details"
},
"fields": ["project_id", "file_name", "file_size", "object_id"]
},
```

The existence of the ```detailsConfig``` object will setup the table to show the row details. The important fields are:

* panel: string that matches a panel registered with ```ExplorerTableDetailsPanelFactory```. In this example it set to
  the panel above.
* mode: which UI interaction will show the modal. Currently, the only working value is ```"click"``` which will show the
  modal when a table row is clicked.
* idField: this is **required**, and is the name of the id field of objects in the guppy index.
* title: title of the dialog

A complete example can be found in ```packages/sampleCommons/config/gen3/explorer.json```

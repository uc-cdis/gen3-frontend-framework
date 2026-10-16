## Project Center Page Configuration Guide

The Project Center page lists projects (studies) found in the metadata service as a vertical list of tabs, with the selected project's details shown beside the list. It supports free-text search, tag and access filtering, summary statistics, and optional data export.

The page is served at `/ProjectCenter` and is configured by `config/gen3/projectCenter.json`. It reuses the Discovery page's search, filtering, statistics and data-loading features, so many settings share the same shape as the [Discovery configuration](Discovery.md).

> Only the first entry of `metadataConfig` is used. Multiple indices are not supported on this page.

### 1. Overview of Configuration Structure

```
{
  "metadataConfig": [
    {
      "features": { ... },
      "aggregations": [ ... ],
      "tags": { ... },
      "detailsView": { ... },
      "minimalFieldMapping": { ... }
    }
  ]
}
```

| Property | Purpose |
| --- | --- |
| `features` | Page title, search, advanced filters, authorization (and the optional features in section 2.b) |
| `aggregations` | Summary statistics shown above the list |
| `tags` | Tag categories listed in the tag filter dropdown |
| `detailsView` | What is displayed for the selected project |
| `minimalFieldMapping` | Field names the page relies on |

The Discovery-only settings `tableConfig`, `studyColumns` and `detailView` are **not** used by this page. The project list is not a table, and the details view is configured with `detailsView` (note the `s`).

### 2. Detailed Configuration Sections

#### a. Project list (tabs)

Each project is a tab. The tab content is not configurable and is read from these fields on each metadata record:

- the field named by `minimalFieldMapping.uid` (for example `_hdp_uid`): the tab id, used in the URL
- `study_id`: first line of the tab
- `full_name`: second line, bold
- `tags[0].name`: third line, the first tag
- an open or closed lock icon, shown when the project is accessible to the user (requires `authorization.enabled`)

##### URL behavior

- Selecting a tab updates the URL to `?tab=<uid>`, where `uid` is the value of the `minimalFieldMapping.uid` field, so a project can be linked to directly.
- With no `tab` in the URL, the first project is selected.
- When the search results change, the first project is selected automatically.
- A `tab` that matches no project shows a "Project not found" message.
- A search with no results shows a "No studies found" message and removes `tab` from the URL.

#### b. Features (`features`)

##### Page Title

- **enabled**: show the title.
- **text**: the title text.

```json
"pageTitle": { "enabled": true, "text": "Project Center" }
```

##### Search (`search`)

- **searchBar**
  - **enabled**: show the search bar.
  - **placeholder**: placeholder text.
  - **inputSubtitle**: label shown with the search input.
  - **searchableTextFields**: fields searched by keyword.
  - **searchableAndSelectableTextFields**: fields searched by keyword that the user can also choose to search in.
- **tagSearchDropdown**
  - **enabled**: show the tag filter panel and Reset button. See Tag Filter Dropdown below.
  - **collapsibleButtonText**: label of the button that opens the tag panel (default `Tag Panel`).

```json
"search": {
  "searchBar": {
    "enabled": true,
    "placeholder": "Search projects by keyword...",
    "searchableTextFields": ["study_description", "_hdp_uid"]
  }
}
```

##### Advanced Search Filters (`advSearchFilters`)

- **enabled**: show the Filters button and panel.
- **field**: field holding the filter values.
- **displayName**: label shown for the filters.
- **filters**: array of `{ "key": "<name>" }` entries, one per filter.

##### Authorization (`authorization`)

- **enabled**: turn on data-access handling. This shows the lock icon on tabs, the access banner in the details, and gates download links.
- **columnTooltip**: tooltip text for the access filter.
- **supportedValues**: which access levels are available in the access filter (`accessible`, `unaccessible`, `pending`, `notAvailable`), each with `enabled` and `menuText`.

```json
"authorization": {
  "enabled": true,
  "supportedValues": {
    "accessible": { "enabled": true, "menuText": "Available" },
    "pending": { "enabled": true, "menuText": "Pending" }
  }
}
```

##### Tag Filter Dropdown (`search.tagSearchDropdown`)

The tag filter dropdown lists tags grouped by category and filters the project list by the selected tags. It is built from the studies' tags, so it needs these settings:

1. Set `features.search.tagSearchDropdown.enabled` to `true`. `collapsibleButtonText` sets the button label (for example `Study Filters`).
2. Add the index-level `tags` block (section 2.d) with each category's `display` set to `true`.
3. Set `minimalFieldMapping.tagsListFieldName` to the field holding each record's tags. Each tag is an object with `name` and `category`.

Only categories listed in `tags.tagCategories` with `display: true` appear, and each lists the tags of that category found in the loaded studies. Selecting tags shows only the studies that have at least one of them.

##### Shared Discovery features

The page also reads these `features` entries from the Discovery configuration. They are optional and are configured exactly as described in the Discovery guide:

- **chartsSection**: collapsible charts above the list.
- **aiSearch**: AI-powered search panel.
- **exportFromDiscovery**: action buttons to export the selected records.

Keys such as `tagsColumn`, `tagsInDescription` and `exportToWorkspace` are Discovery table settings and have no effect here.

#### c. Aggregations (`aggregations`)

Summary statistics shown above the search bar. `type` is `count` (distinct values) or `sum`.

```json
"aggregations": [
  { "name": "Projects", "field": "_hdp_uid", "type": "count" }
]
```

#### d. Tags (`tags`)

Defines the categories listed in the tag filter dropdown (see Tag Filter Dropdown). This is separate from `detailsView.tags`, which only styles the badges in the details panel.

- **tagCategories**: array of categories.
  - **name**: category name, matched against each tag's `category`.
  - **displayName**: heading in the dropdown. Defaults to `name` with the first letter capitalized.
  - **color**: color used for the category.
  - **display**: must be `true` for the category to appear in the dropdown.
- **showUnknownTags**: include tags whose category is not listed (default `false`).

```json
"tags": {
  "tagCategories": [
    { "name": "Condition", "color": "#532565", "display": true },
    { "name": "Data Type", "color": "#982568", "display": true }
  ],
  "showUnknownTags": false
}
```

#### e. Details View (`detailsView`)

Controls the panel shown for the selected project.

- **header**
  - **field**: JSONPath of the field used as the project title.
  - **className**: optional CSS classes for the title.
- **dataTableFields**: rows of the label/value table on the left.
- **rightOfTableFields**: rows shown to the right of the table.
- **tags**
  - **title**: heading above the tag badges (default `Data Categories`).
  - **tagCategories**: per-category `name`, `displayName`, `color` and `display`.
  - **showUnknownTags**: show tags whose category is not listed (default `false`).
- **downloadLinks**
  - **field**: field holding the download links. Links are only shown when the user has access to the project.
- **downloadLinkFields**: `idField`, `titleField` and `descriptionField`, naming the properties of each download link.

Each entry of `dataTableFields` and `rightOfTableFields` has:

- **name**: label shown for the row.
- **field**: JSONPath of the value in the project's metadata.
- **contentType**: `link` renders the value as a link that opens in a new tab. Any other value (`string`, `paragraph`) renders as text.
- **includeIfNotAvailable**: set to `false` to hide the row when the value is missing. Otherwise the row is shown with an empty value.
- **valueIfNotAvailable**: text shown when the value is missing.

```json
"detailsView": {
  "header": { "field": "study_title" },
  "downloadLinks": { "field": "data_download_links" },
  "dataTableFields": [
    {
      "name": "Study ID",
      "field": "study_id",
      "contentType": "string",
      "includeIfNotAvailable": false
    }
  ],
  "rightOfTableFields": [
    {
      "name": "Study Description",
      "field": "study_description",
      "contentType": "paragraph",
      "includeIfNotAvailable": false,
      "valueIfNotAvailable": "No summary has been provided for this study."
    }
  ],
  "tags": {
    "title": "Data Categories",
    "tagCategories": [
      { "name": "Condition", "displayName": "Condition", "color": "#4782C3", "display": true }
    ],
    "showUnknownTags": true
  }
}
```

#### f. Minimal Field Mapping (`minimalFieldMapping`)

Fields the page needs from each record:

- **uid**: unique identifier field, used to open a project from a link.
- **authzField**: field holding the project's authorization resource path.
- **tagsListFieldName**: field holding the list of tags.
- **dataAvailabilityField**: field indicating data availability.

```json
"minimalFieldMapping": {
  "authzField": "authz",
  "tagsListFieldName": "tags",
  "dataAvailabilityField": "data_availability",
  "uid": "_hdp_uid"
}
```

### 3. Best Practices

- **Field names**: tabs read the `minimalFieldMapping.uid` field, plus `study_id`, `full_name` and `tags` directly, so make sure the metadata records provide them.
- **Details**: use `includeIfNotAvailable: false` to keep the table free of empty rows.
- **Testing**: test configuration changes in a development environment before deploying.

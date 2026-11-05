# Setting up password and authentication for pages

You can protect each page with a password and optionally enforce authorization. By default, all pages are unprotected
except Profile, Data Library, and Workspaces, which require the user to be logged in.

When a page is protected, the user is prompted for a password before viewing it; otherwise, its navigation link is
disabled or hidden.

## Configuration

The password for each page can be set in the config/gen3/authz.json file. The default configuration is:

```
{
  "routes": {
    "/DataLibrary": {
      "loginRequired": true
    },
    "/Workspace": {
      "loginRequired": true
    },
    "/Profile": {
      "loginRequired": true
    },
    "*": {
      "loginRequired": false
    }
  }
}
```

The routes object maps page paths to authentication and authorization settings for each page.
Each entry in the routes object is a key-value pair where the key is the page path and the value is an object containing
the authentication and authorization settings. If login is required for a page, the loginRequired flag is set to true;
this is optional and defaults to true even if the value is {}.

The authz entry in a route entry controls authorization to a page. For example

```
"/Workspace": {
  "loginRequired": true,
  "authz": ["/workspace"]
}
```

You can also add redirect403 to redirect the user to a custom page when they don't have access to the path; for example,
to an access request page.

```
"/Workspaces": {
  "loginRequired": true,
  "authz": ["/pages/see-workspace"],
  "redirect403": "/WorkspaceRequestAccess"
}
```

Will only allow users with the /workspace resource to view the /Workspace page. Note that the authz must be a
**resource** - not a policy or group on the user YAML. The checks look for the resource's existence in the user YAML,
not mapping information such as read/write. Support for mappings can be added, but this should be sufficient for most
use cases.

Select all can be used for directories only at the topmost level use (.\*) to select all files in a directory for a
policy example:

```
"/protectedDirectory/(.*)": {
  "loginRequired": true
}
```

See the Appendix at the bottom of the page for an example of a role, resources, and policies that you can use for all of
the frontend-framework pages (as of Jan 9, 2026).

The \* key in the routes object is used to set the default authentication and authorization settings for all pages that
do not
have a specific entry in the routes object. This is how you set the default authentication and authorization settings
for all pages.

### Protecting all pages

To protect all pages, use the \* key in the routes object and set loginRequired to true. This requires all users to log
in before they can view any page, except the Login and error pages. **Note** there is a slight performance penalty for
protecting every page.

### Protecting the Profile page

The Profile page is protected by default.

## Navigation Links

There are two options for displaying navigation links on the left side of the page.

- Show All Links: All links will be displayed, even if the user does not have access to the page. A tooltip will be
  displayed indicating if login is required. Once logged in, if the user does not have authorization to view the page, a
  tooltip will be displayed indicating that the user does not have access.
- Hide All Unavailable Links: If a user does not have access to a page, the link will not be displayed.

## Appendix: Adding page access policies to the user.yaml

### Role

Create a role that you can use to make a policy:

```
roles:
# role to enable FEF page controls
- id: page-user
  permissions:
  - id: user
    action:
      service: frontend
      method: access
```

### Resource paths

Create resource paths for the pages you want to control. If you have pages you want to control as a group, you can
create a single resource (and a single policy). What is provided below is the most refined control option, allowing you
to control access to each page. The resource path will be the resource name preceded by a /.

If you have many page resource paths, it will be more organized to make them subresources under a pages resource. If you
do this, the resource path will be the resource name preceded with /pages/.

```
resources:
# page access resources - for controlling who can see pages in configs
- name: pages
  subresources:
  - name: see-workspace
    description: allows you to see the Workspace page (does not grant access to workspace)
  - name: see-query
    description: grants access to the Query page
  - name: see-aisearch
    description: grants access to AISearch page
  - name: see-analysis
    description: grants access to the Analysis page
  - name: see-crosswalk
    description: grants access to Crosswalk page
  - name: see-dataconnections
    description: grants access to DataConnections page
  - name: see-datadictionary
    description: grants access to DataDictionary page
  - name: see-datalibrary
    description: grants access to DataLibrary page
  - name: see-explorer
    description: grants access to Explorer page
  - name: see-profile
    description: grants access to Profile page
  - name: see-submission
    description: grants access to the Submission page
  - name: see-cohortdiscovery
    description: grants access to CohortDiscovery page
  - name: see-metadatadictionary
    description: grants access to MetadataDictionary page
```

### Policies

Now that you have roles and resource paths, you can combine them to create policies you can grant to users.

```
policies:
# policies controlling access to pages
- id: see-query-page
  description: grants access to the Query page
  resource_paths: [/pages/see-query]
  role_ids: [page-user]
- id: see-workspace-page
  description: grants access to Workspace page
  resource_paths: [/pages/see-workspace]
  role_ids: [page-user]
- id: see-aisearch-page
  description: grants access to AISearch page
  resource_paths: [/pages/see-aisearch]
  role_ids: [page-user]
- id: see-analysis-page
  description: grants access to the Analysis page
  resource_paths: [/pages/see-analysis]
  role_ids: [page-user]
- id: see-crosswalk-page
  description: grants access to Crosswalk page
  resource_paths: [/pages/see-crosswalk]
  role_ids: [page-user]
- id: see-dataconnections-page
  description: grants access to DataConnections page
  resource_paths: [/pages/see-dataconnections]
  role_ids: [page-user]
- id: see-datadictionary-page
  description: grants access to DataDictionary page
  resource_paths: [/pages/see-datadictionary]
  role_ids: [page-user]
- id: see-datalibrary-page
  description: grants access to DataLibrary page
  resource_paths: [/pages/see-datalibrary]
  role_ids: [page-user]
- id: see-explorer-page
  description: grants access to Explorer page
  resource_paths: [/pages/see-explorer]
  role_ids: [page-user]
- id: see-profile-page
  description: Grants access to the Profile page
  resource_paths: [/pages/see-profile]
  role_ids: [page-user]
- id: see-submission-page
  description: grants access to the Submission page
  resource_paths: [/pages/see-submission]
  role_ids: [page-user]
- id: see-cohortdiscovery-page
  description: grants access to CohortDiscovery page
  resource_paths: [/pages/see-cohortdiscovery]
  role_ids: [page-user]
```

&nbsp;

```
- id: see-metadatadictionary-page
  description: grants access to MetadataDictionary page
  resource_paths: [/pages/see-metadatadictionary]
  role_ids: [page-user]
```

### Update the authz in the config/gen3/authz.json

Below, we have provided some examples of how to use the resources defined above in the authz.json:

```
{
  "routes": {
    "/Explorer": {
      "loginRequired": true,
      "authz": ["/pages/see-explorer"]
    },
    "/Query": {
      "loginRequired": true,
      "authz": ["/pages/see-query"]
    },
    "/Submission": {
      "loginRequired": true,
      "authz": ["/pages/see-submission"]
    },
    "/Workspace": {
      "loginRequired": true,
      "authz": ["/pages/see-workspace"]
    },
    "*": {
      "loginRequired": false
    }
  }
}
```

# Setting up authentication and authorization for pages

You can require users to log in to view a page and optionally enforce authorization. By default, all pages are
unprotected except Profile, Data Library, and Workspace, which require the user to be logged in.

When a page is protected and the user is not logged in, they are redirected to the Login page (and returned to the page
after logging in). If they are logged in but not authorized, they are shown the 403 page or redirected to the page set
in `redirect403`. Otherwise, the page's navigation link is disabled or hidden (see Navigation Links below).

## Configuration

Protection for each page is set in the config/gen3/authz.json file. The default configuration is:

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

You can also add redirect403 to redirect the user to a custom page when they are logged in but don't have access to the
path; for example, to an access request page. Without redirect403 the user sees the 403 page.

```
"/Workspaces": {
  "loginRequired": true,
  "authz": ["/pages/see-workspace"],
  "redirect403": "/WorkspaceRequestAccess"
}
```

Will only allow users with the `/pages/see-workspace` resource to view the /Workspace page.

### Using Arborist permission tuples

In Arborist a permission is the tuple (resource, service, method), not the resource path alone. A user can have
`/workspace` with only `requestor:create` ("may request access") without having workspace access. Use the object form
when the distinction matters:

```
"/Workspace": {
  "loginRequired": true,
  "authz": [{
    "resource": "/workspace",
    "service": "jupyterhub",
    "method": "access"
  }]
}
```

For simpler access control the resource string method is recommended.

Each item in `authz` is either a resource string or an object.

- **resource string** (`"/workspace"`): the user needs *any* permission (any service, any method) on that resource.
- **Object** (`{ "resource", "service", "method" }`): the user needs that specific Arborist permission on the
  resource. `service` and `method` are optional and default to `*` (any).

The check is made against the user's Arborist mapping (`/authz/mapping`), so the service and method must be granted to
the user through a policy in the user YAML. Matching rules:

- **Hierarchical resources:** a grant on `/a` covers `/a/b` and `/a/b/c` for the same service and method. Matching is by
  whole path segment: `/a` covers `/a/b` but not `/ab`. Trailing slashes are ignored and `/` covers everything.
- **Wildcards:** a granted service or method of `*` matches any required service or method.
- **Resources** must start with `/`.

### Multiple authz entries

By default, the user needs **any one** of the entries. Set `authzMatch` to `"all"` to require every entry:

```
"/Submission": {
  "loginRequired": true,
  "authz": [
    { "resource": "/programs", "service": "sheepdog", "method": "create" },
    { "resource": "/programs", "service": "sheepdog", "method": "update" }
  ],
  "authzMatch": "all"
}
```

### Sub-paths and route matching

A route also protects pages below it: `/Workspace` applies to `/Workspace/abc` (but not `/WorkspaceX`). The rule used
for a page is, in order: an exact route key, the longest route key that is a parent path, then `*`. The legacy
`/dir/(.*)` form still works (it is treated as `/dir`).

See the Appendix at the bottom of the page for an example of a role, resources, and policies that you can use for all of
the frontend-framework pages (as of Jan 9, 2026).

The \* key in the routes object is used to set the default authentication and authorization settings for all pages that
do not
have a specific entry in the routes object. This is how you set the default authentication and authorization settings
for all pages.

### Protecting all pages

To protect all pages, use the \* key in the routes object and set loginRequired to true. This requires all users to log
in before they can view any page, except the Login, 403, and 404 pages. **Note** there is a slight performance penalty for
protecting every page.

### Protecting the Profile page

The Profile page is protected by default. Logged-in users who visit the Login page are redirected to Profile.

## Navigation Links

There are two options for displaying navigation links.

- Show All Links (`false`): All links will be displayed, even if the user does not have access to the page. A tooltip
  will be displayed indicating if login is required. Once logged in, if the user does not have authorization to view
  the page, a tooltip will be displayed indicating that the user does not have access.
- Hide All Unavailable Links (`true`): Any link the user cannot currently access is not displayed. This includes links
  that require login while the user is logged out.

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

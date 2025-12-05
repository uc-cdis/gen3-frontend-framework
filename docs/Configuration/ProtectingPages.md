# Setting up password and authentication for pages

Each page can be protected with a password and optionally enforce authorization. By default, all pages are unprotected
except Profile, Data Library, and Workspaces, which require the user to be logged in.

When a page is protected, the user will be prompted for a password before being able to view the page; otherwise, it's navigation
link will either be disabled or hidden.

## Configuration

The password for each page can be set in the `config/gen3/authz,json` file. The default configuration is:
```json

{
  "enableAuthz": false,
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
The `enableAuthz` flag enables or disables authorization for pages that require it. This flag is set to `false` by default.
It only controls whether the user is prompted for a password.

The `routes` object maps page paths to authentication and authorization settings for each page.
Each entry in the `routes` object is a key-value pair where the key is the page path and the value is an object containing the
authentication and authorization settings. If login is required for a page, the `loginRequired` flag is set to `true`; this is
optional and defaults to true even if the value is `{}`.

Authorization to a page is controlled by the `authz` entry in a route entry. For example
```json
"/Workspace": {
  "loginRequired": true,
  "authz": ["/workspace"]
}
```

Will only allow users with the `/workspace` resource to view the `/Workspace` page. Not that the checks look for the existence of the resource in the user YAML, and not the mapping information, such as read/write. Support for mappings 
can be added, but this should be sufficient for most use cases. 

The `*` key in the `routes` object is used to set the default authentication and authorization settings for all pages that do not
have a specific entry in the `routes` object. This is how you set the default authentication and authorization settings for all pages.

## Navigation Links
There are two options for displaying navigation links on the left side of the page.

* Show All Links: All links will be displayed, even if the user does not have access to the page. A tooltip will be displayed indicating if login is required. Once logged in, if the user does not have authorization to view the page, a tooltip will be displayed indicating that the user does not have access.
* Hide All Unavailable Links: If a user does not have access to a page, the link will not be displayed.

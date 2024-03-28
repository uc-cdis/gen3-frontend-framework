# Configuring Gen3 Portal

## Overview

Various applications (or pages) in the Gen3 Frontend require configuration.
This configuration is stored in the `config` directory.

### Configuration Files

#### Site Configuration
Top level configuration is stored in .env files. These files contain the following fields:

```bash
# The name of the commons. This is used to determine the commons-specific configuration to use.
# For example, if commons is set to gen3, the configurations in directory config/gen3 will be used
NEXT_PUBLIC_COMMONS=gen3
NEXT_PUBLIC_GEN3_API=https://localhost:3010
NEXT_PUBLIC_GEN3_DOMAIN=localhost:3010
````

The value of `NEXT_PUBLIC_COMMONS` is used to determine the name of the commons-specific configuration file to use.
For example, if `NEXT_PUBLIC_COMMONS` is set to `gen3`, the configurations in directory `config/gen3.` will be used.
Tha value of `NEXT_PUBLIC_GEN3_API` is used to determine the URL of the Gen3 API to use.
The value of `NEXT_PUBLIC_GEN3_DOMAIN` is used to determine the URL of the Gen3 domain to use.

#### Setting Individual Gen3 Service URLs

You can set individual Gen3 service URLs by setting the following environment variables:

```bash

NEXT_PUBLIC_GEN3_GUPPY_API=https://localhost:3006

````

currently only overrides for Guppy are supported.

#### Session Configuration

Session configuration is stored in `config/session.json`. This file contains the following fields:

```json
{
  "sessionConfig" : {
    "updateSessionTime": 5,
    "inactiveTimeLimit": 20,
    "logoutInactiveUsers": true
  }
}
```
where:
- `updateSessionTime`: The time in minutes between updates to the session. This is used to update the session expiration time.
- `inactiveTimeLimit`: The time in minutes of inactivity before the user is logged out.
- `logoutInactiveUsers`: If true, users will be logged out after `inactiveTimeLimit` minutes of inactivity.

#### Colors Configuration

This is described in [docs/Local Development/Styling and Theming.md](../docs/Local%20Development/Styling%20and%20Theming.md)

#### Navigation Bar Configuration

The navigation bar configures what pages are displayed in the navigation bar and the styling of the navigation bar.
 The navigation bar is configured by editing `config/<commonsName>/navbar.json`.

Navigation buttons are defined in the `buttons` array. Each button is defined by a dictionary with the following fields:

- `name`: The label to display on the button.
- `icon`: The icon to display on the button. Must be processed with `npm run build:icons`, and will be prefiexed this `gen3:`
- `href`: The link to navigate to when the button is clicked.
- `tooltip`: The tooltip to display when the button is hovered over.

The topbar section is defined by:

```json
  "topBar": {
    "items": [
      {
        "href": "https://gen3.org/resources/user/",
        "name": "About"
      },
      {
        "href": "https://gen3.org/resources/user/",
        "name": "Resources"
      }
    ],
    "showLogin": false,

```

The `items` array defines the buttons to display in the topbar. Each button is defined by a dictionary with the following fields:

- `name`: The label to display on the button.
- `href`: The link to navigate to when the button is clicked.

The `showLogin` field determines whether the login button is displayed in the topbar.

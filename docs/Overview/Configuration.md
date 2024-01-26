# Configuring Gen3 Portal

## Overview

Various applications (or pages) in the Gen3 Frontend require configuration.
This configuration is stored in the `config` directory.

### Configuration Files

#### Site Configuration
Top level configuration is stored in `config/config.json`. This file contains the following fields:

- `commons`: The name of the commons. This is used to determine the commons-specific configuration to use.

The value of `commons` is used to determine the name of the commons-specific configuration file to use.
For example, if `commons` is set to `gen3`, the configurations in directory `config/gen3.` will be used


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


```

-

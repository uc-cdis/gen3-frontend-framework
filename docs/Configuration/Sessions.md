# Configuring Frontend Login Sessions

The frontend login sessions can be configured using the `session.json` file located in the `config` directory.

The configuration options are as follows:

```json
{
  "sessionConfig": {
    "updateSessionTime": 5,
    "inactiveTimeLimit": 20,
    "logoutInactiveUsers": true,
    "monitorWorkspace": false,
    "expireWarningMinutes": 0,
    "useWTS": true
  }
}
```

Where

- **updateSessionTime**: How often the inactivity check runs, `0` disables activity monitoring
- **inactiveTimeLimit**: Inactivity allowed before logout, except for Workspace pages. Set to `0` disable or set
  `logoutInactiveUsers` to true
- **workspaceInactivityTimeLimit**: Inactivity allowed before logout on a workspace page. `0` (the default) which means
  do not limit inactivity
- **logoutInactiveUsers**: `true|false` enable/disable if inactive users are logged out
- **monitorWorkspace**: Whether to poll running/configured hatchery based workspaces
- **expireWarningMinutes**: `minutes`  Number of minutes ahead of the inactivity logout to warn users. Default is `0`
  which means do not warn.
- **useWTS**: `true|false` (optional) enable/disable using Windows Terminal Services for session management. The default
  is false, you only need to set this to true if you are using Windows Terminal Services.

**Note: all times are in minutes**

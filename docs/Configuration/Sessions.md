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

- **updateSessionTime**: How often the backstop inactivity poll runs, `0` disables activity monitoring. The warning and
  the inactivity logout are timed to their exact moments and do not wait for the next poll; the poll only catches up
  after a suspended machine or a throttled background tab.
- **inactiveTimeLimit**: Inactivity allowed before logout, on all pages including Workspace. Set to `0` disable or set
  `logoutInactiveUsers` to true
- **logoutInactiveUsers**: `true|false` enable/disable if inactive users are logged out
- **monitorWorkspace**: Whether to poll running/configured hatchery based workspaces
- **expireWarningMinutes**: `minutes`  Number of minutes ahead of the inactivity logout to warn users. Default is `0`
  which means do not warn.
- **useWTS**: `true|false` (optional) enable/disable using Windows Terminal Services for session management. The default
  is false, you only need to set this to true if you are using Windows Terminal Services.

**Note: all times are in minutes**

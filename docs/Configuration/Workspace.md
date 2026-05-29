# Workspace Configuration Guide

The Workspace page configuration consists of sections:
* launchStepIndicatorConfig (optional): LaunchStepIndicatorConfiguration; TODO fill in
* requirePayModel (optional): boolean; TODO fill in
* externalLoginsNotUsed (optional): boolean; TODO fill in
* requestAccessForm (optional): Request Access Form

and example configuration:
```json
{
  "requirePayModel": false,
  "requestAccessForm": {
    "enabled": true,
    "remoteSupportService": {
      "service": "zenDesk",
      "configuration": {
        "zendeskSubdomainName": "self-22514"
      }
    },
    "label": "Workspace Request Access Form",
    "form": [
      {
        "type": "markdown",
        "text": "## You don't have access to Workspace."
      },
      {
        "type": "markdown",
        "text": "Workspace requires additional permission. Please complete the request form below. If you believe this is an error, contact your platform administrator at [support@gen3.org](mailto:support@gen3.org).",
        "className": "text-sm"
      },
      {
        "type": "Email",
        "label": "Login ID",
        "description": "This field displays the unique identifier you used to log in (e.g., your email address, ORCID iD, or another login method).",
        "initialValue": "userEmail",
        "disabled": true,
        "required": true,
        "variable": "email"
      },
      {
        "type": "Textarea",
        "label": "Reason for requesting access",
        "placeholder": "-- Briefly explain what you will use this workspace for --",
        "required": true,
        "variable": "reason"
      }
    ],
    "submitButtonText": "Apply for Workspace Access",
    "success": {
      "topIcon": {
        "src": "/icons/iconoir_window-no-access.svg",
        "alt": "No access"
      },
      "content": [
        {
          "type": "markdown",
          "text": [
            "# Your access request is in progress.",
            "You've already requested access to this workspace. Your request is being reviewed, and we'll let you know as soon as it's approved. If you believe this is an error, contact your platform administrator at [support@gen3.org](mailto:support@gen3.org)."
          ],
          "className": "text-center"
        }
      ]
    }
  }
}


```

requestAccessForm is an instance of [Form](../../packages/frontend/docs/components/Form.md) component.

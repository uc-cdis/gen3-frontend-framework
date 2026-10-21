# Site Navigation

This guide provides instructions on how to configure the navigation settings for your application using a JSON configuration file. The navigation config file is structured into several main sections, each responsible for different aspects of the navigation interface.

### Overall Structure

The navigation configuration is primarily divided into two sections:

- navigation: Configures the logo and navigation items.
- topBar: Defines the buttons and links located in the top bar of the interface.

Below is a detailed explanation of each section along with the available options.

### Configuring the Navigation Section

**Logo Configuration**

- **src**: Specifies the path to the logo image file.
- **height**: Defines the height of the logo in pixels.
- **href**: Provides the URL where users should be redirected when they click on the logo.

```
"logo": {
  "src": "/icons/gen3-dark.svg",
  "height": 128,
  "href": "/"
}
```

**Navigation Items**

Each item in the navigation menu can be configured with the following properties:

- **icon**: The icon class to be displayed alongside the item name. This usually follows a naming convention that should be consistent across the interface.
- **href**: The hyperlink reference where the item links to.
- **name**: The display name of the navigation item.
- **tooltip**: A brief description of the item that appears when the user hovers, with settings for each user state. All
  optional; if none are provided, no tooltip is shown.
- **enabledWithNoAccess**: When the user is logged in, enable the button even if the user does not have permission

Example of a navigation item:

```
{
  "icon": "gen3:query",
  "href": "/Discovery",
  "name": "Discovery",
  "tooltip": {
    "loginRequired": "Login required to access this page",
    "pending": "Checking your access…",
    "unauthorized": "You are logged in but not authorized to access this page",
    "authorized": "Use free-text search and tags to find relevant studies rapidly."
  },
  "enabledWithNoAccess": true
}
```

### Configuring the topBar Section

**Top Bar Items**

Similar to the navigation items, each top bar item has the following properties:

- **rightIcon** (optional): An icon displayed to the right of the item text.
- **href**: The URL to which the item links.
- **name**: The text displayed for the item.
- **newWindow**: Whether the link should be opened in a new window/tab.

Example of top bar items:

```
{
  "rightIcon": "gen3:upload",
  "href": "/submission",
  "name": "Browse Data"
}
{
  "href": "http://example.com/documentation",
  "name": "Example Documentation",
  "newWindow": true
}
```

Login Button Display

- **loginButtonVisibility**: one of 'visible', 'hidden ', or 'logoutOnly'

where:

- 'visible' - always shown; if logged in, shows userId and a logout button.
- 'logoutOnly' - only show the logoutButton when logged in.
- 'hide' - never show

```
   "loginButtonVisibility": "logoutOnly"
```

### Example Configuration

Below is an example of a navigation configuration with navigation and topBar sections:

```
{
  "navigation": {
    "logo": {
      "src": "/icons/gen3-dark.svg",
      "height": 128,
      "href": "/"
    },
    "items": [
      {
        "icon": "gen3:query",
        "href": "/Discovery",
        "name": "Discovery",
        "tooltip": {
          "loginRequired": "Login required to access this page",
          "pending": "Checking your access…",
          "unauthorized": "You are logged in but not authorized to access this page",
          "authorized": "Use free-text search and tags to find relevant studies."
        },
      },
      // More items...
    ]
  },
  "topBar": {
    "items": [
      {
        "rightIcon": "gen3:upload",
        "href": "/submission",
        "name": "Browse Data"
      },
      // More items...
    ],
    "loginButtonVisibility": "visible"
  }
}
```

A sample full configuration is
here: [config/gen3/navigation.json](https://github.com/uc-cdis/commons-frontend-app/blob/4140ca3aea6311436a1b51b03cf0a8fa4c781514/config/gen3/navigation.json)

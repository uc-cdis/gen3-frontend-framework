## Navigation Configuration Guide

This guide provides instructions on how to configure the navigation settings for your application using a JSON configuration file. The navigation config file is structured into several main sections, each responsible for different aspects of the navigation interface.

### 1. Overall Structure

The navigation configuration is primarily divided into two sections:
- `navigation`: Configures the main navigation elements such as logo and menu items.
- `topBar`: Defines the settings and elements located in the top bar of the interface.

Below is a detailed explanation of each section along with the available options.

### 2. Configuring the `navigation` Section

#### a. Logo Configuration

- **src**: Specifies the path to the logo image file.
- **height**: Defines the height of the logo in pixels.
- **href**: Provides the URL where users should be redirected when they click on the logo.

```json
"logo": {
  "src": "/icons/gen3-dark.svg",
  "height": 128,
  "href": "/"
}
```

#### b. Navigation Items

Each item in the navigation menu can be configured with the following properties:

- **icon**: The icon class to be displayed alongside the item name. This usually follows a naming convention that should be consistent across the interface.
- **href**: The hyperlink reference where the item links to.
- **name**: The display name of the navigation item.
- **tooltip**: A brief description of the item that appears when the user hovers over it.

Example of a navigation item:

```json
{
  "icon": "gen3:query",
  "href": "/Discovery",
  "name": "Discovery",
  "tooltip": "Use free-text search and tags to rapidly find relevant studies."
}
```

### 3. Configuring the `topBar` Section

#### a. Top Bar Items

Similar to the navigation items, each top bar item has the following properties:

- **rightIcon** (optional): An icon displayed to the right of the item text.
- **href**: The URL to which the item links.
- **name**: The text displayed for the item.

Example of a top bar item:

```json
{
  "rightIcon": "gen3:upload",
  "href": "/submission",
  "name": "Browse Data"
}
```

#### b. Login Button Display

- **loginButtonVisibility**: one of 'visible', 'hidden' or 'logoutOnly'

where:
 * 'visible' - always shown, if logged in shows userId and a logout button
 * 'logoutOnly' - only show the logoutButton when logged in
 * 'hidded' - never show

```json
  "loginButtonVisibility": "logoutOnly"
```

### 4. Example Full Configuration

Below is an example of a full navigation configuration file combining both `navigation` and `topBar` sections:

```json
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
        "tooltip": "Use free-text search and tags to rapidly find relevant studies."
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

### 5. Best Practices

- **Consistency**: Maintain icon and naming consistency throughout the navigation to provide a seamless user experience.
- **Testing**: Always test the navigation configuration on different devices to ensure it works seamlessly across all platforms.
- **Documentation Links**: Ensure that any external links, such as documentation or resources, are always up-to-date and accessible.

This markdown documentation can be used as a template or guide to help configure the navigation elements in your JSON config file efficiently and effectively.

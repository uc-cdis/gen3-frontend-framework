## Footer Configuration Guide

This guide provides detailed instructions on how to configure the footer of a website using a JSON configuration file. The footer often contains logos, links, and copyright information, and this guide specifically covers the configuration for logos in the footer.

### 1. Overview of Configuration Structure

The configuration file for the footer is structured to define how logos, Text and Links are displayed on footer.
Here's an overview of the main configuration option:

- `footerRightLogos`: A nested array that holds details about each logo to be displayed in the footer on the right side.

### 2. Detailed Configuration Sections

#### a. Footer Right Logos (`footerRightLogos`)

The `rightSection` contain an array of columns. Each column contains an array of rows of footer items.
Footer items can be:
* Icon - image file to display
* Text - text to display
* Link - link to a page
* Links - a row of links
* Section - which allows for rows of columns allowing more complex layouts
This setup is useful for aligning multiple logos side by side or in various groupings based on design requirements.

### Icon
Each logo within row can be configured with the following properties:
- **logo**: URL or path to the logo image file.
- **width**: Width of the logo in pixels.
- **height**: Height of the logo in pixels.
- **description**: A text description of the logo, which can be used for accessibility features like alt text.

### Label
- **text**: Text to display.
- **className**: CSS class name for the text.

### Link
- **text**: Text to display.
- **href**: Link to a page.
- **className**: CSS class name for the link.

### Links
An array of link in one row separated by ```|```
- *links**: array of Links
- **className**: CSS class name for the link.

Styling:

The className or classNames is used control the styling of the individual elements of the footer.
The styling can either be tailwind styling keywords or a custom css class.

Note: tailwind's arbitrary items (like ```top-[117px] lg:top-[344px]``) are not supported, as these are considered
dynamic styling which tailwind does not support. In order to achieve the same result, you can use a custom css class
and define the styling in your own css file.


### 3. Example of a Footer Logo Configuration

Here is an example configuration that demonstrates how to specify two logos grouped together on the right side of the footer:

```json
{
  "classNames": {
    "root": "bg-base-darker",
    "layout": "flex items-center justify-end"
  },
  "rightSection": {
    "columns": [
      {
        "rows": [
          {
            "Icon": {
              "logo": "/icons/gen3.png",
              "width": 132,
              "height": 60,
              "description": "Gen3 Logo"
            }
          }
        ]
      },
      {
        "rows": [
          {
            "Icon": {
              "logo": "/icons/createdby.png",
              "width": 170,
              "height": 60,
              "description": "Created by CTDS"
            }
          }
        ]
      }
    ]
  }
}

```

#### Explanation:

- The `rightSection` has two columns, indicating a single grouping of logos.
- Each column has one row containing a Icon.
    - The first logo is the "Gen3 Logo" with specific dimensions.
    - The second logo is the "Created by CTDS" logo, also with defined dimensions.
- Each logo entry includes a `description` that serves as alt text for accessibility, describing the image when it cannot be viewed.

### 4. Best Practices

- **Accessibility**: Always include a `description` for each logo to improve accessibility. This text serves as alt text for screen readers.
- **Consistency**: Maintain consistent logo sizes when possible to ensure a uniform appearance across the footer.
- **Validation**: Check the paths and dimensions of the logos to ensure they display correctly on all devices.
- **Design Alignment**: Coordinate with the website's design team to ensure the footer aligns with the overall aesthetic and functional requirements of the website.

This configuration guide will assist in setting up a structured and visually appealing footer for your website, ensuring all logos are displayed correctly and accessibly.

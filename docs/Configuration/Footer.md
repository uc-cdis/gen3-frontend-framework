## Footer Configuration Guide

This guide provides detailed instructions on how to configure the footer of a website using a JSON configuration file. The footer often contains logos, links, and copyright information, and this guide specifically covers the configuration for logos in the footer.

### 1. Overview of Configuration Structure

The configuration file for the footer is structured to define how logos are displayed on the right side of the footer. Here's an overview of the main configuration option:

- `footerRightLogos`: A nested array that holds details about each logo to be displayed in the footer on the right side.

### 2. Detailed Configuration Sections

#### a. Footer Right Logos (`footerRightLogos`)

The `footerRightLogos` is an array of arrays. Each inner array can contain one or more logo configurations, allowing grouping of logos as needed. This setup is useful for aligning multiple logos side by side or in various groupings based on design requirements.

Each logo within the inner arrays can be configured with the following properties:

- **logo**: URL or path to the logo image file.
- **width**: Width of the logo in pixels.
- **height**: Height of the logo in pixels.
- **description**: A text description of the logo, which can be used for accessibility features like alt text.

### 3. Example of a Footer Logo Configuration

Here is an example configuration that demonstrates how to specify two logos grouped together on the right side of the footer:

```json
{
  "footerRightLogos": [
    [
      {
        "logo": "/icons/gen3.png",
        "width": 132,
        "height": 60,
        "description": "Gen3 Logo"
      },
      {
        "logo": "/icons/createdby.png",
        "width": 170,
        "height": 60,
        "description": "Created by CTDS"
      }
    ]
  ]
}
```

#### Explanation:

- The `footerRightLogos` array contains one inner array, indicating a single grouping of logos.
- Inside this inner array, there are two objects, each representing a logo.
    - The first logo is the "Gen3 Logo" with specific dimensions.
    - The second logo is the "Created by CTDS" logo, also with defined dimensions.
- Each logo entry includes a `description` that serves as alt text for accessibility, describing the image when it cannot be viewed.

### 4. Best Practices

- **Accessibility**: Always include a `description` for each logo to improve accessibility. This text serves as alt text for screen readers.
- **Consistency**: Maintain consistent logo sizes when possible to ensure a uniform appearance across the footer.
- **Validation**: Check the paths and dimensions of the logos to ensure they display correctly on all devices.
- **Design Alignment**: Coordinate with the website's design team to ensure the footer aligns with the overall aesthetic and functional requirements of the website.

This configuration guide will assist in setting up a structured and visually appealing footer for your website, ensuring all logos are displayed correctly and accessibly.

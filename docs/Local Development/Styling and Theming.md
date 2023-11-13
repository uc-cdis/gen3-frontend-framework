## Configuring the theme

### Fonts

Fonts cane be configured by editing ```config/themeFonts.json```
The current theme support heading and body fonts. They can be specified as a google font or a local font in standary css format (e.x. "Arial, Helvetica, sans-serif")
The```fontFamily``` member is used to set the font for the component library (e.g. Mantine.dev)

```json
{
  "heading": "Roboto, sans-serif",
  "content": "Roboto, sans-serif",
  "fontFamily": "Roboto"
}
```

### Colors

Gen3 Color Theme is based on USWDS theme color tokens which are divided into several high-level role-based color families: base, primary, secondary, accent, accent-warm, accent-cool, chart, and utility.

Base is a project’s neutral color, typically some tint of gray, and usually used as the text color throughout.
Primary, secondary, and accent colors can be thought of as falling into a proportional 60/30/10 relationship: about 60% of your site’s color would be the primary color family, about 30% would be the secondary color family, and about 10% would be the accent color families (accent-warm and accent-cool). Note that these proportions are for non-base colors. In many cases, the neutral base text color will be the predominant tone on your site.

Each color in the theme has 10 colors:max, lightest, lighter, light, DEFAULT, vivid, dark, darker, darkest, min These are padded to 10 color arrays for compatibility with Mantine&amp.s color theme. This allows you to pass color="primary|secondary|accent...." to Mantine components as documented, this includes accessing lighter or darker version vis the primary.N (where N 0..9).

Each of these color also has two contrasting colors:
content-max, content-lightest, content-lighter, content-light, content-DEFAULT, content-vivid, content-dark, content-darker, content-darkest, content-min
contrast-max, contrast-lightest, contrast-lighter, contrast-light, contrast-DEFAULT, contrast-vivid, contrast-dark, contrast-darker, contrast-darkest, contrast-min
The contrast color is defined to be a 508 compliant contrast so while primary-darker is a darker version of the primary color, primary-contrast-darker is a 508 contrast compliant color, and it actually lighter, but is named to match the primary color shade. This means that consistent use of color-shade and color-contrast-shade, for example bg-primary-lighter and text-primary-contrast-lighter ensures that these two colors will be 508 compliant if the shades are defined correctly. The content variant allows finder control over the theme but at the risk of creating 508 contrast errors Any component using content should be checked for 508 contrast issues.


Colors can be configured by editing ```config/<commonsName>/colors.json```. The color

```json
{
  "base": "#f7fafc",
  "primary": "#1a202c",
  "secondary": "#2d3748",
  "accent": "#e53e3e",
  "accent-warm": "#ed8936",
  "accent-cool": "#63b3ed",
  "chart": "#3182ce"
}
```

Once the colors are edited they need to be process with the command
```
npm run build:colors
```
in the commons (for now ```sampleCommon```) source directory.

You can test the color them by going to the commons web portal Color page.
For example http://localhost:3000/Colors


### Navigation Bar

The navigation bar support extra styling using tailwind css tokens to
configure the navigation bar layout and styling. The navigation bar
is configured by editing ```config/<commonsName>/navbar.json```



```json

```

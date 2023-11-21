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

#### Navigation Bar Styling

The navigation bar styling is configured adding a className object to the
navbar.json file. The className object is a dictionary of tailwind css
style tokens. The members of the className object are:

* root: The root style for the navigation bar this can include background color, border, etc.
* navigationBar: styling for the container holding the navigation buttons
* login: styling for the login button container


the current default is:

```json
  { "classNames": {
    "root": 'flex bg-base-lightest py-3 border-b-1 border-base-contrast',
    "navigationPanel": 'font-heading font-bold tracking-wide text-xl space-x-4',
    "login":  'pl-1 mr-6 bg-base-max text-base-contrast opacity-80 hover:opacity-100',
  }
```
#### Navigation Bar Buttons Styling

The navigation bar buttons are configured by defining a classNames object
containing the tailwind css tokens for the button styling. The classNames
object is a dictionary of tailwind css style tokens. The members of the
classNames object are:

* root: The root style for the navigation bar button this can include background color, border, etc.
* label: styling for the button label
* icon: styling for the button icon
* tooltip: styling for the tooltip

the current default is:

```json
  "classNames": {
     "root": 'flex flex-col flex-nowrap px-1 py-2 pt-4 items-center hover:text-accent opacity-80 hover:opacity-100',
     "label": 'content-center pt-1.5 body-typo font-heading text-sm',
     "icon": 'mt-0.5 ml-1',
     "tooltip": 'bg-primary-light text-base-contrast-light text-xl'
  }
```

#### Footer Styling

The footer styling is also configured by defining a classNames object. The members of the classNames object are:

* root: The root style for the footer this can include background color, border, etc.

other elements of the Footer styling will be added in the future.

## Landing Page Configuration

The landing page is the site's default page. Use the templates and configurations Gen3 FEF supports or replace the page
with your own.

### Overview of Configuration Structure

The homepage configuration is in configs/gen3/landingPage.json, called body, where each element represents a homepage
section or component. The main sections you can configure include:

- splitarea: Divides content into left and right sections
- break: Adds spacing or a separation element.
- cardsArea: Defines a section for multiple clickable cards.
- quoteArea: Displays a quote or highlighted text.

### Page Element Configuration

Title (title)

- **text**: The text content of the title.
- **level**: The HTML heading level (e.g., 1 for &lt;h1&gt;, 2 for &lt;h2&gt;).

```
   "title": {
    "text": "Gen3 Data Platform",
    "level": 2
  }
}
```

Split Area (splitarea)

Divides the homepage into two sections (left and right):

- **left**: An array of components like text blocks or links that appear on the left side.
- **right**: An array of components, typically for images, that will appear on the right side.

Example configuration for a splitarea:

```
"splitarea": {
  "left": [
    {
      "text": "The <strong>Gen3 Data Platform</strong> is a single web interface which allows visitors to <strong>discover, access and analyze data</strong>."
    },
    {
      "link": {
        "href": "/discovery",
        "linkType": "portal",
        "text": "Explore Gen3 Data"
      }
    }
  ],
  "right": [
    {
      "image": {
        "src": "https://gen3.org/figs/kv.svg",
        "alt": "Gen3 Data Platform"
      }
    }
  ]
}
```

Cards Area (cardsArea)

Defines a section with multiple clickable cards, each with an icon, body text, button text, and link:

- **title**: Set the cards section title.
- **cards**: An array of card objects.

Example of a card in the cardsArea:

```
"cardsArea": {
  "title": "",
  "cards": [
    {
      "icon": "MdOutlineSearch",
      "bodyText": "Search studies and related datasets.",
      "btnText": "Discover",
      "href": "/Discovery",
      "linkType": "portal"
    }
  ]
}
```

Quote Area (quoteArea)

Displays a motivational or informational quote:

- **quote**: Set the quote text.

```
"quoteArea": {
  "quote": "Our vision is a world in which researchers have ready access to the data needed and the tools required to make data-driven discoveries that increase our scientific knowledge and improve the quality of life."
}
```

## Custom Homepage

If the layout above does not meet the project design or requirements, create a new home page. Use this template for
src/pages/callback.ts:

```
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
const Homepage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <div className="w-full m-10">
        Add HTML content here.
      </div>
    </NavPageLayout>
  );
};
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
export default Homepage;
```

HTML, React components, Mantine components, TypeScript, or JavaScript code can be added as children of NavPageLayout ->
div.

## Set another page as the default landing page

If you want another page to be the default landing page, change the redirectPage property in the landingPage.json file
in the config directory. For example, set redirectPage to "/Discovery" to redirect to the Discovery page. If you do
this, you do not need anything in the landingPage.json config file.

Example:

```
{
  "redirectPage": "/Discovery"
  ...
}
```

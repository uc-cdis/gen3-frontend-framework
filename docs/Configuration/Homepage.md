## Homepage Configuration Guide

This guide provides detailed instructions on configuring the homepage of a website using a JSON configuration file. The homepage configuration involves various sections such as titles, text blocks, links, images, and special content areas like cards and quotes. Below is a structured approach to setting up these components effectively.

### 1. Overview of Configuration Structure

The homepage configuration is structured into an array called `body`, where each element represents a different section or component of the homepage. Here's a breakdown of the main sections you can configure:

- `title`: Configures the text and heading level for titles.
- `splitarea`: Divides content into left and right sections, typically for text and images.
- `break`: Adds a spacing or separation element.
- `cardsArea`: Defines a section for multiple clickable cards.
- `quoteArea`: Displays a quote or highlighted text.

### 2. Detailed Configuration Sections

#### a. Title (`title`)

- **text**: The text content of the title.
- **level**: The HTML heading level (e.g., 1 for `<h1>`, 2 for `<h2>`).

```json
{
  "title": {
    "text": "Gen3 Data Platform",
    "level": 2
  }
}
```

#### b. Split Area (`splitarea`)

Divides the homepage into two sections (left and right):

- **left**: An array of components such as text blocks or links that will appear on the left side.
- **right**: An array of components, typically for images, that will appear on the right side.

Example configuration for a `splitarea`:

```json
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

#### c. Cards Area (`cardsArea`)

Defines a section containing multiple clickable cards, each with an icon, body text, button text, and link:

- **title**: The title of the cards section.
- **cards**: An array of card objects.

Example of a card in the `cardsArea`:

```json
"cardsArea": {
  "title": "",
  "cards": [
    {
      "icon": "MdOutlineSearch",
      "bodyText": "Search studies and related datasets for download or analysis in a workspace.",
      "btnText": "Discover",
      "href": "/Discovery",
      "linkType": "portal"
    }
  ]
}
```

#### d. Quote Area (`quoteArea`)

Displays a motivational or informational quote:

- **quote**: The text content of the quote.

```json
"quoteArea": {
  "quote": "Our vision is a world in which researchers have ready access to the data needed and the tools required to make data-driven discoveries that increase our scientific knowledge and improve the quality of life."
}
```

### 3. Best Practices

- **Content Organization**: Clearly organize content into logical sections to guide the user's journey on the homepage.
- **Accessibility**: Ensure that all text is accessible, and images have appropriate alt text descriptions.
- **Responsive Design**: Check that the layout adapts well to different screen sizes, especially when using split areas and cards.
- **Link Validation**: Ensure all links are correct and functional to prevent user frustration or navigation errors.

This configuration guide helps in setting up a dynamic and engaging homepage tailored to the needs of users, facilitating an intuitive and informative first impression of the website.

## Homepage Configuration Guide

This guide provides detailed instructions on configuring the homepage of a website using a JSON configuration file. The homepage configuration involves various sections such as titles, text blocks, links, images, and special content areas like cards and quotes. Below is a structured approach to setting up these components effectively.

### 1. Overview of Configuration Structure

The homepage configuration is structured into an array called `body`, where each element represents a different section or component of the homepage. Here's a breakdown of the main sections you can configure:

- `title`: Configures the text and heading level for titles.
- `splitarea`: Divides content into left and right sections, typically for text and images.
- `break`: Adds a spacing or separation element.
- `cardsArea`: Defines a section for multiple clickable cards.
- `quoteArea`: Displays a quote or highlighted text.

### 2. Detailed Configuration Sections

#### a. Title (`title`)

- **text**: The text content of the title.
- **level**: The HTML heading level (e.g., 1 for `<h1>`, 2 for `<h2>`).

```json
{
  "title": {
    "text": "Gen3 Data Platform",
    "level": 2
  }
}
```

#### b. Split Area (`splitarea`)

Divides the homepage into two sections (left and right):

- **left**: An array of components such as text blocks or links that will appear on the left side.
- **right**: An array of components, typically for images, that will appear on the right side.

Example configuration for a `splitarea`:

```json
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

#### c. Cards Area (`cardsArea`)

Defines a section containing multiple clickable cards, each with an icon, body text, button text, and link:

- **title**: The title of the cards section.
- **cards**: An array of card objects.

Example of a card in the `cardsArea`:

```json
"cardsArea": {
  "title": "",
  "cards": [
    {
      "icon": "MdOutlineSearch",
      "bodyText": "Search studies and related datasets for download or analysis in a workspace.",
      "btnText": "Discover",
      "href": "/Discovery",
      "linkType": "portal"
    }
  ]
}
```

#### d. Quote Area (`quoteArea`)

Displays a motivational or informational quote:

- **quote**: The text content of the quote.

```json
"quoteArea": {
  "quote": "Our vision is a world in which researchers have ready access to the data needed and the tools required to make data-driven discoveries that increase our scientific knowledge and improve the quality of life."
}
```

### 3. Best Practices

- **Content Organization**: Clearly organize content into logical sections to guide the user's journey on the homepage.
- **Accessibility**: Ensure that all text is accessible, and images have appropriate alt text descriptions.
- **Responsive Design**: Check that the layout adapts well to different screen sizes, especially when using split areas and cards.
- **Link Validation**: Ensure all links are correct and functional to prevent user frustration or navigation errors.

## Custom Homepage

If the layout above does not meet the project design or requirements, there is another option:
Creating a new home page. To do use this template for ```src/pages/index.tsx```:

```tsx
import React from 'react';
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
        Add HTML content here
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

HTML, React components, Mantine Components, Typescript or Javascript code can be added to
as children of  ```NavPageLayout -> div```.

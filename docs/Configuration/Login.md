# Login Configuration Guide

The login page configuration consists of two main sections:
* Top Content
* Bottom Content

and example configuration:
```json
{
  "topContent": [
    {
      "text": "Gen3 Data Commons",
      "className": "text-center text-3xl font-bold"
    },
    {
      "text": "DISCOVER, ANALYZE, AND SHARE DATA",
      "className": "text-center text-xl font-medium"
    }
  ],
  "bottomContent": [
 {
      "type" : "textWithEmail",
      "text": "If you have any questions about access or the registration process, please contact",
      "email": "gen3@datacommons.io",
      "className": "text-center text-sm"
    }
  ],
  "image": "images/gene_side_texture.svg",
  "showCredentialsLogin" : true
}

```

Both topContent and bottomContent are arrays of the [TextContent](../../packages/frontend/docs/components/TextContent.md) component.

* image: the side image for the login page
* showCredentialsLogin: is for development and allows logins using a credentials file instead of logging in which
usually will not work because fence will not allow redirects back to https://localhost

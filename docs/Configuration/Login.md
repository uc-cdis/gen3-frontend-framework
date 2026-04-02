# Login Configuration Guide

The login page configuration consists of three main sections:
* Top Content
* Login Provider Extra Details 
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
  "loginProviderExtra": {
    "InCommon Login": [
      {
        "text": "If your organization is part of the InCommon Federation, ",
        "className": "text-center text-3xl font-bold"
      },
      {
        "text": "users can access the portal by selecting their institution from the provider list",
        "className": "text-center text-xl font-medium"
      }
    ]
  },
  "bottomContent": [
 {
      "type" : "textWithEmail",
      "text": "If you have any questions about access or the registration process, please contact",
      "email": "support@gen3.org",
      "className": "text-center text-sm"
    }
  ],
  "image": "images/gene_side_texture.svg",
  "showCredentialsLogin" : true
}

```

Both topContent and bottomContent are arrays of the [TextContent](../../packages/frontend/docs/components/TextContent.md) component.
loginProviderExtra is an object with keys matching provider name; value is arrays of the [TextContent](../../packages/frontend/docs/components/TextContent.md) component.

* image: the side image for the login page
* showCredentialsLogin: is for development and allows logins using a credentials file instead of logging in which
usually will not work because fence will not allow redirects back to https://localhost

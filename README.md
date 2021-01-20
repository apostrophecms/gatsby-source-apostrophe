# gatsby-source-apostrophe

Source plugin for accessing [ApostropheCMS 3.x content APIs](https://a3.docs.apos.dev/guide/rest-apis.html) in [Gatsby](https://www.gatsbyjs.com/docs/tutorial/)

## Install

`npm install gatsby-source-apostrophe`

## How to use

1. Review [Gatsby documentation on using source plugins](https://www.gatsbyjs.com/docs/tutorial/part-five/). 🤓
1. [Add an API key to the Apostrophe app](https://a3.docs.apos.dev/reference/api/authentication.html#api-keys) to include as the `apiKey` option.
2. Enter the Apos app root domain as the `baseUrl` option. For local development this will likely be `http://localhost:3000`.
3. Add an array of the piece types (custom content types) you want available to Gatsby in the `pieceTypes` array.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-apostrophe`,
      options: {
        apiKey: 'my-apos-api-key',
        baseUrl: 'http://localhost:3000',
        pieceTypes: [
          '@apostrophecms/file',
          'my-piece-type'
        ]
      }
    }
  ]
}
```

## Options

### apiKey (required)

An ApostropheCMS API key with permissions to make GET requests. [Read more about setting up API keys](https://a3.docs.apos.dev/reference/api/authentication.html#api-keys) in the Apostrophe documentation.

### baseUrl (required)

The base URL for API requests. Usually this will be the root domain of the Apostrophe website or application with no trailing slash. In local development it will be `http://localhost:3000` by default.

### pieceTypes

An array of Apostrophe piece type names. These will the same as the key name entered in the `app.js` `modules` object in the Apostrophe app. You may include core piece types that are not included by default, e.g, `apostrophe/file`, `apostrophe/image-tag`.

### renderPages

Defaults to `true`. Set this to `false` to avoid an additional request for each Apostrophe page in order to add the page's rendered HTML to the `AposCorePage` nodes.

## Notes

### Naming

Apostrophe content node types in Gatsby's GraphQL API are all prefixed with `Apos`. So if you include your `article` piece type, it will appear in the GraphQL API as `AposArticle` nodes and the query collections will be `aposArticle` and `allAposArticle`.

Apostrophe core piece types and pages are prefixed `AposCore`. For example, including the core `@apostrophecms/file` piece type will create `AposCoreFile` nodes.

### Rendered content

Apostrophe pieces are well suited to being delivered as structured, JSON-like data. Apostrophe pages, on the other hand, usually consist primarily of the flexible content "areas," populated with any number of different widget types. It powers Apostrophe's great in-context editing experience, but the raw data is not easy to use in a page template on your own.

Unless you add `renderPages: false` to this source plugin's options, pages will appear with a `_rendered` property in Gatsby GraphQL queries. This property's value is a string of HTML, rendered using the relevant page template in the Apostrophe app. That HTML can be used in your Gatsby site to [programmatically create pages](https://www.gatsbyjs.com/docs/tutorial/part-seven/) using the right layout component and slug structure for your site.

## Planned features

- Apos "areas" are rendered as HTML by default, rather than output as less usable raw data
- Apostrophe images included by default
- Apostrophe pages included via an option, generating Gatsby pages
- Apos pages rendered as HTML by default (necessary for automatically generating Gatsby pages)
- An option to make all piece types available in Gatsby GraphQL queries without naming them

## License
 gatsby-source-apostrophe is released under the [MIT License](https://github.com/punkave/apostrophe/blob/master/LICENSE.md).

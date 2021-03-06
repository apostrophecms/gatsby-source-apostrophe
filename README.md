# gatsby-source-apostrophe

Source plugin for accessing [ApostropheCMS 3.x content APIs](https://v3.docs.apostrophecms.org/reference/api/) in [Gatsby](https://www.gatsbyjs.com/docs/tutorial/)

## Install

`npm install gatsby-source-apostrophe`

## How to use

1. Review [Gatsby documentation on using source plugins](https://www.gatsbyjs.com/docs/tutorial/part-five/). 🤓
2. [Add an API key to the Apostrophe app](https://v3.docs.apostrophecms.org/reference/api/authentication.html#api-keys) to include as the `apiKey` option.
3. Enter the Apos app root domain as the `baseUrl` option. For local development this will likely be `http://localhost:3000`.
4. Add an array of the piece types (custom content types) you want available to Gatsby in the `pieceTypes` array.

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

An ApostropheCMS API key with permissions to make GET requests. [Read more about setting up API keys](https://v3.docs.apostrophecms.org/reference/api/authentication.html#api-keys) in the Apostrophe documentation.

### baseUrl (required)

The base URL for API requests. Usually this will be the root domain of the Apostrophe website or application with no trailing slash. In local development it will be `http://localhost:3000` by default.

### pieceTypes

An array of Apostrophe piece type names. These will the same as the key name entered in the `app.js` `modules` object in the Apostrophe app. You may include core piece types that are not included by default, e.g, `@apostrophecms/file`, `@apostrophecms/image-tag`.

### renderPages

Defaults to `true`. Set this to `false` to avoid an additional request for each Apostrophe page in order to add the page's rendered HTML to the `AposCorePage` nodes.

## Notes

### Naming

Apostrophe content node types in Gatsby's GraphQL API are all prefixed with `Apos`. So if you include your `article` piece type, it will appear in the GraphQL API as `AposArticle` nodes and the query collections will be `aposArticle` and `allAposArticle`.

Apostrophe core piece types and pages are prefixed `AposCore`. For example, including the core `@apostrophecms/file` piece type will create `AposCoreFile` nodes. Other scoped module names will be converted to pascal-case, removing punctuation, and prefixed with `Apos`. For example, `@skynet/bad-robots` and `@skynet/badRobots` will be converted to `AposSkynetBadRobots`.

### Rendered content

Apostrophe "pieces" are well suited to being delivered as structured, JSON-like data. However, the power of Apostrophe really shines when editors build custom series of content widgets in "areas." Because areas can contain many types of widgets, and thus are not consistent in data structure, it is usually more useful to retrieve those from the APIs as rendered HTML.

Area fields on piece types will be available in the GraphQL queries with a `_rendered` property containing a string of rendered HTML. All other field types are delivered directly as their normal data types, e.g., strings, number, arrays, etc.

#### Rendered pages

Apostrophe pages usually consist primarily of these content "areas," populated with any number of different widget types. Unless you add `renderPages: false` to this source plugin's options, pages will appear with a `_rendered` property in Gatsby GraphQL queries. This property's value is a string of HTML, rendered using the relevant page template in the Apostrophe app. See [the page API documentation](https://v3.docs.apostrophecms.org/reference/api/pages.html#delete-api-v1-apostrophecms-page-id) for more specifics on what is rendered.

That HTML can be used in your Gatsby site to [programmatically create pages](https://www.gatsbyjs.com/docs/tutorial/part-seven/) using the right layout component and slug structure for your site.

If there are parts of the Apostrophe page templates that you do *not* want to include in the rendered response, you can wrap those in the following Nunjucks conditional (these requests include a `?headless=true` parameter):

```django
<!-- For example, in the Apostrophe site's `views/layout.html` -->
{% if not data.query.headless == 'true' %}
  <!-- Template wrapper you don't want in rendered responses. -->
{% endif %}
```

## Planned features

- A video player JS to support the Apostrophe core video widget in areas
- Option for Apostrophe pages to automatically generate Gatsby pages
- An option to make all piece types available in Gatsby GraphQL queries without naming them

## License
 gatsby-source-apostrophe is released under the [MIT License](https://github.com/apostrophecms/gatsby-source-apostrophe/blob/main/LICENSE).

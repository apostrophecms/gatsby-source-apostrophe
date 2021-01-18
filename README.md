# gatsby-source-apostrophe

Source plugin for accessing [ApostropheCMS 3.x content APIs](https://a3.docs.apos.dev/guide/rest-apis.html) in [Gatsby](https://www.gatsbyjs.com/docs/tutorial/)

## Install

`npm install gatsby-source-apostrophe`

## How to use

1. Review [Gatsby documentation on using source plugins](https://www.gatsbyjs.com/docs/tutorial/part-five/). 🤓
1. [Add an API key to the Apostrophe app](https://a3.docs.apos.dev/reference/api/authentication.html#api-keys) to include as the `apiKey` option.
2. Enter the Apos app root domain as the `baseUrl` option. For local development this will likely be `http://localhost:3000`.
3. Add an array of the piece types (custom content types) you want available to Gatsby in the `pieceTypes` array. These will the same as the key name entered in the `app.js` `modules` object in the Apostrophe app. You may include core piece types that are not included by default, e.g, `apostrophe/file`, `apostrophe/image-tag`.

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

## Planned features

- Apos "areas" are rendered as HTML by default, rather than output as less usable raw data
- Apostrophe images included by default
- Apostrophe pages included via an option, generating Gatsby pages
- Apos pages rendered as HTML by default (necessary for automatically generating Gatsby pages)
- An option to make all piece types available in Gatsby GraphQL queries without naming them

## License
 gatsby-source-apostrophe is released under the [MIT License](https://github.com/punkave/apostrophe/blob/master/LICENSE.md).

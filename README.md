# gatsby-source-apostrophe

Source plugin for accessing ApostropheCMS content APIs in Gatsby

## Install

`npm install gatsby-source-apostrophe`

## How to use

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
          '@apostrophecms/user',
          '@apostrophecms/image',
          'my-piece-type'
        ]
      }
    }
  ]
}
```

## License
 gatsby-source-apostrophe is released under the [MIT License](https://github.com/punkave/apostrophe/blob/master/LICENSE.md).

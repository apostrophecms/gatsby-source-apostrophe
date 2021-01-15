
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
const fetch = require('node-fetch').default;
const camelcase = require('camelcase').default;

// TEMP: disabling console log warning.
/* eslint-disable no-console */
exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType
}, options) => {
  options = options || {};

  if (!options.baseUrl) {
    throw Error('You are missing the `baseUrl` option for gatsby-source-apostrophe');
  }
  if (!options.apiKey) {
    throw Error('You are missing the `apiKey` option for gatsby-source-apostrophe');
  }

  if (Array.isArray(options.pieceTypes)) {
    const routeBase = options.routeBase || 'api/v1';
    for (const type of options.pieceTypes) {
      const route = `${options.baseUrl}/${routeBase}/${type}`;
      const response = await fetch(`${route}?apikey=${options.apiKey}`);
      const data = await response.json();
      const totalPages = data.pages;

      const nodeTypeName = isAposCoreType(type)
        ? convertCoreType(type)
        : `Apos${camelcase(type, { pascalCase: true })}`;

      await generatePieceNodes(data.results, nodeTypeName);

      if (totalPages <= 1) {
        continue;
      };

      for (let i = 2; i <= totalPages; i++) {
        const pageResults = await getPiecePage(route, {
          apiKey: options.apiKey,
          page: i
        });
        await generatePieceNodes(pageResults, nodeTypeName);
      }

    }
  }

  async function generatePieceNodes (pieces, nodeType) {
    const { createNode } = actions;
    // loop through data and create Gatsby nodes
    pieces.forEach(piece => {
      piece.aposId = piece._id;
      piece._id = undefined;
      return createNode({
        ...piece,
        id: createNodeId(`${nodeType}-${piece.aposId}`),
        parent: null,
        children: [],
        internal: {
          type: nodeType,
          content: JSON.stringify(piece),
          contentDigest: createContentDigest(piece)
        }
      });
    });
  }
};

function isAposCoreType(name) {
  return name.length > 15 && name.slice(0, 15) === '@apostrophecms/';
}

function convertCoreType (aposType) {
  let typeName = aposType.split('/')[1];

  typeName = camelcase(typeName, { pascalCase: true });
  return `AposCore${typeName}`;
}

async function getPiecePage(route, opts) {
  const response = await fetch(`${route}?apikey=${opts.apiKey}&page=${opts.page}`);
  const data = await response.json();
  return data.results;
}

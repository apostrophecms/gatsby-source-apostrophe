
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
const {
  processPieceTypes
} = require('./lib/pieces');
const {
  getPageIds,
  generatePageNodes
} = require('./lib/pages');

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId
}, options) => {
  options = options || {};
  const { createNode } = actions;

  if (!options.baseUrl) {
    throw Error('You are missing the `baseUrl` option for gatsby-source-apostrophe');
  }
  if (!options.apiKey) {
    throw Error('You are missing the `apiKey` option for gatsby-source-apostrophe');
  }

  const gatsbyUtils = {
    createNode,
    createNodeId,
    createContentDigest
  };

  const routePathBase = options.routeBase || 'api/v1';
  const apiRouteBase = `${options.baseUrl}/${routePathBase}`;

  if (Array.isArray(options.pieceTypes)) {
    await processPieceTypes(options.pieceTypes, {
      apiRouteBase,
      apiKey: options.apiKey
    }, gatsbyUtils);
  }

  const pageIds = await getPageIds(apiRouteBase, {
    apiKey: options.apiKey
  });

  await generatePageNodes(pageIds, {
    apiRouteBase,
    apiKey: options.apiKey
  }, gatsbyUtils);
};

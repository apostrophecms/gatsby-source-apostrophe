
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
  const { createNode } = actions;

  if (!options.baseUrl) {
    throw Error('You are missing the `baseUrl` option for gatsby-source-apostrophe');
  }
  if (!options.apiKey) {
    throw Error('You are missing the `apiKey` option for gatsby-source-apostrophe');
  }

  const routePathBase = options.routeBase || 'api/v1';
  const apiRouteBase = `${options.baseUrl}/${routePathBase}`;

  if (Array.isArray(options.pieceTypes)) {
    for (const type of options.pieceTypes) {
      const route = `${apiRouteBase}/${type}`;
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

  const pageIds = await getPageIds(apiRouteBase, {
    apiKey: options.apiKey
  });

  await generatePageNodes(pageIds, {
    apiRouteBase,
    apiKey: options.apiKey
  });

  function generateNode(data, nodeType) {
    data.aposId = data._id;
    data._id = undefined;
    createNode({
      ...data,
      id: createNodeId(`${nodeType}-${data.aposId}`),
      parent: null,
      children: [],
      internal: {
        type: nodeType,
        content: JSON.stringify(data),
        contentDigest: createContentDigest(data)
      }
    });
  }

  async function generatePieceNodes (pieces, nodeType) {
    // loop through data and create Gatsby nodes
    pieces.forEach(piece => {
      generateNode(piece, nodeType);
    });
  }

  async function generatePageNodes(ids, { apiRouteBase, apiKey }) {
    for (const id of ids) {
      let page;

      try {
        const response = await fetch(`${apiRouteBase}/@apostrophecms/page/${id}?apikey=${apiKey}`);
        page = await response.json();
      } catch (error) {
        console.error(`Error requesting Apostrophe page with ID ${id}`, error);
        return;
      }

      if (!page || page.message === 'notfound') {
        // This is most likely the trash "page"
        console.warn(`No page found for Apostrophe document ID ${id}.`);
        return;
      }

      cleanupPage(page);

      generateNode(page, 'AposCorePage');
    }
  }
};

// TODO Add option to override `superfluous`.
function cleanupPage(page) {
  // Remove document properties unneeded by Gatsby.
  const superflous = [
    'orphan', 'parkedId', 'parked', 'updatedBy',
    'highSearchText', 'highsearchWords', 'lowSearchText', 'searchSummary',
    'historicUrls', '_edit', '_ancestors', '_children'
  ];
  superflous.forEach(prop => {
    page[prop] = undefined;
  });
}

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

async function getPageIds(routeBase, opts) {
  try {
    const response = await fetch(`${routeBase}/@apostrophecms/page?apikey=${opts.apiKey}&all=1&flat=1`);
    const data = await response.json();
    const pages = data.results.filter(doc => doc.type !== '@apostrophecms/trash');
    return pages.map(page => page._id);
  } catch (error) {
    console.error('Error requesting Apostrophe page IDs:', error);
    return [];
  }
}

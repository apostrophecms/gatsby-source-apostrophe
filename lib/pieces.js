const { generateNode } = require('./nodes');
const camelcase = require('camelcase').default;
const fetch = require('node-fetch').default;

module.exports = {
  processPieceTypes: async function (pieceTypes, { apiRouteBase, apiKey }, utils) {
    for (const type of pieceTypes) {
      const route = `${apiRouteBase}/${type}?apikey=${apiKey}`;
      let data;

      try {
        const response = await fetch(route);
        data = await response.json();
      } catch (error) {
        console.error('Error requesting Apostrophe pieces:', error);
        continue;
      }

      if (!data.results) {
        continue;
      }
      const totalPages = data.pages;

      const nodeTypeName = isAposCoreType(type)
        ? convertCoreType(type)
        : `Apos${camelcase(type, { pascalCase: true })}`;

      await generatePieceNodes(data.results, nodeTypeName, utils);

      if (totalPages <= 1) {
        continue;
      };

      for (let i = 2; i <= totalPages; i++) {
        const pageResults = await getPiecePage(route, {
          apiKey: apiKey,
          page: i
        });
        await generatePieceNodes(pageResults, nodeTypeName, utils);
      }

    }
  }
};

async function generatePieceNodes (pieces, nodeType, utils) {
  // loop through data and create Gatsby nodes
  pieces.forEach(piece => {
    generateNode(piece, nodeType, utils);
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

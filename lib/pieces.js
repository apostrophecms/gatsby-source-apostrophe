const { generateNode } = require('./nodes');
const camelcase = require('camelcase').default;
const fetch = require('node-fetch').default;

module.exports = {
  processPieceTypes: async function (pieceTypes, { apiRouteBase, apiKey }, utils) {
    for (const type of pieceTypes) {
      const route = `${apiRouteBase}/${type}?apikey=${apiKey}&render-areas=true`;
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

      const nodeTypeName = isNamespaced(type)
        ? convertNamespacing(type)
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

function isNamespaced(name) {
  return name.match(/^@[A-Za-z0-9]*\/[A-Za-z0-9]*$/);
}

function convertNamespacing (name) {
  if (name.match(/^@apostrophecms\/[A-Za-z0-9]*$/)) {
    let typeName = name.split('/')[1];
    typeName = camelcase(typeName, { pascalCase: true });
    return `AposCore${typeName}`;
  } else {
    const cleanedName = name.slice(1).split('/').join('-');
    return `Apos${camelcase(cleanedName, { pascalCase: true })}`;
  }
}

async function getPiecePage(route, opts) {
  const response = await fetch(`${route}?apikey=${opts.apiKey}&page=${opts.page}&render-areas=true`);
  const data = await response.json();
  return data.results;
}

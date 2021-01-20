const { generateNode } = require('./nodes');
const fetch = require('node-fetch').default;

module.exports = {
  getPageIds: async function (routeBase, opts) {
    try {
      const response = await fetch(`${routeBase}/@apostrophecms/page?apikey=${opts.apiKey}&all=1&flat=1`);
      const data = await response.json();
      const pages = data.results.filter(doc => doc.type !== '@apostrophecms/trash');
      return pages.map(page => page._id);
    } catch (error) {
      console.error('Error requesting Apostrophe page IDs:', error);
      return [];
    }
  },
  generatePageNodes: async function (ids, { apiRouteBase, apiKey }, utils) {
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

      generateNode(page, 'AposCorePage', utils);
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

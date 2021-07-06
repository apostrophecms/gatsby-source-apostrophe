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
  generatePageNodes: async function (ids, {
    baseUrl, apiRouteBase, apiKey, renderPages
  }, utils) {
    for (const id of ids) {
      let page;

      try {
        const response = await fetch(`${apiRouteBase}/@apostrophecms/page/${id}?apikey=${apiKey}&render-areas=true`);
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

      if (renderPages !== false && page._url) {
        await addRenderedContent(page, baseUrl);
      }

      cleanupPage(page);

      generateNode(page, 'AposCorePage', utils);
    }
  }
};

// TODO Add option to override `superfluous`.
function cleanupPage(page) {
  // Remove document properties unneeded by Gatsby.
  superfluous.forEach(prop => {
    page[prop] = undefined;
  });
}

async function addRenderedContent(page, apiBaseUrl) {
  try {
    const response = await fetch(`${page._url}?aposRefresh=1&headless=true`);
    page._rendered = await response.text();
  } catch (error) {
    console.error('Error fetching rendered page HTML. If related to not having an absolute URL, check if `baseUrl` is set on the Apostrophe app.', error);
    page._rendered = '';
  }
}

const superfluous = [
  '_ancestors',
  '_edit',
  '_children',
  'highSearchText',
  'highSearchWords',
  'historicUrls',
  'lowSearchText',
  'orphan',
  'parked',
  'parkedId',
  'searchSummary',
  'updatedBy'
];

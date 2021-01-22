module.exports = {
  generateNode: function (data, nodeType, utils) {
    data.aposId = data._id;
    data._id = undefined;
    utils.createNode({
      ...data,
      id: utils.createNodeId(`${nodeType}-${data.aposId}`),
      parent: null,
      children: [],
      internal: {
        type: nodeType,
        content: JSON.stringify(data),
        contentDigest: utils.createContentDigest(data)
      }
    });
  }
};

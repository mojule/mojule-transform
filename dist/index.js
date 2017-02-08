'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _require = require('mojule-utils'),
    clone = _require.clone;

var Tree = require('1tree-json');

var transforms = {
  values: function values(data) {
    var model = data.model,
        transform = data.transform;


    var transformTree = Tree(transform);

    var valuePropertyNodes = transformTree.findAll(function (n) {
      return n.value().propertyName === '$value';
    });

    if (valuePropertyNodes.length === 0) return data;

    valuePropertyNodes.forEach(function (propertyNode) {
      var objectNode = propertyNode.getParent();
      var objectNodeParent = objectNode.getParent();

      var value = propertyNode.value();
      var sourcePropertyName = value.nodeValue;

      var newValueNode = sourcePropertyName in model ? Tree(model[sourcePropertyName]) : Tree('$delete');

      var propertyName = objectNode.value().propertyName;

      objectNodeParent.setProperty(newValueNode, propertyName);
    });

    transform = transformTree.toJson();

    return { model: model, transform: transform };
  },
  ifs: function ifs(data) {
    var model = data.model,
        transform = data.transform;


    var transformTree = Tree(transform);

    var ifPropertyNodes = transformTree.findAll(function (n) {
      return n.value().propertyName === '$if';
    });

    ifPropertyNodes.forEach(function (propertyNode) {
      var objectNode = propertyNode.getParent();
      var objectNodeParent = objectNode.getParent();

      var ifArgNodes = propertyNode.getChildren();

      var isValue = ifArgNodes[0].value().nodeValue;

      if (isValue && isValue !== '$delete') {
        var ifValueNode = ifArgNodes[1];

        var propertyName = objectNode.value().propertyName;

        if (propertyName) {
          var newValue = ifValueNode.value();
          newValue.propertyName = propertyName;
          ifValueNode.value(newValue);
        }

        objectNodeParent.setProperty(ifValueNode, propertyName);
        //objectNodeParent.insertBefore( ifValueNode, objectNode )
      }

      objectNode.remove();
    });

    transform = transformTree.toJson();

    return { model: model, transform: transform };
  },
  deletes: function deletes(data) {
    var model = data.model,
        transform = data.transform;


    var transformKeys = Object.keys(transform);

    transformKeys.forEach(function (propertyName) {
      if (transform[propertyName] === '$delete') {
        delete model[propertyName];
        delete transform[propertyName];
      }
    });

    return { model: model, transform: transform };
  },
  substitutes: function substitutes(data) {
    var model = data.model,
        transform = data.transform;


    var transformKeys = Object.keys(transform);

    transformKeys.forEach(function (propertyName) {
      model[propertyName] = transform[propertyName];
    });

    return { model: model, transform: transform };
  }
};

var transformMapper = function transformMapper(model, transform) {
  if (Array.isArray(model)) {
    return model.map(function (el) {
      return transformMapper(el, transform);
    });
  } else if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
    return model;
  }

  var data = clone({ model: model, transform: transform });

  Object.keys(transforms).forEach(function (transformName) {
    var fn = transforms[transformName];

    data = fn(data);
  });

  return data.model;
};

module.exports = transformMapper;
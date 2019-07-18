/**
 * Catalog service
 */

'use strict';

/**
 * Module dependencies.
 */

var errors = require('../errors');
var utils = require('../utils');

/**
 * Initialize a new `CatalogService` client.
 */

function CatalogService(consul) {
  this.consul = consul;
}

/**
 * Lists services in a given DC
 */

CatalogService.prototype.list = function(opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  } else if (typeof opts === 'string') {
    opts = { dc: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.list',
    path: '/catalog/services',
    query: {},
  };

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Lists the nodes in a given service
 */

CatalogService.prototype.nodes = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { service: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.nodes',
    path: '/catalog/service/{service}',
    params: { service: opts.service },
    query: {},
  };

  if (!opts.service) {
    return callback(this.consul._err(errors.Validation('service required'), req));
  }
  if (opts.tag) req.query.tag = opts.tag;

  utils.options(req, opts);

  this.consul._get(req, utils.body, callback);
};

/**
 * Registers a new service
 */

CatalogService.prototype.register = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { name: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.register',
    path: '/catalog/register',
    type: 'json',
    body: opts
  };

  try {
    if (Array.isArray(opts.checks)) {
      req.body.Checks = opts.checks.map(utils.createServiceCheck);
    } else if (opts.check) {
      req.body.Check = utils.createServiceCheck(opts.check);
    }
  } catch (err) {
    return callback(this.consul._err(errors.Validation(err.message), req));
  }

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Deregister a service
 */

CatalogService.prototype.deregister = function(opts, callback) {
  if (typeof opts === 'string') {
    opts = { node: opts };
  }

  opts = utils.normalizeKeys(opts);
  opts = utils.defaults(opts, this.consul._defaults);

  var req = {
    name: 'catalog.service.deregister',
    path: '/catalog/deregister',
    type: 'json',
    body: {},
  };

  if (!opts.node) {
    return callback(this.consul._err(errors.Validation('node id required'), req));
  }

  req.body.Node = opts.node;

  utils.options(req, opts);

  this.consul._put(req, utils.empty, callback);
};

/**
 * Module Exports.
 */

exports.CatalogService = CatalogService;

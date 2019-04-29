"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _parser = _interopRequireDefault(require("./parser"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _requester = _interopRequireDefault(require("./requester"));

var _lodash = _interopRequireDefault(require("lodash"));

var _debugnyan = _interopRequireDefault(require("debugnyan"));

var _methods = _interopRequireDefault(require("./methods"));

var _requestLogger = _interopRequireDefault(require("./logging/request-logger"));

var _semver = _interopRequireDefault(require("semver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module dependencies.
 */

/**
 * Source arguments to find out if a callback has been passed.
 */
function source(...args) {
  const last = _lodash.default.last(args);

  let callback;

  if (_lodash.default.isFunction(last)) {
    callback = last;
    args = _lodash.default.dropRight(args);
  }

  return [args, callback];
}
/**
 * List of networks and their default port mapping.
 */


const networks = {
  mainnet: 9333,
  testnet: 19333
};
/**
 * Constructor.
 */

class Client {
  constructor({
    agentOptions,
    headers = false,
    host = 'localhost',
    logger = (0, _debugnyan.default)('vdinar-rpc'),
    network = 'mainnet',
    password,
    port,
    ssl = false,
    timeout = 30000,
    username,
    version
  } = {}) {
    if (!_lodash.default.has(networks, network)) {
      throw new Error(`Invalid network name "${network}"`, {
        network
      });
    }

    this.agentOptions = agentOptions;
    this.auth = (password || username) && {
      pass: password,
      user: username
    };
    this.hasNamedParametersSupport = false;
    this.headers = headers;
    this.host = host;
    this.password = password;
    this.port = port || networks[network];
    this.ssl = {
      enabled: _lodash.default.get(ssl, 'enabled', ssl),
      strict: _lodash.default.get(ssl, 'strict', _lodash.default.get(ssl, 'enabled', ssl))
    };
    this.timeout = timeout;

    if (version) {
      // Capture X.Y.Z when X.Y.Z.A is passed to support oddly formatted
      // versions such as 0.15.0.1.
      const result = /[0-9]+\.[0-9]+\.[0-9]+/.exec(version);

      if (!result) {
        throw new Error(`Invalid Version "${version}"`, {
          version
        });
      }

      [version] = result;
      this.hasNamedParametersSupport = _semver.default.satisfies(version, '>=0.14.0');
    }

    this.version = version;
    this.methods = _lodash.default.transform(_methods.default, (result, method, name) => {
      result[_lodash.default.toLower(name)] = {
        features: _lodash.default.transform(method.features, (result, constraint, name) => {
          result[name] = {
            supported: version ? _semver.default.satisfies(version, constraint) : true
          };
        }, {}),
        supported: version ? _semver.default.satisfies(version, method.version) : true
      };
    }, {});
    const request = (0, _requestLogger.default)(logger);
    this.request = _bluebird.default.promisifyAll(request.defaults({
      agentOptions: this.agentOptions,
      baseUrl: `${this.ssl.enabled ? 'https' : 'http'}://${this.host}:${this.port}`,
      strictSSL: this.ssl.strict,
      timeout: this.timeout
    }), {
      multiArgs: true
    });
    this.requester = new _requester.default({
      methods: this.methods,
      version
    });
    this.parser = new _parser.default({
      headers: this.headers
    });
  }
  /**
   * Execute `rpc` command.
   */


  command(...args) {
    let body;
    let callback;
    let [input, ...parameters] = args; // eslint-disable-line prefer-const

    const lastArg = _lodash.default.last(parameters);

    const isBatch = Array.isArray(input);

    if (_lodash.default.isFunction(lastArg)) {
      callback = lastArg;
      parameters = _lodash.default.dropRight(parameters);
    }

    if (isBatch) {
      body = input.map((method, index) => this.requester.prepare({
        method: method.method,
        parameters: method.parameters,
        suffix: index
      }));
    } else {
      if (this.hasNamedParametersSupport && parameters.length === 1 && _lodash.default.isPlainObject(parameters[0])) {
        parameters = parameters[0];
      }

      body = this.requester.prepare({
        method: input,
        parameters
      });
    }

    return _bluebird.default.try(() => {
      return this.request.postAsync({
        auth: _lodash.default.pickBy(this.auth, _lodash.default.identity),
        body: JSON.stringify(body),
        uri: `/`
      }).bind(this).then(this.parser.rpc);
    }).asCallback(callback);
  }
}
/**
 * Add all known RPC methods.
 */


_lodash.default.forOwn(_methods.default, (options, method) => {
  Client.prototype[method] = _lodash.default.partial(Client.prototype.command, method.toLowerCase());
});
/**
 * Export Client class (ESM).
 */


var _default = Client;
/**
 * Export Client class (CJS) for compatibility with require('vdinar-rpc').
 */

exports.default = _default;
module.exports = Client;

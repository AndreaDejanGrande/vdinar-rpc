
/**
 * Module dependencies.
 */

import Parser from './parser';
import Promise from 'bluebird';
import Requester from './requester';
import _ from 'lodash';
import debugnyan from 'debugnyan';
import methods from './methods';
import requestLogger from './logging/request-logger';
import semver from 'semver';

/**
 * Source arguments to find out if a callback has been passed.
 */

function source(...args) {
  const last = _.last(args);

  let callback;

  if (_.isFunction(last)) {
    callback = last;
    args = _.dropRight(args);
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
    logger = debugnyan('vdinar-rpc'),
    network = 'mainnet',
    password,
    port,
    ssl = false,
    timeout = 30000,
    username,
    version
  } = {}) {
    if (!_.has(networks, network)) {
      throw new Error(`Invalid network name "${network}"`, { network });
    }

    this.agentOptions = agentOptions;
    this.auth = (password || username) && { pass: password, user: username };
    this.hasNamedParametersSupport = false;
    this.headers = headers;
    this.host = host;
    this.password = password;
    this.port = port || networks[network];
    this.ssl = {
      enabled: _.get(ssl, 'enabled', ssl),
      strict: _.get(ssl, 'strict', _.get(ssl, 'enabled', ssl))
    };
    this.timeout = timeout;

    // Version handling.
    if (version) {
      // Capture X.Y.Z when X.Y.Z.A is passed to support oddly formatted
      // versions such as 0.15.0.1.
      const result = /[0-9]+\.[0-9]+\.[0-9]+/.exec(version);

      if (!result) {
        throw new Error(`Invalid Version "${version}"`, { version });
      }

      [version] = result;

      this.hasNamedParametersSupport = semver.satisfies(version, '>=0.14.0');
    }

    this.version = version;
    this.methods = _.transform(methods, (result, method, name) => {
      result[_.toLower(name)] = {
        features: _.transform(method.features, (result, constraint, name) => {
          result[name] = {
            supported: version ? semver.satisfies(version, constraint) : true
          };
        }, {}),
        supported: version ? semver.satisfies(version, method.version) : true
      };
    }, {});

    const request = requestLogger(logger);

    this.request = Promise.promisifyAll(request.defaults({
      agentOptions: this.agentOptions,
      baseUrl: `${this.ssl.enabled ? 'https' : 'http'}://${this.host}:${this.port}`,
      strictSSL: this.ssl.strict,
      timeout: this.timeout
    }), { multiArgs: true });
    this.requester = new Requester({ methods: this.methods, version });
    this.parser = new Parser({ headers: this.headers });
  }

  /**
   * Execute `rpc` command.
   */

  command(...args) {
    let body;
    let callback;
    let [input, ...parameters] = args; // eslint-disable-line prefer-const
    const lastArg = _.last(parameters);
    const isBatch = Array.isArray(input);

    if (_.isFunction(lastArg)) {
      callback = lastArg;
      parameters = _.dropRight(parameters);
    }

    if (isBatch) {
      body = input.map((method, index) => this.requester.prepare({
        method: method.method,
        parameters: method.parameters,
        suffix: index
      }));
    } else {
      if (this.hasNamedParametersSupport && parameters.length === 1 && _.isPlainObject(parameters[0])) {
        parameters = parameters[0];
      }

      body = this.requester.prepare({ method: input, parameters });
    }

    return Promise.try(() => {
      return this.request.postAsync({
        auth: _.pickBy(this.auth, _.identity),
        body: JSON.stringify(body),
        uri: `/`
      }).bind(this)
        .then(this.parser.rpc);
    }).asCallback(callback);
  }
}

/**
 * Add all known RPC methods.
 */

_.forOwn(methods, (options, method) => {
  Client.prototype[method] = _.partial(Client.prototype.command, method.toLowerCase());
});

/**
 * Export Client class (ESM).
 */

export default Client;

/**
 * Export Client class (CJS) for compatibility with require('vdinar-rpc').
 */

module.exports = Client;

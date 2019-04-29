
/**
 * Default config for Docker-based test suite.
 */

/**
 * Get Docker host.
 */

function getHost(name) {
  return process.env.CI === 'true' ? name : '127.0.0.1'; // eslint-disable-line no-process-env
}

/**
 * Services config.
 */

const config = {
  vdinar: {
    host: getHost('vdinar-rpc'),
    password: 'bar',
    port: 19443,
    username: 'foo'
  },
  vdinarSsl: {
    host: getHost('vdinar-rpc-ssl'),
    password: 'bar',
    port: 19453,
    username: 'foo'
  },
  vdinarUsernameOnly: {
    host: getHost('vdinar-rpc-username-only'),
    port: 19463,
    username: 'foo'
  }
};

/**
 * Export `config`.
 */

export default config;

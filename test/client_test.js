
/**
 * Module dependencies.
 */

import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import _ from 'lodash';
import config from './config';
import fs from 'fs';
import methods from '../src/methods';
import parse from './utils/help-parser-util';
import path from 'path';
import should from 'should';

/**
 * Test `Client`.
 */

describe('Client', () => {
  before(async () => {
    const client = new Client(config.vdinar);
  });

  describe('constructor', () => {
    it('should throw an error if network is invalid', () => {
      try {
        new Client(_.defaults({ network: 'foo' }, config.vdinar)); // eslint-disable-line no-new

        should.fail();
      } catch (error) {
        error.should.be.an.instanceOf(Error);
        error.message.should.equal('Invalid network name "foo"');
      }
    });

    it('should not return headers by default', () => {
      new Client().headers.should.be.false();
    });

    it('should have default host set to `localhost`', () => {
      new Client().host.should.equal('localhost');
    });

    it('should not have a password set by default', () => {
      should.not.exist(new Client().password);
    });

    it('should have default port set to `mainnet`\'s one', () => {
      new Client().port.should.equal(9333);
    });

    it('should set default to port `9333` if network is `mainnet`', () => {
      new Client({ network: 'mainnet' }).port.should.equal(9333);
    });

    it('should set default to port `19333` if network is `testnet`', () => {
      new Client({ network: 'testnet' }).port.should.equal(19333);
    });

    it('should not have ssl enabled by default', () => {
      new Client().ssl.enabled.should.equal(false);
      new Client().ssl.strict.should.equal(false);
    });

    it('should have default timeout of 30000ms', () => {
      new Client().timeout.should.equal(30000);
    });

    it('should not have username/password authentication enabled by default', () => {
      should.not.exist(new Client().auth);
    });

    it('should have all the methods listed by `help`', async () => {
      const help = await new Client(config.vdinar).help();

      _.difference(parse(help), _.invokeMap(Object.keys(methods), String.prototype.toLowerCase)).should.be.empty();
    });

    it('should accept valid versions', async () => {
      await new Client(_.defaults({ version: '2.1.0.1' }, config.vdinar)).getInfo();
      await new Client(_.defaults({ version: '2.1.0' }, config.vdinar)).getInfo();
    });
  });

  describe('connections', () => {
    describe('general', () => {
      it('should throw an error if timeout is reached', async () => {
        try {
          await new Client(_.defaults({ timeout: 0.1 }, config.vdinar)).listAccounts();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.code.should.match(/(ETIMEDOUT|ESOCKETTIMEDOUT)/);
        }
      });

      it('should throw an error if version is invalid', async () => {
        try {
          await new Client({ version: '0.12' }).getHashesPerSec();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.equal('Invalid Version "0.12"');
        }
      });

      it('should throw an error if a connection cannot be established', async () => {
        try {
          await new Client(_.defaults({ port: 9897 }, config.vdinar)).getDifficulty();

          should.fail();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.message.should.match(/connect ECONNREFUSED/);
          e.code.should.equal('ECONNREFUSED');
        }
      });
    });

    describe('ssl', () => {
      it('should use `ssl.strict` by default when `ssl` is enabled', () => {
        const sslClient = new Client(_.defaults({ host: config.vdinarSsl.host, port: config.vdinarSsl.port, ssl: true }, config.vdinar));

        sslClient.ssl.strict.should.be.true();
      });

      it('should throw an error if certificate is self signed by default', async () => {
        const sslClient = new Client(_.defaults({ host: config.vdinarSsl.host, port: config.vdinarSsl.port, ssl: true }, config.vdinar));

        sslClient.ssl.strict.should.be.true();

        try {
          await sslClient.getInfo();
        } catch (e) {
          e.should.be.an.instanceOf(Error);
          e.code.should.equal('DEPTH_ZERO_SELF_SIGNED_CERT');
          e.message.should.equal('self signed certificate');
        }
      });

      it('should establish a connection if certificate is self signed but `ca` agent option is passed', async () => {
        const sslClient = new Client(_.defaults({
          agentOptions: {
            /* eslint-disable no-sync */
            ca: fs.readFileSync(path.join(__dirname, '/config/ssl/cert.pem')),
            checkServerIdentity() {
              // Skip server identity checks otherwise the certificate would be immediately rejected
              // as connecting to an IP not listed in the `altname` fails.
              return;
            }
          },
          host: config.vdinarSsl.host,
          port: config.vdinarSsl.port,
          ssl: true
        }, config.vdinar));

        const info = await sslClient.getInfo();

        info.should.not.be.empty();
      });

      it('should establish a connection if certificate is self signed but `ssl.strict` is disabled', async () => {
        const sslClient = new Client(_.defaults({ host: config.vdinarSsl.host, port: config.vdinarSsl.port, ssl: { enabled: true, strict: false } }, config.vdinar));
        const info = await sslClient.getInfo();

        info.should.not.be.empty();
      });
    });

    describe('authentication', () => {
      it('should throw an error if credentials are invalid', async () => {
        try {
          await new Client(_.defaults({ password: 'biz', username: 'foowrong' }, config.vdinar)).getDifficulty();
        } catch (e) {
          e.should.be.an.instanceOf(RpcError);
          e.message.should.equal('Unauthorized');
          e.body.should.equal('');
          e.code.should.equal(401);
        }
      });

      it('should support username only authentication', async () => {
        const difficulty = await new Client(config.vdinarUsernameOnly).getDifficulty();

        difficulty.should.equal(0);
      });
    });
  });

  describe('callbacks', () => {
    it('should support callbacks', done => {
      new Client(config.vdinar).help((err, help) => {
        should.not.exist(err);

        help.should.not.be.empty();

        done();
      });
    });
  });
});


/**
 * Module dependencies.
 */

import { defaults } from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';
import nock from 'nock';
import should from 'should';

/**
 * Test `Parser`.
 */

afterEach(() => {
  if (nock.pendingMocks().length) {
    throw new Error('Unexpected pending mocks');
  }

  nock.cleanAll();
});

describe('Parser', () => {
  it('should throw an error with a generic message if one is not returned on the response', async () => {
    nock(`http://${config.vdinar.host}:${config.vdinar.port}/`)
      .post('/')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    try {
      await new Client(config.vdinar).command('foobar');

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(RpcError);
      e.message.should.equal('An error occurred while processing the RPC call to vdinard');
      e.code.should.equal(-32601);
    }
  });

  it('should throw an error if the response does not include a `result`', async () => {
    nock(`http://${config.vdinar.host}:${config.vdinar.port}/`)
      .post('/')
      .reply(200, '{ "error": null, "id": "69837016239933"}');

    try {
      await new Client(config.vdinar).command('foobar2');

      should.fail();
    } catch (e) {
      e.should.be.an.instanceOf(RpcError);
      e.message.should.equal('Missing `result` on the RPC call result');
      e.code.should.equal(-32700);
    }
  });

  describe('headers', () => {
    it('should return the response headers if `headers` is enabled', async () => {
      const [info, headers] = await new Client(defaults({ headers: true }, config.vdinar)).getInfo();

      info.should.be.an.Object();
      headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
    });

    it('should return the response headers if `headers` is enabled using callbacks', done => {
      new Client(defaults({ headers: true }, config.vdinar)).getInfo((err, [info, headers]) => {
        should.not.exist(err);

        info.should.be.an.Object();

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });

    it('should return the response headers if `headers` is enabled and batching is used', async () => {
      const batch = [
        { method: 'getbalance' },
        { method: 'getbalance' }
      ];
      const [addresses, headers] = await new Client(defaults({ headers: true }, config.vdinar)).command(batch);

      addresses.should.have.length(batch.length);
      headers.should.have.keys('date', 'connection', 'content-length', 'content-type');
    });

    it('should return the response headers if `headers` is enabled and batching is used with callbacks', done => {
      const batch = [
        { method: 'getbalance' },
        { method: 'getbalance' }
      ];

      new Client(defaults({ headers: true }, config.vdinar)).command(batch, (err, [addresses, headers]) => {
        should.not.exist(err);

        addresses.should.have.length(batch.length);

        headers.should.have.keys('date', 'connection', 'content-length', 'content-type');

        done();
      });
    });
  });
});


/**
 * Module dependencies.
 */

import { defaults } from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';

/**
 * Test instance.
 */

const client = new Client(config.vdinar);

/**
 * Test `Client`.
 */

describe('Single Wallet', () => {
  describe('node-level requests', () => {
    describe('getDifficulty()', () => {
      it('should return the proof-of-work difficulty', async () => {
        const difficulty = await client.getDifficulty();

        difficulty.should.be.a.String();
      });
    });
  });

  describe('wallet-level requests', () => {
    describe('getAccountAddress()', () => {
      it('should retrieve an account address', async () => {
        const address = await client.getAccountAddress('test');
        const account = await client.getAccount(address);

        account.should.equal('test');
      });
    });

    describe('getBalance()', () => {
      it('should return the total server\'s balance', async () => {
        const balance = await client.getBalance();

        balance.should.be.aboveOrEqual(0);
      });

      it('should support named parameters', async () => {
        const client = new Client(defaults({ version: '2.1.0' }, config.vdinar));

        const mainWalletBalance = await client.getBalance({ account: '*', minconf: 0 });
        const mainWalletBalanceWithoutParameters = await client.getBalance('*', 0);
        const testWalletBalance = await client.getBalance({ account: 'test', minconf: 0 });

        mainWalletBalance.should.not.equal(testWalletBalance);
        mainWalletBalanceWithoutParameters.should.equal(mainWalletBalance);
      });
    });

    describe('getNewAddress()', () => {
      it('should return a new vDinar address', async () => {
        await client.getNewAddress('test');

        const addresses = await client.getAddressesByAccount('test');

        addresses.length.should.be.above(1);
      });
    });

    describe('listTransactions()', () => {
      it('should return the most recent list of transactions from all accounts using specific count', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        const transactions = await client.listTransactions('test', 5);

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);
      });

      it('should return the most recent list of transactions from all accounts using default count', async () => {
        const transactions = await client.listTransactions('test');

        transactions.should.be.an.Array();
        transactions.should.matchEach(value => {
          // Only a small subset of transaction properties are being asserted here to make
          // sure we've received a transaction and not an empty object instead.
          value.should.have.keys(
            'account',
            'address',
            'category',
            'amount',
            'confirmations',
            'time',
            'txid'
          );
        });
      });

      it('should support named parameters', async () => {
        const address = await client.getNewAddress('test');

        // Generate 5 transactions.
        for (let i = 0; i < 5; i++) {
          await client.sendToAddress(address, 0.1);
        }

        let transactions = await new Client(defaults({ version: '2.1.0' }, config.vdinar)).listTransactions({ account: 'test' });

        transactions.should.be.an.Array();
        transactions.length.should.be.greaterThanOrEqual(5);

        // Make sure `count` is read correctly.
        transactions = await new Client(defaults({ version: '2.1.0' }, config.vdinar)).listTransactions({ account: 'test', count: 1 });

        transactions.should.be.an.Array();
        transactions.should.have.length(1);
      });
    });
  });

  describe('batched requests', () => {
    it('should support request parameters in batched requests', async () => {
      const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['DG1KpSsSXd3uitgwHaA1i6T1Bj1hWEwAxB'] }];

      const [newAddress, addressValidation] = await client.command(batch);

      addressValidation.should.have.properties('address', 'ismine', 'isvalid', 'scriptPubKey');
      newAddress.should.be.a.String();
    });

    it('should return an error if one of the request fails', async () => {
      const batch = [{ method: 'validateaddress' }, { method: 'validateaddress', parameters: ['DG1KpSsSXd3uitgwHaA1i6T1Bj1hWEwAxB'] }];

      const [validateAddressError, validateAddress] = await client.command(batch);

      validateAddress.should.have.properties('address', 'ismine', 'isvalid', 'scriptPubKey');
      validateAddressError.should.be.an.instanceOf(RpcError);
      validateAddressError.code.should.equal(-1);
    });
  });
});

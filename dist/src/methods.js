"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = require("lodash");

/* eslint-disable no-inline-comments */

/**
 * Module dependencies.
 */

/**
 * Export available rpc methods.
 */
var _default = {
  addMultiSigAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  addNode: {
    category: 'network',
    version: '>=1.0.0'
  },
  backupWallet: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  createMultiSig: {
    category: 'util',
    version: '>=1.0.0'
  },
  createRawTransaction: {
    category: 'rawtransactions',
    version: '>=1.0.0'
  },
  decodeRawTransaction: {
    category: 'rawtransactions',
    version: '>=1.0.0'
  },
  dumpPrivKey: {
    category: 'wallet',
    obfuscate: {
      response: () => '******'
    },
    version: '>=1.0.0'
  },
  encryptWallet: {
    category: 'wallet',
    obfuscate: {
      request: {
        default: params => set([...params], '[0]', '******'),
        named: params => set(params, 'passphrase', '******')
      }
    },
    version: '>=1.0.0'
  },
  getAccount: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getAccountAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getAddedNodeInfo: {
    category: 'network',
    version: '>=1.0.0'
  },
  getAddressesByAccount: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getBalance: {
    category: 'wallet',
    version: '>=0.0.0'
  },
  getBestBlockHash: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getBlock: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getBlockchainInfo: {
    category: 'blockchain',
    version: '>=2.1.0'
  },
  getBlockCount: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getBlockHash: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getBlockTemplate: {
    category: 'mining',
    version: '>=1.0.0'
  },
  getConnectionCount: {
    category: 'network',
    version: '>=1.0.0'
  },
  getDifficulty: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getGenerate: {
    category: 'generating',
    version: '>=1.0.0'
  },
  getHashesPerSec: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getInfo: {
    category: 'control',
    version: '>=1.0.0'
  },
  getMiningInfo: {
    category: 'mining',
    version: '>=1.0.0'
  },
  getNetworkHashPs: {
    category: 'mining',
    version: '>=1.0.0'
  },
  getNetworkInfo: {
    category: 'network',
    version: '>=2.1.0'
  },
  getNewAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getNormalizedTxId: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getPeerInfo: {
    category: 'network',
    version: '>=1.0.0'
  },
  getRawMempool: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getRawTransaction: {
    category: 'rawtransactions',
    version: '>=1.0.0'
  },
  getReceivedByAccount: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getReceivedByAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getTransaction: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  getTxOut: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getTxOutSetInfo: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getWork: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  getWorkEx: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  help: {
    category: 'control',
    version: '>=1.0.0'
  },
  importPrivKey: {
    category: 'wallet',
    obfuscate: {
      request: {
        default: () => ['******'],
        named: params => set(params, 'privkey', '******')
      }
    },
    version: '>=1.0.0'
  },
  keypoolRefill: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listAccounts: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listAddressGroupings: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listLockUnspent: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listReceivedByAccount: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listReceivedByAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listSinceBlock: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listTransactions: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  listUnspent: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  lockUnspent: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  move: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  sendFrom: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  sendMany: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  sendRawTransaction: {
    category: 'rawtransactions',
    version: '>=1.0.0'
  },
  sendToAddress: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  setAccount: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  setGenerate: {
    category: 'generating',
    version: '>=1.0.0'
  },
  setMinInput: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  setTxFee: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  signMessage: {
    category: 'wallet',
    version: '>=1.0.0'
  },
  signRawTransaction: {
    category: 'rawtransactions',
    obfuscate: {
      request: {
        default: params => set([...params], '[2]', map(params[2], () => '******')),
        named: params => set(params, 'privkeys', map(params.privkeys || [], () => '******'))
      }
    },
    version: '>=1.0.0'
  },
  stop: {
    category: 'control',
    version: '>=1.0.0'
  },
  submitBlock: {
    category: 'mining',
    version: '>=1.0.0'
  },
  validateAddress: {
    category: 'util',
    version: '>=1.0.0'
  },
  verifyChain: {
    category: 'blockchain',
    version: '>=1.0.0'
  },
  verifyMessage: {
    category: 'util',
    version: '>=1.0.0'
  }
};
exports.default = _default;

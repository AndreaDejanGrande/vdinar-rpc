# vdinar-rpc
A JavaScript RPC client for vDinar to execute administrative tasks, queries about the network and blockchain.

## Usage
### Client(...args)
#### Arguments
1. `[agentOptions]` _(Object)_: Optional `agent` [options](https://github.com/request/request#using-optionsagentoptions) to configure SSL/TLS.
2. `[headers=false]` _(boolean)_: Whether to return the response headers.
3. `[host=localhost]` _(string)_: The host to connect to.
4. `[logger=debugnyan('vdinar-rpc')]` _(Function)_: Custom logger (by default, `debugnyan`).
5. `[network=mainnet]` _(string)_: The network
6. `[password]` _(string)_: The RPC server user password.
7. `[port=[network]]` _(string)_: The RPC server port.
8. `[ssl]` _(boolean|Object)_: Whether to use SSL/TLS with strict checking (_boolean_) or an expanded config (_Object_).
9. `[ssl.enabled]` _(boolean)_: Whether to use SSL/TLS.
10. `[ssl.strict]` _(boolean)_: Whether to do strict SSL/TLS checking (certificate must match host).
11. `[timeout=30000]` _(number)_: How long until the request times out (ms).
12. `[username]` _(number)_: The RPC server user name.
13. `[version]` _(string)_: Which version to check methods for ([read more](#versionchecking)).

### Examples
#### Using network mode
The `network` will automatically determine the port to connect to, just like the `vdinard` command.

```js
const Client = require('vdinar-rpc');
const client = new Client({ network: 'mainnet' });
```

##### Setting a custom port

```js
const client = new Client({ port: 9334 });
```

#### Connecting to an SSL/TLS server with strict checking enabled
By default, when `ssl` is enabled, strict checking is implicitly enabled.

```js
const fs = require('fs');
const client = new Client({
  agentOptions: {
    ca: fs.readFileSync('/etc/ssl/vdinard/cert.pem')
  },
  ssl: true
});
```

#### Connecting to an SSL/TLS server without strict checking enabled

```js
const client = new Client({
  ssl: {
    enabled: true,
    strict: false
  }
});
```

#### Using promises to process the response

```js
client.getInfo().then((help) => console.log(help));
```

#### Using callbacks to process the response

```js
client.getInfo((error, help) => console.log(help));
```

#### Returning headers in the response
For compatibility with other vDinar RPC clients.

```js
const client = new Client({ headers: true });

// Promise style with headers enabled:
client.getInfo().then(([body, headers]) => console.log(body, headers));

// Await style based on promises with headers enabled:
const [body, headers] = await client.getInfo();
```

## Named parameters

It is possible to send commands via the JSON-RPC interface using named parameters instead of positional ones. This comes with the advantage of making the order of arguments irrelevant. It also helps improving the readability of certain function calls when leaving out arguments for their default value.

You **must** provide a version in the client arguments to enable named parameters.

```js
const client = new Client({ version: '2.1.0' });
```
For instance, take the `getBalance()` call written using positional arguments:
```js
const balance = await new Client().getBalance('*', 0);
```

It is functionally equivalent to using the named arguments `account` and `minconf`:

```js
const balance = await new Client({ version: '2.1.0' }).getBalance({
  account: '*',
  minconf: 0
});
```

This feature is available to all JSON-RPC methods that accept arguments.

### Floating point number precision in JavaScript

Due to [JavaScript's limited floating point precision](http://floating-point-gui.de/), all big numbers (numbers with more than 15 significant digits) are returned as strings to prevent precision loss. This includes both the RPC and REST APIs.

### Version Checking
By default, all methods are exposed on the client independently of the version it is connecting to. This is the most flexible option as defining methods for unavailable RPC calls does not cause any harm and the library is capable of handling a `Method not found` response error correctly.

```js
const client = new Client();

client.command('foobar');
// => RpcError: -32601 Method not found
```

However, if you prefer to be on the safe side, you can enable strict version checking. This will validate all method calls before executing the actual RPC request:

```js
const client = new Client({ version: '2.0.0' });

client.getHashesPerSec();
// => Method "getnetworkinfo" is not supported by version "2.0.0"
```

If you want to enable strict version checking for the bleeding edge version, you may set a very high version number to exclude recently deprecated calls:

```js
const client = new Client({ version: `${Number.MAX_SAFE_INTEGER}.0.0` });

client.getWork();
// => Throws 'Method "getwork" is not supported by version "9007199254740991.0.0"'.
```

To avoid potential issues with prototype references, all methods are still enumerable on the library client prototype.

### RPC
Start `vdinard` with the RPC server enabled and optionally configure a username and password:

```sh
docker run --rm -it AndreaDejanGrande/vdinar-rpc -printtoconsole -rpcuser=foo -rpcpassword=bar -server
```

These configuration values may also be set on the `vdinar.conf` file of your platform installation.

By default, port `9333` is used to listen for requests in `mainnet` mode, or `19333` in `testnet`. Use the `network` property to initialize the client on the desired mode and automatically set the respective default port. You can optionally set a custom port of your choice too.

The RPC services binds to the localhost loopback network interface, so use `rpcbind` to change where to bind to and `rpcallowip` to whitelist source IP access.

#### Methods
All RPC [methods](src/methods.js) are exposed on the client interface as a camelcase'd version of those available on `vdinard` (see examples below).

##### Examples

```js
client.createRawTransaction([{ txid: '1eb590cd06127f78bf38ab4140c4cdce56ad9eb8886999eb898ddf4d3b28a91d', vout: 0 }], { 'mgnucj8nYqdrPFh2JfZSB1NmUThUGnmsqe': 0.13 });
client.sendMany('test1', { mjSk1Ny9spzU2fouzYgLqGUD8U41iR35QN: 0.1, mgnucj8nYqdrPFh2JfZSB1NmUThUGnmsqe: 0.2 }, 6, 'Example Transaction');
client.sendToAddress('mmXgiR6KAhZCyQ8ndr2BCfEq1wNG2UnyG6', 0.1,  'sendtoaddress example', 'Nemo From Example.com');
```

#### Batch requests
Batch requests are support by passing an array to the `command` method with a `method` and optionally, `parameters`. The return value will be an array with all the responses.

```js
const batch = [
  { method: 'getnewaddress', parameters: [] },
  { method: 'getnewaddress', parameters: [] }
]

new Client().command(batch).then((responses) => console.log(responses)));

// Or, using ES2015 destructuring.
new Client().command(batch).then(([firstAddress, secondAddress]) => console.log(firstAddress, secondAddress)));
```

Note that batched requests will only throw an error if the batch request itself cannot be processed. However, each individual response may contain an error akin to an individual request.

```js
const batch = [
  { method: 'foobar', params: [] },
  { method: 'getnewaddress', params: [] }
]

new Client().command(batch).then(([address, error]) => console.log(address, error)));
// => `mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3, { [RpcError: Method not found] message: 'Method not found', name: 'RpcError', code: -32601 }`.
```


```js
client.getBlockchainInformation([callback]);
```

### SSL
This client supports SSL out of the box. Simply pass the SSL public certificate to the client and optionally disable strict SSL checking which will bypass SSL validation (the connection is still encrypted but the server it is connecting to may not be trusted). This is, of course, discouraged unless for testing purposes when using something like self-signed certificates.

#### Generating a self-signed certificates for testing purposes
Please note that the following procedure should only be used for testing purposes.

Generate an self-signed certificate together with an unprotected private key:

```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 3650 -nodes
```

## Logging

By default, all requests made with `vdinar-rpc` are logged using [uphold/debugnyan](https://github.com/uphold/debugnyan) with `vdinar-rpc` as the logging namespace.

Please note that all sensitive data is obfuscated before calling the logger.

### Custom logger

A custom logger can be passed via the `logger` option and it should implement [bunyan's log levels](https://github.com/trentm/node-bunyan#levels).

## Tests
Currently the test suite is tailored for Docker (including `docker-compose`) due to the multitude of different `vdinard` configurations that are required in order to get the test suite passing.

To test using a local installation of `node.js` but with dependencies (e.g. `vdinard`) running inside Docker:

```sh
npm run dependencies
npm test
```

To test using Docker exclusively (similarly to what is done in Travis CI):

```sh
npm run testdocker
```

## Release

```sh
npm version [<newversion> | major | minor | patch] -m "Release %s"
```

## License
MIT


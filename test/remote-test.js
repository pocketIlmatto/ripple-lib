var assert = require('assert');
var Remote = require('ripple-lib').Remote;
var Server = require('ripple-lib').Server;
var Request = require('ripple-lib').Request;
var UInt160 = require('ripple-lib').UInt160;
var Currency = require('ripple-lib').Currency;

var options, remote, callback, database, tx;

var ADDRESS       = 'r4qLSAzv4LZ9TLsR7diphGwKnSEAMQTSjS';
var PEER_ADDRESS  = 'rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX';
var LEDGER_INDEX  = 9592219;
var LEDGER_HASH   = 'B4FD84A73DBD8F0DA9E320D137176EBFED969691DC0AAC7882B76B595A0841AE';
var PAGING_MARKER = '29F992CC252056BF690107D1E8F2D9FBAFF29FF107B62B1D1F4E4E11ADF2CC73';


describe('Remote', function () {
  beforeEach(function () {
    options = {
      trace :         true,
      trusted:        true,
      local_signing:  true,

      servers: [
        { host: 's-west.ripple.com', port: 443, secure: true },
        { host: 's-east.ripple.com', port: 443, secure: true }
      ],

      blobvault : 'https://blobvault.payward.com',
      persistent_auth : false,
      transactions_per_page: 50,

      bridge: {
        out: {
          //    'bitcoin': 'localhost:3000'
          //    'bitcoin': 'https://www.bitstamp.net/ripple/bridge/out/bitcoin/'
        }
      }

    };
  });

  it('remote server initialization - url object', function() {
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'wss://s-west.ripple.com:443');
  });

  it('remote server initialization - url object - no secure property', function() {
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443 } ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'wss://s-west.ripple.com:443');
  });

  it('remote server initialization - url object - secure: false', function() {
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: false } ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'ws://s-west.ripple.com:443');
  });

  it('remote server initialization - url object - string port', function() {
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: '443', secure: true } ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'wss://s-west.ripple.com:443');
  });

  it('remote server initialization - url object - invalid host', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ { host: '+', port: 443, secure: true } ]
      });
    }, Error);
  });

  it('remote server initialization - url object - invalid port', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ { host: 's-west.ripple.com', port: null, secure: true } ]
      });
    }, TypeError);
  });

  it('remote server initialization - url object - port out of range', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ { host: 's-west.ripple.com', port: 65537, secure: true } ]
      });
    }, Error);
  });

  it('remote server initialization - url string', function() {
    var remote = new Remote({
      servers: [ 'wss://s-west.ripple.com:443' ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'wss://s-west.ripple.com:443');
  });

  it('remote server initialization - url string - ws://', function() {
    var remote = new Remote({
      servers: [ 'ws://s-west.ripple.com:443' ]
    });
    assert(Array.isArray(remote._servers));
    assert(remote._servers[0] instanceof Server);
    assert.strictEqual(remote._servers[0]._url, 'ws://s-west.ripple.com:443');
  });

  it('remote server initialization - url string - invalid host', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ 'ws://+:443' ]
      });
    }, Error
    );
  });

  it('remote server initialization - url string - invalid port', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ 'ws://s-west.ripple.com:null' ]
      });
    }, Error
    );
  });

  it('remote server initialization - url string - port out of range', function() {
    assert.throws(
      function() {
      var remote = new Remote({
        servers: [ 'ws://s-west.ripple.com:65537:' ]
      });
    }, Error
    );
  });

  it('remote server initialization - set max_fee - number', function() {
    var remote = new Remote({
      max_fee: 10
    });
    assert.strictEqual(remote.max_fee, 10);

    remote = new Remote({
      max_fee: 1234567890
    });
    assert.strictEqual(remote.max_fee, 1234567890);
  });

  it('remote server initialization - set max_fee - string fails, should be number', function() {
    var remote = new Remote({
      max_fee: '1234567890'
    });
    assert.strictEqual(remote.max_fee, 1e6);
  });

  it('remote server initialization - max_fee - default', function() {
    var remote = new Remote({
      max_fee: void(0)
    });
    assert.strictEqual(remote.max_fee, 1e6);
    assert.strictEqual(remote.max_fee, 1000000);
    assert.strictEqual((new Remote()).max_fee, 1e6);
  });

  describe('request constructors', function () {
    beforeEach(function () {
      callback = function () {}
      remote = new Remote(options);
    });

    it('requesting a ledger', function () {
      var request = remote.request_ledger(null, {}, callback);
      assert(request instanceof Request);
    });

    it('requesting server info', function () {
      var request = remote.request_server_info(null, {}, callback);
      assert(request instanceof Request);
    })

    it('requesting peers', function () {
      var request = remote.request_peers(null, {}, callback);
      assert(request instanceof Request);
    });

    it('requesting a connection', function () {
      var request = remote.request_connect(null, {}, callback);
      assert(request instanceof Request);
    });

    it('making a unique node list add request', function () {
      var request = remote.request_unl_add(null, {}, callback);
      assert(request instanceof Request);
    });

    it('making a unique node list request', function () {
      var request = remote.request_unl_list(null, {}, callback);
      assert(request instanceof Request);
    });

    it('making a unique node list delete request', function () {
      var request = remote.request_unl_delete(null, {}, callback);
      assert(request instanceof Request);
    });

    it('request account currencies with ledger index', function() {
      var request = remote.requestAccountCurrencies({account: ADDRESS});
      assert.strictEqual(request.message.command, 'account_currencies');
      assert.strictEqual(request.message.account, ADDRESS);
    });

    it('request account info with ledger index', function() {
      var request = remote.requestAccountInfo({account: ADDRESS, ledger: 9592219});
      assert.strictEqual(request.message.command, 'account_info');
      assert.strictEqual(request.message.account, ADDRESS);
      assert.strictEqual(request.message.ledger_index, 9592219);
    });
    it('request account info with ledger hash', function() {
      var request = remote.requestAccountInfo({account: ADDRESS, ledger: LEDGER_HASH});
      assert.strictEqual(request.message.command, 'account_info');
      assert.strictEqual(request.message.account, ADDRESS);
      assert.strictEqual(request.message.ledger_hash, LEDGER_HASH);
    });
    it('request account info with ledger identifier', function() {
      var request = remote.requestAccountInfo({account: ADDRESS, ledger: 'validated'});
      assert.strictEqual(request.message.command, 'account_info');
      assert.strictEqual(request.message.account, ADDRESS);
      assert.strictEqual(request.message.ledger_index, 'validated');
    });

    it('request account balance with ledger index', function() {
      var request = remote.requestAccountBalance(ADDRESS, 9592219);
      assert.strictEqual(request.message.command, 'ledger_entry');
      assert.strictEqual(request.message.account_root, ADDRESS);
      assert.strictEqual(request.message.ledger_index, 9592219);
    });
    it('request account balance with ledger hash', function() {
      var request = remote.requestAccountBalance(ADDRESS, LEDGER_HASH);
      assert.strictEqual(request.message.command, 'ledger_entry');
      assert.strictEqual(request.message.account_root, ADDRESS);
      assert.strictEqual(request.message.ledger_hash, LEDGER_HASH);
    });
    it('request account balance with ledger identifier', function() {
      var request = remote.requestAccountBalance(ADDRESS, 'validated');
      assert.strictEqual(request.message.command, 'ledger_entry');
      assert.strictEqual(request.message.account_root, ADDRESS);
      assert.strictEqual(request.message.ledger_index, 'validated');
    });
  });

  it('pagingAccountRequest', function() {
    var request = Remote.accountRequest('account_lines', {account: ADDRESS});
    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS
    });
  });

  it('pagingAccountRequest - limit', function() {
    var request = Remote.accountRequest('account_lines', {account: ADDRESS, limit: 100});
    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS,
      limit: 100
    });
  });

  it('pagingAccountRequest - limit, marker', function() {
    var request = Remote.accountRequest('account_lines', {account: ADDRESS, limit: 100, marker: PAGING_MARKER, ledger: 9592219});
    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS,
      limit: 100,
      marker: PAGING_MARKER,
      ledger_index: 9592219
    });

    assert(!request.requested);
  });

  it('accountRequest - limit min', function() {
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: 0}).message.limit, 0);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: -1}).message.limit, 0);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: -1e9}).message.limit, 0);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: -1e24}).message.limit, 0);
  });

  it('accountRequest - limit max', function() {
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: 1e9}).message.limit, 1e9);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: 1e9+1}).message.limit, 1e9);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: 1e10}).message.limit, 1e9);
    assert.strictEqual(Remote.accountRequest('account_lines', {account: ADDRESS, limit: 1e24}).message.limit, 1e9);
  });

  it('accountRequest - a valid ledger is required when using a marker', function() {
    assert.throws(function() {
      Remote.accountRequest('account_lines', {account: ADDRESS, marker: PAGING_MARKER})
    },'A ledger_index or ledger_hash must be provided when using a marker');

    assert.throws(function() {
      Remote.accountRequest('account_lines', {account: ADDRESS, marker: PAGING_MARKER, ledger:'validated'})
    },'A ledger_index or ledger_hash must be provided when using a marker');

    assert.throws(function() {
      Remote.accountRequest('account_lines', {account: ADDRESS, marker: PAGING_MARKER, ledger:NaN})
    },'A ledger_index or ledger_hash must be provided when using a marker');

    assert.throws(function() {
      Remote.accountRequest('account_lines', {account: ADDRESS, marker: PAGING_MARKER, ledger:LEDGER_HASH.substr(0,63)})
    },'A ledger_index or ledger_hash must be provided when using a marker');

    assert.throws(function() {
      Remote.accountRequest('account_lines', {account: ADDRESS, marker: PAGING_MARKER, ledger:LEDGER_HASH+'F'})
    },'A ledger_index or ledger_hash must be provided when using a marker');
  });

  it('requestAccountLines, account and callback', function() {
    function callback() {}
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestAccountLines(
      {account: ADDRESS},
      callback
    );

    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS
    });

    assert(request.requested);
  });

  it('requestAccountLines, ledger, peer', function() {
    function callback() {}
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestAccountLines(
      {
        account: ADDRESS,
        ledger: LEDGER_HASH,
        peer: PEER_ADDRESS
      },
      callback
    );

    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS,
      ledger_hash: LEDGER_HASH,
      peer: PEER_ADDRESS
    });

    assert(request.requested);
  });

  it('requestAccountLines, ledger, peer, limit and marker', function() {
    function callback() {}
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestAccountLines(
      {
        account: ADDRESS,
        ledger: LEDGER_INDEX,
        peer: PEER_ADDRESS,
        limit: 200,
        marker: PAGING_MARKER
      },
      callback
    );

    assert.deepEqual(request.message, {
      command: 'account_lines',
      id: undefined,
      account: ADDRESS,
      ledger_index: LEDGER_INDEX,
      peer: PEER_ADDRESS,
      limit: 200,
      marker: PAGING_MARKER
    });

    assert(request.requested);
  });

  it('requestAccountOffers, ledger, peer, limit and marker', function() {
    function callback() {}
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestAccountOffers(
      {
        account: ADDRESS,
        ledger: LEDGER_HASH,
        peer: PEER_ADDRESS,
        limit: 32,
        marker: PAGING_MARKER
      },
      callback
    );

    assert.deepEqual(request.message, {
      command: 'account_offers',
      id: undefined,
      account: ADDRESS,
      ledger_hash: LEDGER_HASH,
      peer: PEER_ADDRESS,
      limit: 32,
      marker: PAGING_MARKER
    });

    assert(request.requested);
  });

  it('requestBookOffers, ledger', function() {
    function callback() {}
    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestBookOffers(
      {
        gets: {
          currency: 'USD',
          issuer: ADDRESS
        },
        pays: {
          currency: 'XRP'
        },
        ledger: LEDGER_HASH
      },
      callback
    );

    assert.deepEqual(request.message, {
      command: 'book_offers',
      id: undefined,
      taker_gets: {
        currency: Currency.from_human('USD').to_hex(),
        issuer: ADDRESS
      },
      taker_pays: {
        currency: '0000000000000000000000000000000000000000'
      },
      taker: UInt160.ACCOUNT_ONE,
      ledger_hash: LEDGER_HASH
    });

    assert(request.requested);
  });

  it('requestBookOffers, ledger and limit', function() {
    function callback() {}

    var remote = new Remote({
      servers: [ { host: 's-west.ripple.com', port: 443, secure: true } ]
    });
    var request = remote.requestBookOffers(
      {
        gets: {
          currency: 'USD',
          issuer: ADDRESS
        },
        pays: {
          currency: 'XRP'
        },
        ledger: LEDGER_HASH,
        limit: 10
      },
      callback
    );

    assert.deepEqual(request.message, {
      command: 'book_offers',
      id: undefined,
      taker_gets: {
        currency: Currency.from_human('USD').to_hex(),
        issuer: ADDRESS
      },
      taker_pays: {
        currency: Currency.from_human('XRP').to_hex()
      },
      taker: UInt160.ACCOUNT_ONE,
      ledger_hash: LEDGER_HASH,
      limit: 10
    });

    assert(request.requested);
  });

  it('create remote and get pending transactions', function() {
    before(function() {
      tx =  [{
        tx_json: {
          Account : "r4qLSAzv4LZ9TLsR7diphGwKnSEAMQTSjS",
          Amount : {
            currency : "LTC",
            issuer : "r4qLSAzv4LZ9TLsR7diphGwKnSEAMQTSjS",
            value : "9.985"
          },
          Destination : "r4qLSAzv4LZ9TLsR7diphGwKnSEAMQTSjS",
          Fee : "15",
          Flags : 0,
          Paths : [
            [
              {
            account : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            currency : "USD",
            issuer : "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            type : 49,
            type_hex : "0000000000000031"
          },
          {
            currency : "LTC",
            issuer : "rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX",
            type : 48,
            type_hex : "0000000000000030"
          },
          {
            account : "rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX",
            currency : "LTC",
            issuer : "rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX",
            type : 49,
            type_hex : "0000000000000031"
          }
          ]
          ],
          SendMax : {
            currency : "USD",
            issuer : "r4qLSAzv4LZ9TLsR7diphGwKnSEAMQTSjS",
            value : "30.30993068"
          },
          Sequence : 415,
          SigningPubKey : "02854B06CE8F3E65323F89260E9E19B33DA3E01B30EA4CA172612DE77973FAC58A",
          TransactionType : "Payment",
          TxnSignature : "304602210096C2F385530587DE573936CA51CB86B801A28F777C944E268212BE7341440B7F022100EBF0508A9145A56CDA7FAF314DF3BBE51C6EE450BA7E74D88516891A3608644E"
        },
        clientID: '48631',
        state:    'pending',
        submitIndex: 1,
        submittedIDs: ["304602210096C2F385530587DE573936CA51CB86B801A28F777C944E268212BE7341440B7F022100EBF0508A9145A56CDA7FAF314DF3BBE51C6EE450BA7E74D88516891A3608644E"],
        secret: 'mysecret'
      }];
      database = {
        getPendingTransactions: function(callback) {
          callback(null, tx);
        }
      }
    });

    it('should set transaction members correct ', function(done) {
      remote = new Remote(options);
      remote.storage = database;
      remote.transaction = function() {
        return {
          clientID: function(id) {
            if (typeof id === 'string') {
              this._clientID = id;
            }
            return this;
          },
          submit: function() {
            assert.deepEqual(this._clientID, tx[0].clientID);
            assert.deepEqual(this.submittedIDs,[tx[0].tx_json.TxnSignature]);
            assert.equal(this.submitIndex, tx[0].submitIndex);
            assert.equal(this.secret, tx[0].secret);
            done();

          },
          parseJson: function(json) {}
        }
      };
      remote.getPendingTransactions();

    })
  })
});

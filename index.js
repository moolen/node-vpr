const tun = require('./tunnel');
const crypto = require('./crypto');
const ip = require('./ip');
const dgram = require('dgram');
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'vpr', level: process.env.LOG_LEVEL || 'trace'});

const REMOTE_ADDR = process.env.REMOTE_ADDR;
const REMOTE_NET = process.env.REMOTE_NET;
const REMOTE_PORT = process.env.REMOTE_PORT || '2821';

const LISTEN_PORT = process.env.LISTEN_PORT || '2821';
const LOCAL_ADDR = process.env.LOCAL_ADDR;
const DEV_NAME = process.env.TUN_NAME || 'tippy0';
const DEV_MTU = process.env.MTU || 1200;
const KEY = process.env.KEY || '1234';

const HELLO_INTERVAL = 5000;
const server = dgram.createSocket('udp4');
let fd;

// todo: naming
const encrypt = crypto.encrypt(KEY)
const decrypt = crypto.decrypt(KEY)

async function initTunDevice() {
  [err, fd] = await tun.open(DEV_NAME);
  if (err) {
    log.fatal('error opening tun');
    return
  }
  await ip.mtu(DEV_MTU, DEV_NAME);
  await ip.addr(LOCAL_ADDR, DEV_NAME);
  await ip.up(DEV_NAME);
  await ip.route(REMOTE_NET, DEV_NAME)
  // tun read loop
  tun.read(fd, (err, pkg) => {
    if (err) {
      log.fatal(`error reading from tun: ${err}`);
      return
    }
    console.log(pkg)
    const enc = encrypt(pkg)
    server.send(enc, REMOTE_PORT, REMOTE_ADDR, err => {
      if (err) {
        log.error(err)
      }
    });
  });
  return fd
}

async function initUdpServer() {
  server.on('error', (err) => {
    log.error(`server error:\n${err.stack}`);
    server.close();
  });

  server.on('message', (msg, info) => {
    log.info(`UDP RECV from ${info.address}:${info.port}`);
    let dec = decrypt(msg)
    if (dec == "HELLO") {
      log.debug(`HELLO from ${info.address}:${info.port}`)
      return
    }
    console.log(dec)
    tun.write(fd, dec)
  });

  server.on('listening', () => {
    const address = server.address();
    log.info(`listening at: ${address.address}:${address.port}`);

    setInterval(() => {
      log.info(`sending heartbeat to ${REMOTE_ADDR}:${REMOTE_PORT}`);
      server.send(encrypt(Buffer.from('HELLO', 'utf8')), REMOTE_PORT, REMOTE_ADDR, err => {
        if (err) {
          log.error(err)
        }
      })
    }, HELLO_INTERVAL)
  });
}

initTunDevice();
initUdpServer();

// handle ctrl-c
process.on('SIGINT', function() {
  process.exit();
});

server.bind(LISTEN_PORT);

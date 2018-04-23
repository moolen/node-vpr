const tun = require('./tunnel');
const crypto = require('./crypto');
const ip = require('./ip');
const dgram = require('dgram');

const REMOTE_ADDR = process.env.REMOTE_ADDR;
const REMOTE_PORT = process.env.REMOTE_PORT || '2821';
const REMOTE_ROUTE = process.env.REMOTE_ROUTE;

const LISTEN_PORT = process.env.LISTEN_PORT || '2821';
const LOCAL_ADDR = process.env.LOCAL_ADDR;
const DEV_NAME = process.env.TUN_NAME || 'tippy0';
const KEY = process.env.KEY || '1234';

const server = dgram.createSocket('udp4');
let fd;

async function initTunDevice() {
  [err, fd] = await tun.open(DEV_NAME);
  if (err) {
    console.log('error opening tun');
    return
  }
  await ip.mtu(1500, DEV_NAME);
  await ip.addr(LOCAL_ADDR, DEV_NAME);
  await ip.route(REMOTE_ROUTE, DEV_NAME)
  await ip.up(DEV_NAME);
  
  // tun read loop
  tun.read(fd, (err, pkg) => {
    if (err) {
      console.log(`error reading from tun: ${err}`);
      return
    }
    console.log(pkg.slice(0,12))
    console.log('read from tun, fwd to udp')
    server.send(crypto.encrypt(pkg, KEY), REMOTE_PORT, REMOTE_ADDR, err => {
      if (err) {
        console.log(err)
      }
    });
  });
  return fd
}

async function initUdpServer() {
  server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });
  
  server.on('message', (msg, info) => {
    console.log(`got msg from ${info.address}:${info.port}`);
    let dec = crypto.decrypt(msg, KEY)
    console.log(dec.slice(0,12))
    
    tun.write(fd, dec)
  });
  
  server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });
}

initTunDevice();
initUdpServer();

// handle ctrl-c
process.on('SIGINT', function() {
  process.exit();
});

server.bind(LISTEN_PORT);

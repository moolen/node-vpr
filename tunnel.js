const fs = require('fs');
const c = require('constants');
const libsys = require('libsys');
const promisify = require('./promisify')

const fsopen = promisify(fs.open);
const fsread = promisify(fs.read);
const fswrite = promisify(fs.write);

// The ioctl syscall manipulates the underlying
// device parameters of special files
const SYS_IOCTL = 16;

// RTFM: https://www.kernel.org/doc/Documentation/networking/tuntap.txt
const TUNSETIFF = 0x400454ca;

// see https://github.com/torvalds/linux/blob/master/include/uapi/linux/if.h#L230
// ifname: 16b
// flag: 4b
// pad: 12b
function IfReq (name) {
  ifreq = Buffer.alloc(32);
  ifreq.write(name.slice(0,9), 0);
  ifreq.writeUInt16LE(0x0001|0x1000, 16)
  return ifreq;
}

async function open (name) {
  let [err, fd] = await fsopen('/dev/net/tun', "r+")
  if (err) {
    return [`error open tun: ${err}`]
  }
  ifreq = IfReq(name);
  let res = libsys.syscall(SYS_IOCTL, fd, TUNSETIFF, ifreq)
  if (res != 0) {
    return [new Error(`error creating tun: ${res}`)];
  }
  return [null, fd]
}

async function read(fd, callback) {
  const stream = fs.createReadStream(null, { fd: fd })
    stream.on('data', data => {
    callback(null, data)
  })
}

async function write(fd, buf) {
  let [err, len] = await fswrite(fd, buf)
  if (err) {
    console.log(`could not write to tun: ${err}`);
    return
  }
}

module.exports = { open, read, write }

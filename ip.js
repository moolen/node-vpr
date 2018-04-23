const cp = require('child_process');
const promisify = require('./promisify')

const exec = promisify(cp.exec)
module.exports = {
    mtu: (mtu, dev) => { exec(`ip l set dev ${dev} mtu ${mtu}`) },
    addr: (addr, dev) => { exec(`ip addr add ${addr} dev ${dev}`) },
    route: (route, dev) => { exec(`ip r add ${route} dev ${dev}`) },
    up: dev => { exec(`ip l set ${dev} up`) },
}
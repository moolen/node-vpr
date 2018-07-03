#!/bin/bash

set -e

mkdir -p /dev/net
if [ ! -c /dev/net/tun ]; then
    # http://lxr.linux.no/linux+v2.6.31/Documentation/devices.txt
    mknod /dev/net/tun c 10 200
fi

NODE_ENV=production node index.js

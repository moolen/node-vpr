#!/bin/bash

set -e

mkdir -p /dev/net
if [ ! -c /dev/net/tun ]; then
    mknod /dev/net/tun c 10 200
fi

NODE_ENV=production node index.js

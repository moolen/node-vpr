#!/bin/sh

if [ "$DEBUG" == "1" ]; then
  set -x
fi

set -e

apk update; apk add iperf

if [ -z "$SITE_EDGE" ]; then
  echo "no \$SITE_EDGE skipping ping"
  sleep 3600
fi

ip r d default
ip r a default via "$SITE_EDGE"

sleep 3600

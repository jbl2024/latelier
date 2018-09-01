#!/bin/bash
ip=`ifconfig en0 | grep inet | grep -v inet6 | awk '{print $2}'`
export HMR_URL=$ip
export HMR_PORT=3003
echo "Starting app on ios device..."
echo "HMR_URL=$HMR_URL | HMR_PORT=$HMR_PORT"
meteor run ios-device --settings settings-development.json
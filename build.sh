#!/bin/bash
IP=`ifconfig en0 | grep inet | grep -v inet6 | awk '{print $2}'`
HOST=$IP
PORT=3000
command="meteor build ../latelier-build --server=$HOST:$PORT"
echo "Building app..."
echo "$command"
$command

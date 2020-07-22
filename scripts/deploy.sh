#!/bin/bash

CHAINCODE_VER=$1
# now run the end to end script
  docker exec cli scripts/deployCC.sh $CHAINCODE_VER
  if [ $? -ne 0 ]; then
    echo "ERROR !!!! Test failed"
    exit 1
  fi
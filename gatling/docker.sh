#!/bin/bash

docker run -it --rm \
  -v "$(pwd)/user-files/:/opt/gatling/user-files" \
  -v "$(pwd)/results/:/opt/gatling/results" \
  -e JAVA_OPTS="$JAVA_OPTS" \
  --network host \
  kuzzleio/gatling-kuzzle


retVal=$?
if [ $retVal -eq 0 ]; then
  echo "Reports available on web server running on :8000"
  ruby -run -e httpd ./results -p 8000
fi

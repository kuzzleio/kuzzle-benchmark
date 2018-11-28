HOST=$1
JWT=$2

echo "Run this command to get the JWT: "
echo "curl -X POST $HOST:7512/_login/local?pretty -H \"Content-Type:application/json\" --data '{\"username\": \"aschen\", \"password\": \"aschen\"}' | grep jwt"
echo "\n"

echo "Run this command to have a document ID: "
echo "curl -X POST $HOST:7512/nyc-open-data/yellow-taxi/_create?pretty -H \"Content-Type:application/json\" --data '{ \"driver\": {\"name\": \"aschen\", \"age\": 25}}' | grep _id"
echo "\n"

if [ -z "$HOST" ]; then
  echo "Usage: ./commands.sh <hostname>"
  exit 1
fi

echo "Truncate collection"
echo "curl -X DELETE $HOST:7512/nyc-open-data/yellow-taxi/_truncate"
echo "\n"
echo "Run Websocket write document benchmark"
echo "JAVA_OPTS=\"-Dhost=$HOST -Drequests=2000 -Dusers=1 -Dduration=120\" bash docker.sh"
echo "\n"
echo "Run HTTP write document benchmark"
echo "JAVA_OPTS=\"-Dhost=$HOST -Drequests=2000 -Dusers=1 -Dduration=120 -Djwt=$JWT\" bash docker.sh"

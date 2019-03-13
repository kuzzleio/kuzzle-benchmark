package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class SkyBettingSimulation extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requestsPerSecond = System.getProperty("requestsPerSecond", "50").toInt

  val document = """
      {
        "someAttribute": "someValue" 
      }
  """
  val httpProtocol = http
    .baseUrl(s"http://${host}:7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")
    .wsBaseUrl(s"ws://${host}:7512")

  val feeder = Iterator.continually(Map("id" -> "10"))

  val scn = scenario("WebSocket update document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .feed(feeder)
    .exec(_.set("timestamp", System.currentTimeMillis))
    .exec(ws("document:update")
      .sendText(
        """
        {
          "index": "nyc-open-data",
          "collection": "yellow-taxi",
          "controller": "document",
          "action": "update",
          "volatile": { "timestamp": ${timestamp} },
          "_id" : "${id}",
          "body": """ + document + """
        }
        """
      )
      .await(1 seconds)(
        ws.checkTextMessage("document updated").check(regex(".*200.*"))
      )
    )
    .exec(ws("Close connection").close)

  after {
    Process(s"node ./user-files/utils/test-end.js ${host}").!
    println("FERME TA GUEULE TOI");
  }

  setUp(
    scn
      .inject(
        rampUsersPerSec(1) to requestsPerSecond during (5 seconds),
        constantUsersPerSec(requestsPerSecond) during (15 seconds)
      )
      .protocols(httpProtocol)
  )
}

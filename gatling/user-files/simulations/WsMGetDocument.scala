package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class WsMGetDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt

  println("Creating files for test. This may take a minute.")
  Process(s"node ./user-files/utils/request-m-ids ${host}").!
  val input_file = "./ids.txt"
  val ids = scala.io.Source.fromFile(input_file).mkString

  val httpProtocol = http
      .baseUrl(s"http://${host}:7512")
      .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
      .acceptEncodingHeader("gzip, deflate")
      .userAgentHeader("Gatling2")
      .wsBaseUrl(s"ws://${host}:7512")
  val scn = scenario("WebSocket mGet document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "test", "password": "test" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).repeat(requests, "i") {
      exec(ws("document:mGet")
        .sendText(
          """
          {
            "index": "nyc-open-data",
            "collection": "yellow-taxi",
            "controller": "document",
            "action": "mGet",
            "jwt": "${token}",
            "body": {
            "ids": """ + ids + """
            },
            "includeTrash": false
          }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("document getted").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
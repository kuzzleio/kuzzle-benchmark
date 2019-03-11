package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class SkyBettingSimulation extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "3000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  val requestsPerSecond = System.getProperty("requestsPerSecond", "10").toInt
  val documentCount = System.getProperty("documentCount", "25").toInt

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

  val scn = scenario("WebSocket update document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "test", "password": "test" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).repeat(requests, "i") {
      pace(1 / requestsPerSecond seconds)
      .exec(_.set("timestamp", System.currentTimeMillis))
      .exec(session => {
        session.set("myId", session("i").as[Int] % documentCount)
      })
      .exec(ws("document:update")
            .sendText(
              """
              {
                "index": "nyc-open-data",
                "collection": "yellow-taxi",
                "controller": "document",
                "action": "update",
                "jwt": "${token}",
                "volatile": { "timestamp": ${timestamp} },
                "_id" : "${myId}",
                "body": """ + document + """
              }
              """
            )
            //.await(1 seconds)(
            //  ws.checkTextMessage("document updated").check(regex(".*200.*"))
            //)
      )
    }
    .pause(30 seconds)
    .exec(
      ws("publish:end")
        .sendText(
          """
          {
              "index": "nyc-open-data",
              "collection": "yellow-taxi",
              "controller": "realtime",
              "action": "publish",
              "jwt": "${token}",
              "body": { "message": "end" }
            }
          """
        )
    )
    .exec(ws("Close connection").close)

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}

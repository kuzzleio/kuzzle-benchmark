package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class WsMCreateDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")

  val doc = """
    {
      "body":
        {
          "driver": {
            "name": "Eltooooon",
            "age": 42,
            "license": "B"
          },

          "car": {
            "position": {
              "lat": 42.83734827,
              "lng": 8.298382039
            },
            "type": "berline"
          }
        }
    }
    """ 
  var docs = ""
  var it = 1
  docs += """{"documents": [  """
  for (i <- 1 to 199) {
    docs += doc + ","
  }
  docs += doc
  docs += """]}"""

  val httpProtocol = http
      .baseUrl(s"http://${host}:7512")
      .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
      .acceptEncodingHeader("gzip, deflate")
      .userAgentHeader("Gatling2")
      .wsBaseUrl(s"ws://${host}:7512")
  val scn = scenario("WebSocket mCreate document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "test", "password": "test" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*")).
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).exec {
          session =>
          println(session("token").as[String])
          session
    }.repeat(requests, "i") {
      exec(ws("document:mcreate")
        .sendText(
          """
          {
            "index": "nyc-open-data",
            "collection": "yellow-taxi",
            "controller": "document",
            "action": "mCreate",
            "body": """ + docs.mkString +  """,
            "jwt": "${token}"
          }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("documents created").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
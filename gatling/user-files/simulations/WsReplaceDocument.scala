package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._


class WsReplaceDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt

  Process(s"node ./user-files/utils/request-one-id ${host}").!
  val input_file = "./id.txt"
  val id = scala.io.Source.fromFile(input_file).mkString

  val document = """
    {
      "driver": {
        "name": "Elton John Doe",
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
  """
  val httpProtocol = http
    .baseUrl(s"http://${host}:7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")
    .wsBaseUrl(s"ws://${host}:7512")

  val scn = scenario("WebSocket replace document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "test", "password": "test" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).repeat(requests, "i") {
      exec(ws("document:replace")
        .sendText(
          """
          {
            "index": "nyc-open-data",
            "collection": "yellow-taxi",
            "controller": "document",
            "action": "replace",
            "jwt" : "${token}",
            "_id" : """ + '"' + id + '"' +  """,
            "body": """ + document + """
          }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("document replaced").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}

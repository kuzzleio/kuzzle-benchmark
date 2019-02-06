package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._


class WsUpdateDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt

  val result = Process("node ./user-files/utils/requestOneId")
  val exitCode = result.!
  val input_file = "./id.txt"
  val id = scala.io.Source.fromFile(input_file).mkString

  val document = """
      {
        "user": "jc" 
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
    ).exec {
          session =>
          println(session("token").as[String])
          session
    }.repeat(requests, "i") {
      exec(ws("document:update")
        .sendText(
          """
          {
            "index": "nyc-open-data",
            "collection": "yellow-taxi",
            "controller": "document",
            "action": "update",
            "jwt": "${token}",
            "_id" : """ + '"' + id + '"' +  """,
            "body": """ + document + """
          }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("document updated").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}

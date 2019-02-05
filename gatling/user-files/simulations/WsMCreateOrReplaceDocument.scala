package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

import java.io._
import java.net._
import scala.util.Try
import scala.util.parsing.json._
import scala.util.{Failure, Success}
import scala.util.parsing.json.JSON


class WsMCreateOrReplaceDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")

  val input_file = "./user-files/utils/documents.json"
  val docs = scala.io.Source.fromFile(input_file).mkString

  
  val httpProtocol = http
      .baseUrl("http://" + host + ":7512")
      .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
      .acceptEncodingHeader("gzip, deflate")
      .userAgentHeader("Gatling2")
      .wsBaseUrl("ws://" + host + ":7512")
  val scn = scenario("WebSocket mCreateOrReplace document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "yo", "password": "wwkxgrd" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).exec {
          session =>
          println(session("token").as[String])
          session
    }.repeat(requests, "i") {
      exec(ws("document:mcreate or replace")
        .sendText(
          """
          {
            "index": "nyc-open-data",
            "collection": "yellow-taxi",
            "controller": "document",
            "action": "mCreateOrReplace",
            "jwt": "${token}",
            "body": """ + docs +  """
          }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("documents created/replaced").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class HttpMGetDocument extends Simulation {
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

  val scn = scenario("Http document:mGet")
    .exec(http("login")
    .post(s"http://${host}:7512/_login/local")
    .body(StringBody("""{ "username": "test", "password": "test" }""")).asJson
    .check(jsonPath("$.result.jwt").find.saveAs("jwt"))
    ).repeat(requests, "i") {
      exec(http("document:mget")
        .post(s"http://${host}:7512/nyc-open-data/yellow-taxi/_mGet")
        .header("Bearer", "${jwt}")
        .body(StringBody(s""" { "ids": ${ids} }""")).asJson      
        .check(status.is(200))
      )
    }
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
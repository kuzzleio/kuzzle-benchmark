package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class HttpMCreateOrReplaceDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")

  val input_file = "./user-files/utils/documents.json"
  val documents = scala.io.Source.fromFile(input_file).mkString
  
  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http mcreate or replace document")
    .repeat(requests, "i") {
      exec(http("document:mCreateOrReplace")
        .put("http://" + host + ":7512/nyc-open-data/yellow-taxi/_mCreateOrReplace")
        .header("Bearer", jwt)
        .body(StringBody(documents)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
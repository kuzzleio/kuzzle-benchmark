package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class HttpUpdateDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val users = System.getProperty("users", "1").toInt
  val requests = System.getProperty("requests", "2000").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")
  
  val document = """
      {
        "user": "jc" 
      }
  """

  val result = Process("node ./user-files/utils/requestOneId")
  val exitCode = result.!
  val input_file = "./id.txt"
  var id = scala.io.Source.fromFile(input_file).mkString
  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http update document")
    .repeat(requests, "i") {
    exec(http("document:update")
        .put("http://" + host + ":7512/nyc-open-data/yellow-taxi/"+ id +"/_update")
        .header("Bearer", jwt)
        .body(StringBody(document)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}



package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import sys.process._

class HttpReplaceDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")
  

  val document = """
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
    """

  val result = Process("node ./user-files/utils/requestOneId")
  val exitCode = result.!
  val input_file = "./id.txt"
  val id = scala.io.Source.fromFile(input_file).mkString

  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http replace document")
    .repeat(requests, "i") {
    exec(http("document:replace")
        .put("http://" + host + ":7512/nyc-open-data/yellow-taxi/"+ id +"/_replace")
        .header("Bearer", jwt)
        .body(StringBody(document)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}



package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class HttpBulkImport extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")

  val bulkData = """ 
    {
      "bulkData": 
      [{
        "index": {
          "_index": "nyc-open-data",
          "_type": "yellow-taxi"
        }
      },
      {
        "name": "FCA-Ardepharm",
        "radius": 25,
        "location": {
          "lat": 45.045626,
          "lon": 4.846281
        }
      }]
    }
      """

  val httpProtocol = http
    .baseUrl(s"http://${host}:7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http bulk import")
    .repeat(requests, "i") {
      exec(http("bulk:import")
        .post("http://" + host + ":7512/nyc-open-data/yellow-taxi/_bulk")
        .header("Bearer", jwt)
        .body(StringBody(bulkData)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
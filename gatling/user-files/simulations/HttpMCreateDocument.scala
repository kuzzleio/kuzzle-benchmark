package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import scala.collection.mutable.ArrayBuffer

class HttpMCreateDocument extends Simulation {
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
  val docs = new ArrayBuffer[String]()
  var it = 1
  docs.append("""{"documents": [  """)
  for (i <- 1 to 199) {
    docs.append(doc)
    docs.append(",")
  }
  docs.append(doc)
  docs.append("""]}""")
  
  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http mcreate document")
    .repeat(requests, "i") {
      exec(http("document:mCreate")
        .post("http://" + host + ":7512/nyc-open-data/yellow-taxi/_mCreate")
        .header("Bearer", jwt)
        .body(StringBody(docs.mkString)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
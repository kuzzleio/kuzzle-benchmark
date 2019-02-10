package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class WsBulkImportDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt

  var bulkData = """ 
    {
      "bulkData": 
      [
    """
  val doc = """
    {
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
    }
    """
  for (i <- 0 to 2000)
    bulkData += doc + ","
  bulkData += doc
  bulkData += """]}"""
  val httpProtocol = http
    .baseUrl(s"http://${host}:7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")
    .wsBaseUrl(s"ws://${host}:7512")

  val scn = scenario("WebSocket bulk import")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "test", "password": "test" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
        check(jsonPath("$.result.jwt").find.saveAs("token"))
      )
    ).repeat(requests, "i") {
      exec(ws("bulk:import")
        .sendText(
          """
            {
              "index": "nyc-open-data",
              "collection": "yellow-taxi",
              "controller": "bulk",
              "action": "import",
              "jwt": "${token}",      
              "body": """ + bulkData + """
            }
          """
        )
        .await(1 seconds)(
          ws.checkTextMessage("import ok").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}

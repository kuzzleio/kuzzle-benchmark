/*
 * Copyright 2011-2018 GatlingCorp (https://gatling.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class WsBulkImportDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt

   val bulkData = """ 
   {
	"bulkData": [{
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

  val query = """
    {
      "index": "nyc-open-data",
      "collection": "yellow-taxi",
      "controller": "bulk",
      "action": "import",
      
      "body": """ + bulkData + """
    }
  """

  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")
    .wsBaseUrl("ws://" + host + ":7512")

  val scn = scenario("WebSocket bulk import")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "yo", "password": "wwkxgrd" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
      )
    )
    .repeat(requests, "i") {
      exec(ws("document:bulk")
        .sendText(query)
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

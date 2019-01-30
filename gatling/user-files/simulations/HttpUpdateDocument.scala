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

  val result = Process("""python3 ./user-files/simulations/retrieve_one_id.py""")
  val exitCode = result.!
  val input_file = "./id.txt"
  var id = scala.io.Source.fromFile(input_file).mkString
  print(id)
  print("http://" + host + ":7512/nyc-open-data/yellow-taxi/"+id.dropRight(1)+"/_update")
  var test = ""
  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val scn = scenario("Http update document")
    .repeat(requests, "i") {
    exec(http("document:update")
        .put("http://" + host + ":7512/nyc-open-data/yellow-taxi/"+id.dropRight(1)+"/_update")
        .header("Bearer", jwt)
        .body(StringBody(document)).asJson
        .check(status.is(200))
      )
    }

  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}



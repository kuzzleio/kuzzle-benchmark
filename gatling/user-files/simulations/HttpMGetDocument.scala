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

class HttpMGetDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")
  val document = """
          {
        "driver": {
          "name": "John Doe",
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

  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")

  val input_file = "./user-files/simulations/documents.json"
  val documents = scala.io.Source.fromFile(input_file).mkString

  //val input_file = "./user-files/simulations/test.json"
  //val json_content = scala.io.Source.fromFile(input_file).mkString
  //println(json_content)

  //val jsonFileFeeder = jsonFile("./user-files/simulations/test.json")

  val scn = scenario("Http mget document")
    .repeat(requests, "i") {
      exec(http("document:create")
        .post("http://" + host + ":7512/nyc-open-data/yellow-taxi/_mCreate")
        .header("Bearer", jwt)
        .body(StringBody(documents)).asJson
        .check(jsonPath("$.result.hits[*]._id").findAll.saveAs("id"))
        .check(status.is(200))
      ).exec {
          session =>
            println(session("id").as[String])
            session
      }.exec(http("document:mget")
        .post("http://" + host + ":7512/nyc-open-data/yellow-taxi/_mGet")
        .header("Bearer", jwt)
        .body(StringBody(""" { "ids": ["$id"] }""")).asJson      
        .check(status.is(200))
      )
    }
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}

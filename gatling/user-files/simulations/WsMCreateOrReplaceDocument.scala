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

import java.io._
import java.net._
import scala.util.Try
import scala.util.parsing.json._
import scala.util.{Failure, Success}
import scala.util.parsing.json.JSON


class WsMCreateOrReplaceDocument extends Simulation {
  val host = System.getProperty("host", "localhost")
  val requests = System.getProperty("requests", "2000").toInt
  val users = System.getProperty("users", "1").toInt
  val duration = System.getProperty("duration", "1").toInt
  var jwt = System.getProperty("jwt", "some jwt")

  val input_file = "./user-files/simulations/documents.json"
  val docs = scala.io.Source.fromFile(input_file).mkString

  val query = """
      {
        "index": "nyc-open-data",
        "collection": "yellow-taxi",
        "controller": "document",
        "action": "mCreateOrReplace",
        "body": """ + docs +  """
      }
      """
  val httpProtocol = http
      .baseUrl("http://" + host + ":7512")
      .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
      .acceptEncodingHeader("gzip, deflate")
      .userAgentHeader("Gatling2")
      .wsBaseUrl("ws://" + host + ":7512")
  val scn = scenario("WebSocket mCreateOrReplace document")
    .exec(ws("Connect client").connect("/"))
    .pause(1)
    .exec(ws("Login")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "yo", "password": "wwkxgrd" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
      )
    )
    .repeat(requests, "i") {
      exec(ws("document:mcreate or replace")
        .sendText(query)
        .await(1 seconds)(
          ws.checkTextMessage("documents created/replaced").check(regex(".*200.*"))
        )
      )
    }
    .exec(ws("Close connection").close)
  setUp(scn.inject(
    rampUsers(users) during (duration seconds)
  ).protocols(httpProtocol))
}
require 'optparse'
require 'net/http'
require 'json'

class Babysitter
  attr_reader :host, :requests, :clients, :duration

  def initialize(options)
    @host = options[:host] || "localhost"
    @username = options[:username] || "aschen"
    @password = options[:password] || "aschen"
    @requests = options[:requests] || 2000
    @clients = options[:clients] || 60
    @duration = options[:duration] || 90

    @base_url = "http://#{@host}:7512"

    create_index_collection
    truncate_collection
    document_id
  end

  def jwt
    @jwt ||= begin
      response = post("/_login/local", username: @username, password: @password)
      JSON.parse(response.body).dig('result', 'jwt')
    end
  end

  def document_id
    document = {
      driver: {
        name: "John Doe",
        age: 42
      }
    }

    @document_id  ||= begin
      response = post("/nyc-open-data/yellow-taxi/_create", document)
      JSON.parse(response.body).dig('result', '_id')
    end
  end

  private

  def create_index_collection
    post("/nyc-open-data/_create", {}, silent: true)
    put("/nyc-open-data/yellow-taxi/", {}, silent: true)
  end

  def truncate_collection
    delete("/nyc-open-data/yellow-taxi/_truncate")
  end

  def check_status(response, options)
    if options[:silent].nil? && response.code != "200"
      throw response.message
    end

    response
  end

  def post(url, data, **options)
    uri = URI("#{@base_url}#{url}")
    response = Net::HTTP.new(uri.host, uri.port).post(uri.path, data.to_json, { 'Content-Type' => 'application/json' })
    check_status(response, options)
  end

  def put(url, data, **options)
    uri = URI("#{@base_url}#{url}")
    response = Net::HTTP.new(uri.host, uri.port).put(uri.path, data.to_json, { 'Content-Type' => 'application/json' })
    check_status(response, options)
  end

  def delete(url, **options)
    uri = URI("#{@base_url}#{url}")
    response = Net::HTTP.new(uri.host, uri.port).delete(uri.path)
    check_status(response, options)
  end
end

options = {}

OptionParser.new do |opts|
  opts.banner = "Usage: commands.rb -h [host] -u [username] -p [password]"

  opts.on("-h host", "--host", "localhost") do |host|
    options[:host] = host
  end

  opts.on("-u username", "--username") do |username|
    options[:username] = username
  end

  opts.on("-p password", "--password") do |password|
    options[:password] = password
  end

  opts.on("-r requests", "--requests") do |requests|
    options[:requests] = requests
  end

  opts.on("-c clients", "--clients") do |clients|
    options[:clients] = clients
  end

  opts.on("-d duration", "--duration") do |duration|
    options[:duration] = duration
  end

end.parse!

babysitter = Babysitter.new(options)

puts "Run this command to start Gatling\n"
puts "JAVA_OPTS=\"-Dhost=#{babysitter.host} \
                  -Drequests=#{babysitter.requests} \
                  -Dusers=#{babysitter.clients} \
                  -Dduration=#{babysitter.duration} \
                  -Djwt=#{babysitter.jwt} \
                  -DdocumentId=#{babysitter.document_id}\" \
      bash docker.sh".squeeze(" ")

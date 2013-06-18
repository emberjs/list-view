require 'bundler/setup'
require 'ember-dev'
require 'ember/source'

%W|demos examples lib dist|.each do |path|
  map "/#{path}" do
    run Rack::Directory.new(path)
  end
end

run EmberDev::Server.new

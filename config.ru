require 'bundler/setup'
require 'ember-dev'
require 'ember/source'

%W|demos lib|.each do |path|
  map "/#{path}" do
    run Rack::Directory.new(path)
  end
end

run EmberDev::Server.new

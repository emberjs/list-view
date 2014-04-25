require "bundler/setup"
require "ember-dev/tasks"

directory "tmp"

task :publish_build do
  root = File.dirname(__FILE__) + '/dist/'
  EmberDev::Publish.to_s3({
    access_key_id: ENV['S3_ACCESS_KEY_ID'],
    secret_access_key: ENV['S3_SECRET_ACCESS_KEY'],
    bucket_name: ENV['S3_BUCKET_NAME'],
    subdirectory: 'list-view',
    files: ['list-view.js'].map { |f| root + f }
  })
end

task clean: 'ember:clean'
task dist: 'ember:dist'
task :test, [:suite] => 'ember:test'
task default: [
  :dist,
  :test
]

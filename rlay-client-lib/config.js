const convict = require('convict');
const toml = require('toml');

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['testing'],
    default: 'testing',
    env: 'NODE_ENV'
  },
  services: {
    kafka: {
      host: {
        doc: 'The URL of the Kafka servers',
        default: '',
        format: 'url'
      },
      confluence_api_key: {
        doc: 'The Confluence API key for the Kafka servers',
        default: '',
        format: String 
      },
      confluence_api_secret: {
        doc: 'The Confluence API secret for the Kafka servers',
        default: '',
        format: String,
        sensitive: true
      },
      topic_name: {
        doc: 'The name of the Kafka topic',
        default: '',
        format: String
      }
    },
  },
});

// Load environment dependent configuration
// this needs to be like this for parcel bundler to work correctly
const tomlEnv = require('fs').readFileSync('config/' + config.get('env') + '.toml');
config.load(toml.parse(tomlEnv));

// Perform validation
config.validate({allowed: 'strict'});

module.exports = config


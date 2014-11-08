#! /usr/local/bin/node

var program = require('../node_modules/commander');
var prompt = require('../node_modules/prompt');
var fs = require('fs');
var yaml = require('../node_modules/js-yaml');
var lifterConfig = require('./lifterConfig.js');
var lifterPrompts = require('./lifterPrompts.js');

// CLI Details
program
  .version('0.0.1')
  .usage('lifter - making Docker containers easier since 2014')
  .option('config', 'Builds YAML file based on user\'s desired configuration')
  .option('init', 'Initializes container.');

program
  .command('config')
  .description('Configure your container.')
  .action(function() {
    lifterConfig.picker(lifterPrompts.promptList.username);
  });

program
  .command('init')
  .description('Build your container.')
  .action(function() {
    console.log('Time to build your container.');
  });

program
  .command('*')
  .description('Handle odd responses')
  .action(function(env){
    console.log('You must be confused.');
  });

program.parse(process.argv);

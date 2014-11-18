/**
* @module helpers
*/
var fs = require('fs');
var yaml = require('../node_modules/js-yaml');


/**
* Function that add spaces to a string - using it to format the Dockerfile
* @function
* @memberof module:helpers
* @param {string} str String that needs spaces appended to it
* @param {number} num Number of spaces to add
*/
exports.addSpace = function(str,num) {
  // console.log(num);
  for(var i=0;i<num;i++) {
    str += ' ';
  }
  return str;
};

/**
* Function that returns true/false based on existence of filename (and filepath)
* @function
* @memberof module:helpers
* @param {string} filename Path and filename that is checked by function
*/
exports.doesFileExist = function(filename) {
  return fs.open(filename,'r',function(err,fd) {
    if(err) {
      console.log('false');
      return false;
    } else {
      console.log('true');
      return true;
    }
  });
};

/**
* Function that reads the lifter.yml file
* @function
* @memberof module:helpers
* 
*/

exports.readYAML = function() {
  var content = fs.readFileSync('lifter.yml', {encoding: 'utf-8'});
  var ymlContents = yaml.safeLoad(content);
  return ymlContents;
}
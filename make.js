/* Flexigrid / make.js
 * Copyright (c) 2008 Paulo P. Marinas (https://github.com/paulopmx/Flexigrid-for-jQuery)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 
 * Depends on nodejs, bitfactory, stoptime, and uglify-js
 * npm install bitfactory stoptime uglify-js
 */
 
 var UglifyJS = require('uglify-js'),
     fs = require('fs'),
     stoptime = require('stoptime'),
     ugly, header;

require('bitfactory').make({ //routes
    "": function(err, results) {
        var timer = results[0]['timer'];
        
        if(err) {
            console.error(err);
        } else {
            console.log('built Flexigrid in ' + timer.elapsed() + 'ms');
        }
    },
}, { //dependencies
    "*": { //wildcard
        "timer": function(cb) {
            cb(null, stoptime());
        },
        "header": function(cb) {
            fs.readFile('./js/flexigrid.h', 'utf8', function(err, data) {
                if(err) {
                    cb(err);
                } else {
                    header = data;
                    cb();
                }
            });
        },
        "uglify": function(cb) {
            ugly = UglifyJS.minify('./js/flexigrid.js');
            cb();
        },
        "write": ["header", "uglify", function(cb) {
            fs.writeFile('./js/flexigrid.pack.js', header + ugly.code, 'utf8', function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb();
                }
            });
        }]
    }
});
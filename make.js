/* Flexigrid / make.js
 * Copyright (c) 2008 Paulo P. Marinas (https://github.com/paulopmx/Flexigrid-for-jQuery)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 
 * Depends on nodejs, bitfactory, stoptime, uglify-js, and less
 * npm install bitfactory stoptime uglify-js less
 */
 
var UglifyJS = require('uglify-js'),
    less = require('less'),
    stoptime = require('stoptime'),
    fs = require('fs'),
    exec = require('child_process').exec,
    ugly, header, lesstree;

var final = function(_tag) {
    var tag = '';
    
    if((typeof _tag !== 'undefined') &&  (_tag !== '')) {
        tag = ' (' + _tag + ')';
    }
    
    return function(err, results) {
        var timer = results[0]['timer'];
        
        if(err) {
            console.error(err);
        } else {
            console.log('built Flexigrid' + tag +' in ' + timer.elapsed() + 'ms');
        }
    };
};

var router = function(routes) {
    var _obj = {};
    
    routes.forEach(function(v, i, a) {
        _obj[v] = final(v);
    });
    
    return _obj;
};

require('bitfactory').make(router([
    '',
    'lampp'
]), { //dependencies
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
        "less": function(cb) {
            fs.readFile('./css/flexigrid.less', 'utf8', function(err, data) {
                if(err) {
                    cb(err);
                } else {
                    (new less.Parser()).parse(data, function(err, tree) {
                        if(err) {
                            cb(err);
                        } else {
                            lesstree = tree;
                            cb();
                        }
                    });
                }
            });
        },
        "writecss": ["less", function(cb) {
            fs.writeFile('./css/flexigrid.pack.css', lesstree.toCSS({yuicompress: true}), 'utf8', function(err) {
                cb(err);
            });
        }],
        "writecss-min": ["less", function(cb) {
            fs.writeFile('./css/flexigrid.css', lesstree.toCSS(), 'utf8', function(err) {
                cb(err);
            });
        }],
        "writejs": ["header", "uglify", function(cb) {
            fs.writeFile('./js/flexigrid.pack.js', header + ugly.code, 'utf8', function(err) {
                cb(err);
            });
        }]
    },
    "lampp": {
        "rm": function(cb) {
            exec('rm -R /opt/lampp/htdocs/flexigrid/*', function(err, stdout, stderr) {
                if(err !== null) {
                    cb(err);
                } else {
                    cb();
                }
            });
        },
        "cp": ["rm", function(cb) {
            exec('cp -R * /opt/lampp/htdocs/flexigrid', function(err, stdout, stderr) {
                if(err !== null) {
                    cb(err);
                } else {
                    cb();
                }
            });
        }]
    }
});
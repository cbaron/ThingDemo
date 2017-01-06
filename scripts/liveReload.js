#!/usr/bin/env node

var fs = require('fs'),
    server

require('node-env-file')( `${__dirname}/../.env` )

server = require('livereload').createServer( {
    exts: [ 'gz' ],
    ignoreExts: [ 'js', 'css' ],
    originalPath: `https://${process.env.DOMAIN}.com`
} )

server.watch( `${__dirname}/../static` )

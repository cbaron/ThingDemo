#!/usr/bin/env node

require('node-env-file')( `${__dirname}/../.env` )

const MyObj = Object.create( require('../lib/MyObject'), { input: { value: process.argv[2] } } ),
      Bcrypt = require('bcrypt')

MyObj.P( Bcrypt.hash, [ MyObj.input, parseInt( process.env.SALT ) ] )
.then( console.log )
.catch( e => console.log( e.stack || e ) )

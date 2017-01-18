module.exports = Object.create( Object.assign( {}, require('./lib/MyObject'), {

    Fs: require('fs'),

    Path: require('path'),

    constructor() {
        this.isDev = ( process.env.ENV === 'development' )

        return this.handler.bind(this)
    },

    handler( request, response ) {
        const path = request.url.split('/').slice(1)

        request.setEncoding('utf8')

        ( path[0] === "static"
            ? this.static( request, response, path )
            : ( /application\/json/.test( request.headers.accept ) && this.resourceToFile[ path[0] ] )
                ? this.rest( request, response, path )
                : this.html( request, response )
        )
        .catch( e => {
            this.Error(e)
            response.writeHead( 500, { 'Content-Length': 0, 'Content-Type': 'text/plain' } )
            response.end()
        } )
    },

    html( request, response ) {
        response.writeHead( 200 )
        response.end( require('./templates/page')( {
            googleApiKey: process.env.GOOGLE_API_KEY,
            isDev: this.isDev,
            title: process.env.NAME
        } ) )
        
        return Promise.resolve()
    },

    resourceToFile: {
        sensorsByNetwork: 'sensorsByNetwork'
    },

    rest( request, response, path ) {
        const file = this.resourceToFile[path[0]]

        return this.P( this.Fs.stat, [ `${__dirname}/resources/${file}.js` ] )
        .then( () => 
            Object.create( require(`./resources/${file}`), {
                request: { value: request },
                response: { value: response },
                path: { value: path },
                tables: { value: this.Postgres.tables }
            } ).apply( request.method )
        )
    },

    static( request, response, path ) {
        var fileName = path.pop(),
            filePath = `${__dirname}/${path.join('/')}/${fileName}`,
            ext = this.Path.extname( filePath )

        return this.P( this.Fs.stat, [ filePath ] )
        .then( ( [ stat ] ) => new Promise( ( resolve, reject ) => {
            
            var stream = this.Fs.createReadStream( filePath )
            
            response.on( 'error', e => { stream.end(); reject(e) } )
            stream.on( 'error', reject )
            stream.on( 'end', () => {
                response.end();
                resolve()
            } )

            response.writeHead(
                200,
                {
                    'Cache-Control': `max-age=600`,
                    'Connection': 'keep-alive',
                    'Content-Encoding': ext === ".gz" ? 'gzip' : 'identity',
                    'Content-Length': stat.size,
                    'Content-Type':
                        /\.css/.test(fileName)
                            ? 'text/css'
                            : ext === '.svg'
                                ? 'image/svg+xml'
                                : 'text/plain'
                }
            )
            stream.pipe( response, { end: false } )
        } ) )
    }

} ), { } ).constructor()

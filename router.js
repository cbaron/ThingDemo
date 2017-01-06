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

        path[0] === "static"
            ? this.static( request, response, path )
            : this.html( request, response )
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
        .catch( e => {
            this.Error(e)
            response.writeHead( 200, { 'Content-Length': 0, 'Content-Type': 'text/plain' } )
            response.end()
        } )
    }

} ), { } ).constructor()

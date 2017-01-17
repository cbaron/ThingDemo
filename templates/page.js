module.exports = p => `
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="/static/css/vizuly.css">
        <link rel="stylesheet" type="text/css" href="/static/css/vizuly_weightedtree.css">
        <link rel="stylesheet" type="text/css" href="/static/css/pikaday.css">
        <link rel="stylesheet" type="text/css" href="/static/css/main.css.gz">

        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
       
        <script src="/static/js/d3.min.js"></script>
        <script src="/static/js/vizuly_core.min.js"></script>
        <script src="/static/js/vizuly_weightedtree.min.js"></script>
        <script async defer src="https://maps.googleapis.com/maps/api/js?key=${p.googleApiKey}&callback=initMap"></script>
        ${ ( p.isDev )
            ? '<script src="/static/js/debug.js.gz"></script>'
            : '<script src="/static/js/bundle.js.gz"></script>'
        }

        <title>${p.title}</title>
    </head>

    <body>
       <div id="content"></div>
    </body>

    ${p.isDev?`<script src="//${process.env.DOMAIN}:35729/livereload.js?snipver=1"/></script>`:''}

</html>
`

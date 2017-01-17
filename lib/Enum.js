module.exports = {

    "Geography": {
        create: () => {
            const getRandomFloat = (min, max) => Math.random() * (max - min) + min
            return [ getRandomFloat( -180, 180 ), getRandomFloat( -90, 90 ) ]
        },
        validate: ( lng, lat ) => Math.abs( lat ) <= 90 && Math.abs( lng ) <= 180
    }
}

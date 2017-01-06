module.exports = {

    Error: require('./MyError'),

    P: ( fun, args=[ ], thisArg ) =>
        new Promise( ( resolve, reject ) => Reflect.apply( fun, thisArg || this, args.concat( ( e, ...callback ) => e ? reject(e) : resolve(callback) ) ) ),
    
    constructor() { return this }
}

const uuid = require('uuid').u4
const session = require('express-session')

module.exports = async (req, res, next) => {
    await session({
        genid: (req) => {
          return uuid() // use UUIDs for session IDs
        },
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    })
    next( );
};
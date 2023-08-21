const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (req, res, next) => {
  const token = req.cookies.auth;
  const newToken = jwt.sign({...token, expires: new Date() }, config.auth_token.replace(/\\n/gm, '\n'), { algorithm: 'RS256', expiresIn: "60000" });
  res.cookie('auth', newToken);
  next( );
}

const checkAuth =  ( req, res ) => {
  try {
    const token = req.cookies.auth;
    const decodedToken = jwt.verify(token, config.auth_token, { algorithms: ['RS256'] });
    const userId = decodedToken.USERNAME;
    if (!userId ||  new Date() - decodedToken.expires > 60000 ) {
      return false;
    } else {
      res.locals.user = decodedToken;
      return true;
    }
  }
  catch {
    return false;
  }
}

module.exports = {
  checkAuth: (req, res) => checkAuth( req, res ),
  auth: (req, res, next) => {
  try {
    const status = checkAuth( req, res );
    if( status ) {
      generateToken( req, res, next );
    }
    else {
      throw 'User logged out!';
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }}
};
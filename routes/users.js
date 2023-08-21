var express = require('express');
var router = express.Router();
const controller = require("../controller/user.controller");
const auth = require("../middleware/auth");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Sign Up
router.post('/signUp', function(req, res, next) {
  controller.create(req, res, next);
});

router.post('/login', function(req, res, next) {
  controller.login(req, res, next);
});

router.post('/logout', function(req, res, next) {
  res.clearCookie("auth");
  res.redirect("/app/");
});

router.post('/approve/:username/:status', auth.auth, function( req, res, next ) {
  if( auth.checkAuth( req, res ) && res.locals.user.IS_ADMIN ) {
    controller.approve( req, res, next );
  }
  else {
    res.redirect("/app/");
  }
})

module.exports = router;
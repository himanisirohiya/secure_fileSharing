var express = require('express');
var router = express.Router();
const auth = require("../middleware/auth");
const userController = require('../controller/user.controller');
const fileController = require('../controller/file.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  if( auth.checkAuth( req, res ) ) {
    fileController.getWallPosts( function( posts ) {
      
      posts = posts ? posts : [ ];
      res.render('index', { is_admin: res.locals.user.IS_ADMIN, posts: posts, user: res.locals.user });
    } );
  }
  else {
    res.redirect('/app/login')
  }
});

router.get('/login', function(req, res, next) {
  if( auth.checkAuth( req, res ) ) {
    res.redirect('/app/')
  }
  else {
    res.render('login');
  }
});

router.get('/post', auth.auth, function(req, res, next) {
  if( auth.checkAuth( req, res ) ) {
    res.render('post');
  }
  else {
    res.redirect('/app/login')
  }
});

router.get('/group', auth.auth, function(req, res, next) {
  if( auth.checkAuth( req, res ) ) {
    res.render('group');
  }
  else {
    res.redirect('/app/login')
  }
});

router.get('/admin', auth.auth, async function(req, res, next) {
  if( auth.checkAuth( req, res ) && res.locals.user.IS_ADMIN ) {
    userController.getAll( function( users ) {
      users = users ? users : [ ]

      fileController.getPosts( function( posts ) {
        posts = posts ? posts : [ ];
        res.render('admin', { posts: posts, users: users, is_admin: res.locals.user.IS_ADMIN });
      });
    } );
  }
  else {
    res.redirect('/app/')
  }
});

module.exports = router;

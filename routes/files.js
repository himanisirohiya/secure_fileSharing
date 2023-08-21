const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");
const auth = require('../middleware/auth');

router.post("/upload", auth.auth, controller.post);
router.post("/post", auth.auth, controller.upload);
router.post("/download/:name", auth.auth, controller.download);
router.get("/file/:name", auth.auth, controller.get);

// router.get("/files", auth.auth, controller.getListFiles);
router.get("/files/:name", auth.auth, controller.download);

router.post('/approve/:postId/:status', auth.auth, function( req, res, next ) {
    if( auth.checkAuth( req, res ) && res.locals.user.IS_ADMIN ) {
      controller.approve( req, res, next );
    }
    else {
      res.redirect("/app/");
    }
});

router.post('/delete/:postId', auth.auth, controller.deletePost);

module.exports = router;

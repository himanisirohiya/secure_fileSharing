const uploadFile = require("../middleware/upload");
const fs = require("fs");

var mysql = require('mysql');
var config = require('../config/config');
var jwt = require('jsonwebtoken');


// Use connection pools to improve performance
var pool = mysql.createPool( config.mysql );

const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(500).send({
          message: "File size cannot be larger than 2MB!",
        });
    }
  
    res.status(500).send({
        message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};

const post = async (req, res) => {
  try {
    
    const directoryPath = __basedir + "/resources/uploads/";
    let fileName = '';
    await uploadFile(req, res);


    if (req.file != undefined) {
      let currentFileName = req.file.originalname.split(".")
      const newFileName = res.locals.user.USERNAME + "_" + (new Date()).getTime() + "." + currentFileName[ currentFileName.length - 1 ]
      fs.renameSync(directoryPath + req.file.originalname, directoryPath + newFileName);
      fileName = newFileName;
    }
    
    pool.getConnection(function(err, connection) {
      var param = req.body;
      const query = `INSERT INTO POST(created_by, content, file, status, created_at) VALUES('${res.locals.user.USERNAME}' , '${param.content}', '${fileName}', 'PENDING', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`
      console.log( query );
      connection.query(query, function(err, result) {
          res.redirect("/app/")
      });
    });

  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
        return res.status(500).send({
          message: "File size cannot be larger than 2MB!",
        });
    }
  
    res.status(500).send({
        message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};

const getWallPosts = async(next) => {
  pool.getConnection(function(err, connection) {
      const query = `SELECT * FROM POST WHERE STATUS = 'ACTIVE'`
      connection.query(query, function(err, result) {
          connection.release();
          next( result );
      });
  });
}

const getPosts = async(next) => {
  pool.getConnection(function(err, connection) {
      const query = `SELECT * FROM POST`
      connection.query(query, function(err, result) {
          connection.release();
          next( result );
      });
  });
}

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const get = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/uploads/";
  res.sendFile(directoryPath + fileName);
};

const approve = ( req, res, next ) => {
    pool.getConnection(function(err, connection) {
        const query = `UPDATE POST SET STATUS = '${req.params.status === 'approve' ? 'ACTIVE' : 'INACTIVE'}' WHERE POST_ID LIKE '${req.params.postId}'`
        connection.query(query, function(err, result) {
            connection.release();
            
            res.redirect('/app/admin')
        });
    });
  };

const deletePost = ( req, res, next ) => {
  pool.getConnection(function(err, connection) {
      const query = `UPDATE POST SET STATUS = 'INACTIVE' WHERE POST_ID LIKE '${req.params.postId}' AND CREATED_BY LIKE '${res.locals.user.USERNAME}'`
      connection.query(query, function(err, result) {
          connection.release();
          
          res.redirect('/app/')
      });
  });
};

module.exports = {
  upload,
  post,
  getPosts,
  getWallPosts,
  getListFiles,
  download,
  approve,
  get,
  deletePost
};
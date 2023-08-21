// Implementing Interaction with MySQL
var mysql = require('mysql');
var config = require('../config/config');
var jwt = require('jsonwebtoken');
// var $util = require('../util/util');
// var $sql = require('./userSqlMapping');

var mappings = {
    insert:'INSERT INTO user(username, password, name, is_admin, status, created_at) VALUES(? , SHA2(?, 224), ?, ?, ?, ?)',
    update:'UPDATE user SET name = ?, age = ? WHERE id = ?',
    delete: 'DELETE FROM user WHERE id=?',
    queryById: 'SELECT * FROM user WHERE id=?',
    queryAll: 'SELECT * FROM user'
};

// Use connection pools to improve performance
var pool = mysql.createPool( config.mysql );

// Simple Encapsulation of Back-to-Back JSON Method
var jsonWrite = function (res, ret) {
    if(typeof ret === 'undefined') {
        res.json({
            code: 400,
            msg: 'operation failed'
        });
    } else {
        // res.status(200);
        res.json(ret);
    }
};

module.exports = {
    create: function( req, res, next ) {
        pool.getConnection(function(err, connection) {
            var param = req.body;
                const query = `INSERT INTO PROFILE(username, password, name, is_admin, status, created_at) VALUES('${param.username}' , SHA2('${param.password}', 224), '${param.name}', false, 'NEW', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`
                connection.query(query, function(err, result) {
                    if(result) {
                        result = {
                            code: 200,
                            msg:'Increase success'
                        };    
                    }
                    jsonWrite(res, result);
                    connection.release();
                });
            });
    },
    login: function( req, res, next ) {
        pool.getConnection(function(err, connection) {
            var param = req.body;
                const query = `SELECT * FROM PROFILE WHERE STATUS != 'INACTIVE' AND USERNAME LIKE '${param.username}' AND PASSWORD LIKE SHA2('${param.password}', 224)`

                connection.query(query, function(err, result) {
                    if(result) {
                        const token = jwt.sign(JSON.parse(JSON.stringify(result[0])), config.auth_token.replace(/\\n/gm, '\n'), { algorithm: 'RS256' });
                        
                        res.cookie('auth', token);
                        result = {status: 200};
                        res.redirect("/app/")
                    }
                    else {
                        jsonWrite(res, result);
                    }
                    connection.release();
                });
            });
    },
    getAll: function( next ) {
        pool.getConnection(function(err, connection) {
            const query = `SELECT USERNAME, NAME, STATUS, CREATED_AT FROM PROFILE`
            connection.query(query, function(err, result) {
                connection.release();
                next( result );
            });
        });
    },
    approve: function( req, res, next ) {
        pool.getConnection(function(err, connection) {
            const query = `UPDATE PROFILE SET STATUS = '${req.params.status === 'approve' ? 'ACTIVE' : 'INACTIVE'}' WHERE USERNAME LIKE '${req.params.username}'`
            connection.query(query, function(err, result) {
                connection.release();
                
                res.redirect('/app/admin')
            });
        });
    }
};
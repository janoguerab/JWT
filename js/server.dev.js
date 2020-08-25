"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');

var server = express();

var bodyParser = require("body-parser");

var jwt = require('jsonwebtoken');

var key = 'MiClaveSuperSegur@123';

var User = function User(id, name, lastName, email, password) {
  _classCallCheck(this, User);

  this.id = id;
  this.name = name;
  this.lastName = lastName;
  this.email = email;
  this.password = password;
};

var users = [];
server.listen("3002", function () {
  console.log(" Servidor iniciado en http://localhost:3002");
});
server.use(bodyParser.json()); //TODO
// middleware es_admin

function validToken(req, res, next) {
  if (req.headers.authorization) {
    var token = req.headers.authorization.split("Bearer ")[1];

    try {
      var _jwt$verify = jwt.verify(token, key),
          email = _jwt$verify.email;

      req.email = email;
      next();
    } catch (error) {
      res.status(401);
      next(error);
    }
  } else {
    next(new Error("Missing token"));
  }
} // middleware es_admin


function isAdmin(req, res, next) {
  var email = req.email;
  var user = users.find(function (user) {
    return user.email === email;
  });

  if (user.es_admin) {
    next(req.user);
  } else {
    res.status(401).json({
      message: "No estás autorizado"
    });
  }
} //Obtener todos los usuarios


server.get("/users", [validToken, isAdmin], function (req, res, next) {
  res.status(200).json({
    message: "Usuarios",
    users: users
  });
}); // Crear usuario

server.post("/user", function (req, res, next) {
  var _req$body = req.body,
      name = _req$body.name,
      lastName = _req$body.lastName,
      email = _req$body.email,
      password = _req$body.password;
  var user = new User(users.length, name, lastName, email, password);
  users.push(user);
  res.status(200).json({
    message: "Usuario agregado",
    user: user
  });
}); // editar usuario

server.put("/user", function (req, res, next) {
  var _req$body2 = req.body,
      name = _req$body2.name,
      lastName = _req$body2.lastName,
      email = _req$body2.email,
      password = _req$body2.password;
  var editUser = users.find(function (user) {
    return user.email === email;
  });
  editUser.name = name;
  editUser.lastName = lastName;
  editUser.password = password;
  res.status(200).json({
    message: "Usuario Editado",
    user: user
  });
}); 
// editar usuario para ser admin
server.put("/addamin", function (req, res, next) {
  var _req$body3 = req.body,
      email = _req$body3.email,
      es_admin = _req$body3.es_admin;
  var user = users.find(function (user) {
    return user.email === email;
  });
  user['es_admin'] = es_admin;
  res.status(200).json({
    message: "Usuario Editado",
    email: email
  });
}); // login

server.post('/login', function (req, res, next) {
  var _req$body4 = req.body,
      email = _req$body4.email,
      password = _req$body4.password;
  var user = users.find(function (user) {
    return user.email === email && user.password == password;
  });

  if (!user) {
    res.status(400).json({
      message: "Usuario o contraseña incorrectos"
    });
  } else {
    res.status(200).json({
      token: jwt.sign({
        email: email
      }, key)
    });
  }
});
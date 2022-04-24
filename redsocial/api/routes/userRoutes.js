'use strict';

var express = require('express');

var Usercontroller = require('../controllers/userController');

var md_auth = require('../middlewares/authenticated'); //middleware de autenticacion, lo usaremos para añadir autenticación en aquellas rutas que precisen autenticación

var api = express.Router();

var multipart = require('connect-multiparty');

var md_upload = multipart({ uploadDir: './uploads/userUploads' }); //tendremos que crear un directorio en la carpeta uploads para almacenar las imagenes de los usuarios

//definimos las rutas

api.get('/home', Usercontroller.home);
api.get('/pruebas', md_auth.ensureAuth, Usercontroller.pruebas);
api.post('/register', Usercontroller.saveUser); //las rutas llevan /api
api.post('/login', Usercontroller.loginUser);
api.get ('/user/:id', md_auth.ensureAuth, Usercontroller.getUser);
api.get('/users/:page?',md_auth.ensureAuth, Usercontroller.getUsuarios)
api.put('/update-user/:id', md_auth.ensureAuth, Usercontroller.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], Usercontroller.uploadImage);
api.get('/get-image-user/:imageFile', Usercontroller.getImageFile);
api.get('/counters/:id?', md_auth.ensureAuth, Usercontroller.getCounters);


//exportamos el modulo

module.exports = api;
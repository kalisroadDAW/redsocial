'use strict';

var express = require('express');

var FollowController = require('../controllers/followController');

var md_auth = require('../middlewares/authenticated'); //middleware de autenticacion, lo usaremos para añadir autenticación en aquellas rutas que precisen autenticación

var api = express.Router(); //cargar el router de express

//desde aqui



// hasta aqui








var multipart = require('connect-multiparty');

var md_upload= multipart({uploadDir:'./uploads/publications'}); //indicamos el directorio en que se guardarán las publicaciones de los usuarios 

var User = require('../models/user'); //cargamos el modelo user

var Follow = require('../models/follow'); //cargamos el modelo follow

var PublicationController = require('../controllers/publicationController'); //cargamos el controlador publication

api.get('/pruebaspublication', md_auth.ensureAuth, PublicationController.pruebaPublication); //ruta de prueba
api.post('/save-publication', md_auth.ensureAuth, PublicationController.savePublication); //ruta para guardar una publicacion
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications); //ruta para obtener las publicaciones
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication); //ruta para obtener las publicaciones
api.delete('/delete-publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);






module.exports = api;


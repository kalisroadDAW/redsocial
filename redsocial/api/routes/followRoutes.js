'use strict';

var express = require('express');

var FollowController = require('../controllers/followController');

var md_auth = require('../middlewares/authenticated'); //middleware de autenticacion, lo usaremos para añadir autenticación en aquellas rutas que precisen autenticación

var api = express.Router(); //cargar el router de express

var multipart = require('connect-multiparty');

//cargamos la ruta de pruebas

api.post('/follow',md_auth.ensureAuth,FollowController.saveFollow);
api.delete('/unfollow/:id',md_auth.ensureAuth,FollowController.unfollow);
api.get('/following/:id?/:page?',md_auth.ensureAuth,FollowController.getFollowedUsers);
api.get('/followers/:id?/:page?',md_auth.ensureAuth,FollowController.getFollowers);

module.exports = api;
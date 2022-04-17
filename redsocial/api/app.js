//este módulo lleva toda la configuracion de express

'use strict';

var express = require('express');

var bodyParser = require('body-parser'); // body-parser es lo que permite a Express leer el cuerpo y luego analizarlo en un objeto Json que podamos entender.

var app = express(); //cargamos express

//cargar rutas 

var user_routes = require('./routes/userRoutes');

var follow_routes = require('./routes/followRoutes');




//cargar middlewares
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json()); //cuando reciba datos de una petición me devolverá un json




//cors











//rutas base

app.use('/api', user_routes);

app.use('/api', follow_routes);







//exportar la configuracion

module.exports = app; //cada fichero será entendido como un modulo
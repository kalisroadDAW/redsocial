//el index js hará las conexiones y la creación del servidor

'use strict'; 

//El modo estricto tiene varios cambios en la semántica normal de JavaScript:

/* Elimina algunos errores silenciosos de JavaScript cambiándolos para que lancen errores.
Corrige errores que hacen difícil para los motores de JavaScript realizar optimizaciones: a veces, el código en modo estricto puede correr más rápido que un código idéntico pero no estricto.
Prohíbe cierta sintaxis que probablemente sea definida en futuras versiones de ECMAScript. */

//creata a data structure connection
//import mongoose
var mongoose = require('mongoose');


/* Qué es mongoose
Mongoose es una librería para Node.js que nos permite escribir consultas para una base de datos de MongooDB, con características como validaciones, construcción de queries, middlewares, conversión de tipos y algunas otras, que enriquecen la funcionalidad de la base de datos.


 */
var app= require('./app'); //aquí dentro está express

var port = 3800; //indicamos el puerto en el que vamos a trabajar

mongoose.Promise=global.Promise;

mongoose.connect('mongodb://localhost:27017/redsocial')
.then(()=>{
    console.log('hola, estás conectado a la base de datos');

    //creamos el servidor usando el método listen de express
    app.listen(port,()=>{
        console.log('servidor corriendo en el puerto: '+port);
    });
})
.catch(err=>{
    console.log(err);
});
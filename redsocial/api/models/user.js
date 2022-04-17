//users model

'use strict';

var mongoose = require('mongoose'); //cargamos el módulo mongoose

var Schema = mongoose.Schema; //creamos un objeto schema

//más tarde podemos darle nomenclatura científica a los modelos


var UserSchema = Schema({  //creamos la estructura de los objetos -- una entidad que vamos a utilizar cuando creemos un usuario. Le pasamos un json por parametro
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    role: String,
    image: String,

 });

 module.exports = mongoose.model('User', UserSchema); //exportamos el objeto para poder utilizarlo en otras partes del proyecto
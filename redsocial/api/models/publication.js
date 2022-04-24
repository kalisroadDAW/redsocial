//users model

'use strict';

var mongoose = require('mongoose'); //cargamos el módulo mongoose

var Schema = mongoose.Schema; //creamos un objeto schema

//más tarde podemos darle nomenclatura científica a los modelos


var PublicationSchema = Schema({  //creamos la estructura de los objetos -- una entidad que vamos a utilizar cuando creemos un follow. Le pasamos un json por parametro

  user: { type: Schema.ObjectId, ref: 'User' }, //referencia a un usuario: indicamos que tipo de datos será (objectId) y que modelo de datos vamos a utilizar (User)
  text: String,
  file: String, 
  created_at: String,

 });

 module.exports = mongoose.model('Publication', PublicationSchema ); //exportamos el objeto para poder utilizarlo en otras partes del proyecto
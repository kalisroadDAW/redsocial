//users model

'use strict';

var mongoose = require('mongoose'); //cargamos el módulo mongoose

var Schema = moongose.Schema; //creamos un objeto schema

//más tarde podemos darle nomenclatura científica a los modelos


var MessageSchema = Schema({  //creamos la estructura de los objetos -- una entidad que vamos a utilizar cuando creemos un follow. Le pasamos un json por parametro

  emitter: { type: Schema.ObjectId, ref: 'User' }, //referencia a un usuario
  receiver: { type: Schema.ObjectId, ref: 'User' }, //referencia a un usuario
  text: String,
  created_at: String,

 });

 module.exports = mongoose.model('Message', MessageSchema ); //exportamos el objeto para poder utilizarlo en otras partes del proyecto
//generamos un método para crear el token

'use strict';

var jwt = require('jwt-simple'); //importamos la libreria jwt
var moment = require('moment'); //nos permite la creación de fechas

var clave_secreta = 'clave_secreta_1995';

exports.createToken = function(user) { //creamos una función que recibe un usuario
    var payload = { //creamos un objeto payload que contiene los datos del usuario
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, clave_secreta); //devolvemos el token
};


'use strict';

//nos ayuda a decodificar el token y obtener el payload (el payload es el objeto completo del token).

var jwt = require('jwt-simple');

var moment = require('moment');

var clave_secreta = 'clave_secreta_1995';


exports.ensureAuth = function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({ message: 'la petición no tiene la cabecera de autenticación' });
  }
  var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, clave_secreta);
    
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({ message: 'el token ha expirado' });
        }
    } catch (ex) {
            return res.status(404).send({ message: 'el token no es valido' });
        }
    req.user = payload;
    next();

}
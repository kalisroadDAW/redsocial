'use strict';

var bcrypt = require('bcrypt-nodejs'); //cargamos el paquete bcrypt de nodejs

var mongoosePaginate = require('mongoose-pagination'); //hay que instalar previamente mongoose-pagination con npm install mongoose-pagination
 
const app = require('../app');
var User = require('../models/user');
var jwt = require('../services/jwt');

var fs = require('fs');


var path = require('path');




function home(req, res){
    res.status(200).send({
        message: 'Hola mundo desde mi API'
    });
}

function pruebas(req,res){
    console.log(req.body);
    res.status(200).send({
        message: 'Acción de pruebas en el servidor de NodeJS'
    });
}

//FUNCIÓN PARA GUARDAR USUARIOS

function saveUser(req, res){
    var user = new User(); //creamos un objeto del modelo usuario
    var params = req.body; //recogemos los datos que nos llegan de la requester

    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.password = params.password;
        user.role = 'ROLE_USER';
        user.image = null;


    //controlamos que no haya usuarios duplicados usando findOne de la libreria mongoose

        User.find({$or: [ //buscamos un usuario con el email o nick que nos llega
            {email: user.email.toLowerCase()},
            {nick: user.nick.toLowerCase()}
        ]}).exec((err, users) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});

            if(users && users.length >= 1){
                return res.status(200).send({message: 'El usuario ya existe'});
            } //ciframos contraseña con el método hash de bcrypt, que importamos previamente.

            bcrypt.hash(params.password, null, null, (err, hash)=>{
                user.password = hash;
    
                //control de guardado del usuario
    
                user.save((err, userStored)=>{
                    if(err){
                        res.status(500).send({
                            message: 'Error al guardar el usuario'
                        });
                    }else{
                        if(!userStored){
                            res.status(404).send({
                                message: 'No se ha registrado el usuario'
                            });
                        }else{
                            res.status(200).send({
                                user: userStored
                            });
                        }
                    }
                });
            });
            });
            

       
    }else{
        res.status(200).send({
            message: 'Envia todos los campos necesarios'
        });
    }
}

//creamos la función de login

function loginUser(req, res){
    var params = req.body; //recogemos los datos que nos llegan de la requester
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(user){
            bcrypt.compare(password, user.password, (err, check)=>{
                if(check){
                    if(params.gettoken){
                        //generamos el token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //devolvemos los datos del usuario
                        user.password = undefined; //permite que la respuesta no devuelva la password, pues esto sería una vulnerabilidad importante
                        return res.status(200).send({user});
                    }
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'});
                }
            });
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar'});
        }
    });
}

//creamos un método que nos poermita listar los datos de un usuario

function getUser(req, res){
    var userId = req.params.id; //recogemos el id que nos llega por la url

    User.findById(userId, (err, user)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!user) return res.status(404).send({message: 'El usuario no existe'});

        return res.status(200).send({user});
    }
    );
}

//creamos una función que nos permita listar los datos de todos los usuarios de nuestra base de datos

function getUsuarios(req, res){
    var identity_user = req.user.sub; //recogemos el id del usuario que nos llega por la url

    var page=1; //definimos la variable pagina
    if(req.params.page){
        page = req.params.page;
    }

    var itemsPerPage = 5; //definimos la variable items por pagina

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

        return res.status(200).send({
            users,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
}

//creamos el metodo update users

function updateUser(req, res){
    var userId = req.params.id; //recogemos el id que nos llega por la url
    var update = req.body; //recogemos los datos que nos llegan por la url

    //borrar propiedad password

    delete update.password;

    if(userId != req.user.sub){ //esta instrucción nos permite controlar que el usuario que quiere modificar el usuario sea el mismo que está logueado
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'});
    }else{
        
    User.findByIdAndUpdate(userId, update, {
        new: true,
        
    }, (err, userUpdated)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

        return res.status(200).send({user: userUpdated});
    });     }  



}
//Creamos el método para subir una imagen del usuario

function uploadImage(req, res){
    var userId = req.params.id; //recogemos el id que nos llega por la url

    if(userId != req.user.sub){ //esta instrucción nos permite controlar que el usuario que quiere modificar el usuario sea el mismo que está logueado
        removeFilesOfUploads(res, file_name, 'No tienes permiso para actualizar los datos del usuario');
       
    }else{
        //metodo para subir la imagen   
        if(req.files){
            var file_path = req.files.image.path; //recogemos la ruta de la imagen
            console.log(file_path);
            var file_split = file_path.split('\\'); //separamos la ruta de la imagen para obtener el nombre de la imagen
            console.log(file_split);
            var file_name = file_split[2]; //guardamos el nombre de la imagen
            console.log(file_name);
            var ext_split = file_name.split('\.'); //separamos el nombre de la imagen para obtener la extensión
            var file_ext = ext_split[1]; //guardamos la extensión de la imagen

            if(userId != req.user.sub){
                return removeFilesOfUploads(res,file_path, 'No tienes permiso para modificar parametros de usuario');
            } 

            if(file_ext.toLowerCase() == 'png' || file_ext.toLowerCase() == 'jpg' || file_ext.toLowerCase() == 'jpeg' || file_ext.toLowerCase() == 'gif'){
                //actualizamos el usuario de la base de datos
                User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated)=>{
                    if(err) return res.status(500).send({message: 'Error en la petición'});

                    if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

                    return res.status(200).send({user: userUpdated});
                });
            } else{
                return removeFilesOfUploads(res,file_path, 'Extensión no válida');
            
            } 
        }else{
            return res.status(200).send({message: 'No se han subido imagenes'});
        } 
    }
}

 function removeFilesOfUploads(res, file_path, message){ //creamos una función que nos permita eliminar la imagen que se ha subido
    fs.unlink(file_path, (err)=>{
        return res.status(200).send({message: message});
    });}


//creamos el método para obtener la imagen del usuario

function getImageFile(req,res){
    var image_file = req.params.imageFile; //recogemos el nombre de la imagen que nos llega por la url
    var path_file = './uploads/userUploads/'+image_file; //creamos la ruta de la imagen

    fs.exists(path_file, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message: 'No existe la imagen'});
        }
    });
}
 


 



//exportamos las funciones para poder usarlas en otro fichero


module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsuarios,
    updateUser,
    uploadImage,
    getImageFile
}

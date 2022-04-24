'use strict';

var bcrypt = require('bcrypt-nodejs'); //cargamos el paquete bcrypt de nodejs

var mongoosePaginate = require('mongoose-pagination'); //hay que instalar previamente mongoose-pagination con npm install mongoose-pagination

var Publication = require('../models/publication'); //cargamos el modelo publication

const app = require('../app');

var jwt = require('../services/jwt');

var moment = require('moment');

var Publication = require('../models/publication'); //cargamos el modelo publication

var User = require('../models/user'); //cargamos el modelo user

var Follow = require('../models/follow'); //cargamos el modelo follow

var fs = require('fs');

var path = require('path');
const { get } = require('http');

//Método de prueba 

function pruebaPublication(req, res) {
    res.status(200).send({
        message: 'Hola mundo desde el metodo de prueba de publication'
    });
}

function savePublication(req, res) {

    var userId = req.user.sub; //obtenemos el id del usuario que esta haciendo la peticion

    var params = req.body; //obtenemos los parametros que nos llegan por post

    var publication = new Publication(); //creamos un nuevo objeto de publication

    //seteamos los datos del publication

    if (params.text) {
        publication.user = userId;
        publication.text = params.text;
        publication.file = null;
        publication.created_at = moment().unix();
        


        publication.user = userId; //asignamos el usuario que esta haciendo la peticion

        publication.text = params.text; //asignamos el texto que se va a publicar

        publication.file = null; //asignamos el archivo que se va a publicar

        publication.save((err, publicationStored) => {
            if (err) {
                res.status(500).send({
                    message: 'Error al guardar la publicacion'
                });
            } else {
                if (!publicationStored) {
                    res.status(404).send({
                        message: 'No se ha registrado la publicacion'	
                    });
                } else {
                    res.status(200).send({
                        publication: publicationStored
                    });
                }

            }
        });
    }else {
        res.status(200).send({
            message: 'El texto es obligatorio'
        });
    }
}

function getPublications(req, res) {

    //hemos usado la paginación anteriormente, por lo que no volvemos a explicarla
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }


    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => { //buscamos aquellos usuarios seguidos por el usuario registrado y con el populate nos traemos los datos del usuario seguido, esto queda en follows
        if (err) return res.status(500).send({ message: 'Error al devolver el seguimiento'});
        var follows_clean = []; //definimos la variable follows_clean que contendra los usuarios seguidos por el usuario registrado

        //por si este método no funciona adecuadamente queda comentado un código alternativo

         follows.forEach((follow) => { //recorremos
            follows_clean.push(follow.followed);
        }); 
/* 
        Publication.find({user:{"$in": follows_clean}}).sort('created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500).send({ message: 'Error al devolver la publicacion'});  */


   Publication.find({user:{"$in": follows_clean}}).sort('created_at').populate('user').select({ '_id': 0, '__v': 0, 'password': 0 }).paginate(page, itemsPerPage, (err, publications, total) => {
    if (err) return res.status(500).send({ message: 'Error al devolver la publicacion'});

    if (!publications) return res.status(404).send({ message: 'No hay publicaciones'});

    return res.status(200).send({
        total_items: total,
        pages: Math.ceil(total/itemsPerPage),
        page: page,
        items_per_page: itemsPerPage,
        publications


       });
    });
});
}

function getPublication(req, res) {
    var publicationId = req.params.id; //obtenemos el id de la publicacion que queremos ver

    Publication.findById(publicationId, (err, publication) => { //buscamos la publicacion por su id
        if (err) return res.status(500).send({ message: 'Error al devolver la publicacion'});

        if (!publication) return res.status(404).send({ message: 'No existe la publicacion'});

        return res.status(200).send({ publication });
    });
}

//borrar publicacion

/* function deletePublication(req, res) {
    var publicationId = req.params.id; //obtenemos el id de la publicacion que queremos borrar

    Publication.find({user:req.user.sub, id:publicationId}).deleteOne((err, publicationRemoved) => { //buscamos la publicacion por su id y la borramos
        if (err) return res.status(500).send({ message: 'Error al borrar la publicacion'});

        if(!publicationRemoved) return res.status(404).send({ message: 'No existe la publicacion'});

        

        return res.status(200).send({ message: 'Publicacion borrada'});
    }



    );  
} */

//metodo para elimianr las publicaciones
function deletePublication(req,res){
    
    var publicationId = req.params.id;
 
    Publication.deleteOne({user:req.user.sub,'_id':publicationId},(err,publicationRemoved)=>{
 
        if(err) return res.status(500).send({message:'Error al borrar la publicación.'});
       
        if(!publicationRemoved) return res.status(404).send({message:'No se ha borrado la publicación.'});
       
        return res.status(200).send({publication:publicationRemoved});
    });
}

//Creamos una función para subir una publicación (un archivo):

/*  function uploadImage(req, res) {
    var publicationId = req.params.id; //recogemos el id que nos llega por la url
    var userId = req.user.sub


    if (userId != req.user.sub) { //esta instrucción nos permite controlar que el usuario que quiere modificar el usuario sea el mismo que está logueado
        removeFilesOfUploads(res, file_name, 'No tienes permiso para actualizar los datos del usuario');

     } else { 
        //metodo para subir la imagen   
        if (req.files) {
            var file_path = req.image.path; //recogemos la ruta de la imagen
            console.log(file_path);
            var file_split = file_path.split('\\'); //separamos la ruta de la imagen para obtener el nombre de la imagen
            console.log(file_split);
            var file_name = file_split[2]; //guardamos el nombre de la imagen
            console.log(file_name);
            var ext_split = file_name.split('\.'); //separamos el nombre de la imagen para obtener la extensión
            var file_ext = ext_split[1]; //guardamos la extensión de la imagen


            if (file_ext.toLowerCase() == 'png' || file_ext.toLowerCase() == 'jpg' || file_ext.toLowerCase() == 'jpeg' || file_ext.toLowerCase() == 'gif') {
                //actualizamos el documento de la publicación
                Publication.findOne({'user':req.user.sub, '_id':publicationId}).exec((err, publicationUpdated) => {
                    if (err) return res.status(500).send({ message: 'Error en la petición' });

                    if (!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

                    return res.status(200).send({ publication: publicationUpdated });
                });
            } else {
                return removeFilesOfUploads(res, file_path, 'Extensión no válida');

            }
        } else {
            return res.status(200).send({ message: 'No se han subido imagenes' });
        }
    }
}


function removeFilesOfUploads(res, file_path, message) { //creamos una función que nos permita eliminar la imagen que se ha subido
        fs.unlink(file_path, (err) => {
            return res.status(200).send({ message: message });
        });
    }  */

//creamos el método para obtener la imagen del usuario

function uploadImage(req, res) {
    var userId = req.user.sub;
    var publicationId = req.params.id

    Publication.findOne({'user':userId, '_id':publicationId}).exec((err, publication) => {
        if(publication){

            try {
                var file_path = req.files.file.path;
         
                var file_split = file_path.split('\\');
                var file_name = file_split[2];
                var ext_split = file_name.split('\.');
                var file_ext = ext_split[1];
         
         
               /*  if (userId != req.user.sub) {
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
                } */
         
                if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
                    
                    // Actualizar documento de usuario logueado
                    Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (err, imageSaved) => {
                        if (err) return res.status(500).send({ message: 'Error en la petición' });
                        if (!imageSaved) return res.status(404).send({ message: 'No se ha podido Actualizar los datos del usuario' });
                        return res.status(200).send({ file: imageSaved });
                    });
                } else {
                    //en caso de que la extension sea mala
                    return res.status(200).send({ message: 'Extensión no válida' });
                }
         
            } catch {
                return res.status(200).send({ message: 'No se han subido Imagenes' });
            }



        }else{
            return res.status(200).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
        }
    });



 
 
    
} 


function getImageFile(req, res) {
    var image_file = req.params.imageFile; //recogemos el nombre de la imagen que nos llega por la url
    var path_file = './uploads/publications/' + image_file; //creamos la ruta de la imagen

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
}










        
        



module.exports = {
    pruebaPublication,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}

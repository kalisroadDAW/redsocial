'use strict';

var path = require('path'); //cargamos el path

var fs = require('fs'); //cargamos el fs (libreria fs)

var mongoosePaginate = require('mongoose-pagination'); //cargamos el mongoose-pagination

var User = require('../models/user'); //cargamos el modelo user

var Follow = require('../models/follow'); //cargamos el modelo follow

//creamos un metodo de prueba

function saveFollow (req,res) {

    var params = req.body; //obtenemos los parametros que nos llegan por post
    
    var follow = new Follow(); //creamos un nuevo objeto de follow
    follow.user=req.user.sub; //asignamos el usuario que esta haciendo la peticion
    follow.followed=params.followed; //asignamos el usuario que se va a seguir
   

    

        follow.save((err,followStored) => {
            if(err) return res.status(500).send({message: 'Error al guardar el follow'});

            if(!followStored) return res.status(404).send({message: 'El follow no ha sido guardado'});

            return res.status(200).send({follow: followStored});
        });

    
}

//método unfollow

function unfollow (req,res) {
    var userId = req.user.sub; //obtenemos el id del usuario que esta haciendo la peticion
    var followId = req.params.id; //obtenemos el id del follow que queremos eliminar

   

    Follow.find({"user":userId,"followed":followId}).remove(err => { //buscamos el follow que queremos eliminar
        if(err) return res.status(500).send({message: 'Error al dejar de seguir'});

        return res.status(200).send({message: 'El follow se ha eliminado'});
    });
}

//MÉTODO QUE PERMITE MOSTRAR LOS USUARIOS QUE SIGO

function getFollowedUsers(req, res){
    var userId = req.user.sub; //obtenemos el id del usuario que esta haciendo la peticion
    

    var page=1; //definimos la variable pagina

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }


    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 5; //definimos la variable items por pagina

    Follow.find({"user":userId}).populate({path: 'followed'}).sort('_id').paginate(page, itemsPerPage, (err, following, total)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!following) return res.status(404).send({message: 'No sigues a ningún usuario'});

        return res.status(200).send({
            following,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });
}

//MÉTODO QUE PERMITA VER LOS USUARIOS QUE ME SIGUEN

function getFollowers (req,res) {
    var userId = req.user.sub; //obtenemos el id del usuario que esta haciendo la peticion
    

    var page=1; //definimos la variable pagina

    if(req.params.id && req.params.page){
        userId = req.params.id;
    }

    if(req.params.page){
        page = req.params.page;
    }else{
        page = req.params.id;
    }

    var itemsPerPage = 5; //definimos la variable items por pagina

    //el método es igual al anterior, simplemente cambia el hecho de que buscamos en la colección los documentos cuyo followed sea igual a nuestro userID

    Follow.find({"followed":userId}).populate('user').sort('_id').paginate(page, itemsPerPage, (err, followers, total)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(!followers) return res.status(404).send({message: 'No tienes seguidores'});

        return res.status(200).send({
            followers,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
    });

    


}

//Creamos métodos sin paginar

//Devolver usuarios que sigo y que me siguen

function getMyFollows(req, res){
    var userId = req.user.sub;
    

    var find=Follow.find({"user":userId});
    
    if(req.params.followed){
        find=Follow.find({"followed":userId});
    }

    
    find.populate( 'user followed').exec((err, following)=>{
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!following) return res.status(404).send({message: 'No sigues a ningún usuario'});

        return res.status(200).send({
            following
        });

 }  );
}









module.exports={
    
    saveFollow,
    unfollow,
    getFollowedUsers,
    getFollowers,
    getMyFollows
}


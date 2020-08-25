const express = require('express');
const server = express();
const bodyParser = require("body-parser")
const jwt = require('jsonwebtoken');
const key = 'MiClaveSuperSegur@123';
class User{
    constructor(id,name,lastName,email,password){
        this.id = id;
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }
}

let users = [];


server.listen("3002",()=>{
    console.log(" Servidor iniciado en http://localhost:3002");
});

server.use(bodyParser.json());
//TODO
// middleware es_admin
function validToken(req,res,next){
    if(req.headers.authorization){
        const token = req.headers.authorization.split("Bearer ")[1];
        try{
            const {email} = jwt.verify(token, key);
            req.email = email;
            next();
        }catch(error){
            res.status(401);
            next(error);
        }
    }else{
        next(new Error("Missing token"));
    }
}


// middleware es_admin
function isAdmin(req,res,next){
    const email = req.email;
    let user = users.find(user => user.email === email);
    if(user.es_admin){
        next(req.user);
    }else{
        res.status(401).json({
            message:"No estás autorizado"
        })
    }
}

//Obtener todos los usuarios
server.get("/users",[validToken,isAdmin],(req, res, next)=>{
    res.status(200).json({
        message: "Usuarios",
        users: users
    });
});


// Crear usuario
server.post("/user",(req, res, next)=>{
    const {name,lastName,email,password} = req.body;
    const  user = new User(users.length,name,lastName,email,password);
    users.push(user);
    res.status(200).json({
        message: "Usuario agregado",
        user: user
    });
});

// editar usuario
server.put("/user",(req, res, next)=>{
    const {name,lastName,email,password} = req.body;
    let editUser = users.find(user => user.email === email)
    editUser.name = name;
    editUser.lastName = lastName;
    editUser.password = password;

    res.status(200).json({
        message: "Usuario Editado",
        user: user
    });
});

// editar usuario
server.put("/addamin",(req, res, next)=>{
    const {email,es_admin} = req.body;
    let user = users.find(user => user.email === email)
    user['es_admin'] = es_admin;
    
    res.status(200).json({
        message: "Usuario Editado",
        email: email
    });
});

// login
server.post('/login',(req,res,next)=>{
    const {email,password} = req.body;
    let user = users.find(user => user.email === email && user.password == password)
    if(!user){
        res.status(400).json({
            message:"Usuario o contraseña incorrectos"
        })
    }else{
        res.status(200).json({
            token: jwt.sign({email},key)
        })
    }

})
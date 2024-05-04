const path = require("path");
const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://pruebafp.test');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const server = app.listen(3000, () => {
    console.log('Servidor en el puerto 3000');
});

const SocketIO = require("socket.io");
const io = SocketIO(server, {
    cors: {
        origin: "http://pruebafp.test",
        methods: ["GET", "POST"],
        allowedHeaders: ["X-Requested-With", "content-type"],
        credentials: true
    }
});

let subscribers = [];

io.on("connection", (socket) => {
    //console.log("Nueva conexión: ", socket.id);

    socket.on('subscribe', (data) => {
        if (subscribers.length == 0) {
            subscribers.push({id: data.id, socketId: socket.id, socket: socket})
        }
        var index = null;
        for (var item in subscribers) {
            if (subscribers[item].id == data.id) {
                index = item;
            }
        }
        if (index != null) {
            subscribers[index].socketId = socket.id;
            subscribers[index].socket = socket;
        } else {
            subscribers.push({id: data.id, socketId: socket.id, socket: socket})
        }
        console.log(subscribers);
    });

    socket.on("mensaje", (data) => {
        console.log(data)
        //io.sockets.emit("respuesta", {msn: data.msn, id: "123"});

        var index = null;
        for (var item in subscribers) {
//            console.log(item)
            if (subscribers[item].id == data.to) {
                index = item;
            }
        }
        console.log(index)

//        console.log(subscribers[index])
        if (index != null) {
            io.to(subscribers[index].socketId).emit('respuesta', data);
        }

    });
});

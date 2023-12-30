
const WebSocketServer = require('ws').Server;

const ws = new WebSocketServer({port: 3000});

var clientes = new Map();

ws.on('connection', function connection(ws) {
    console.log('Cliente conectado');
    // Evento cuando se recibe un mensaje del cliente
    ws.on('message', function incoming(message) {

        if (message instanceof Buffer) {
            message = message.toString('utf8');
        }

        id = obtenerId_Message(message)[0];
        msg = obtenerId_Message(message)[1];
        to = obtenerId_Message(message)[2];

        ws.id = id;

        if (!clientes.has(id)) {
            clientes.set(id, ws);
        }

        console.log(clientes.size)

        console.log('Mensaje recibido, Origen: ' + id + ' | ' + msg + '  |  destino: ' + to);
        // Procesa el mensaje y envía una respuesta al cliente si es necesario
        if (clientes.has(to)) {
            if (msg != 'suscribe') {
                clientes.get(to).send(msg);
            }
        }
    });


    // Evento cuando se cierra la conexión con el cliente
    ws.on('close', function close() {
        console.log('Cliente desconectado');
        clientes.delete(ws.id);
        console.log(clientes.size)
    });
});


function obtenerId_Message(mensaje) {
//    id:123456;¡Botón presionado!
    let  mensaje_split = mensaje.split(';');
    return mensaje_split;
}

console.log("server");

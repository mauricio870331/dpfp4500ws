//Has configurado un dominio, usa: { get_path(document.domain) }
//No has configurado un dominio, usa { get_path('public') }
//Para obtener la ruta raiz del sitio
var mode;
const socket = io("localhost:3000");

socket.on('connect', () => {
    console.log('Conectado al servidor');
    data = {
        id: getServerKey(),
        to: getClientkey()
    };
    socket.emit('subscribe', data);
});


// Manejar evento de error de conexión
socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error);
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor');
});

function get_path(str_limit) {
    var path = jQuery(location).attr('origin') + "" + jQuery(location).attr('pathname');
    index = path.indexOf(str_limit);
    path = path.substring(0, index + str_limit.length)
    return path.toString();
}

//if (get_path("finger-list").includes("finger-list")) {
//    setInterval(getFingerprintByUser, 1500);
//}

if (get_path("verify_users").includes("verify_users")) {
    activeSensor(null, null, "read");
}

function srnPc() {
    var d = new Date();
    var dateint = d.getTime();
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var total = letters.length;
    var keyTemp = "";
    for (var i = 0; i < 6; i++) {
        keyTemp += letters[parseInt((Math.random() * (total - 1) + 1))];
    }
    keyTemp += dateint;
    return keyTemp;
}

//ready
jQuery('body').on('click', '.create_server_key', function () {
    if (!localStorage.getItem("server_key")) {
        localStorage.setItem("server_key", srnPc());
        Swal.fire({
            icon: 'success',
            title: 'Generated Server Key..!',
            text: 'Token: ' + localStorage.getItem("server_key")
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'The Generated Token is:',
            text: getServerKey()
        });
    }
});

//crear funcion para agregar clave de java
jQuery('body').on('click', '.create_client_key', function () {
    if (!localStorage.getItem("client_key")) {
        localStorage.setItem("client_key", srnPc());
        Swal.fire({
            icon: 'success',
            title: 'Generated Client Key..!',
            text: 'Token: ' + localStorage.getItem("client_key")
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'The Generated Client Key is:',
            text: getClientkey()
        });
    }
});



//Obtener serial number
function getServerKey() {
    return localStorage.getItem("server_key");
}

function getClientkey() {
    return localStorage.getItem("client_key");
}


jQuery('body').on('click', '.add_finger', function () {
//    console.log($(this).attr('id'));    
    Swal.fire({
        title: 'Seleccione el nombre del dedo',
        input: 'select',
        inputOptions: {
            'Seleccione': 'Seleccione',
            "Dedos Mano Derecha": {
                Pulgar_Derecho: 'Pulgar',
                Indice_Derecho: 'Indice',
                Corazon_Derecho: 'Corazon',
                Anular_Derecho: 'Anular',
                Menique_Derecho: 'Meñique'
            },
            "Dedos Mano Izquierda": {
                Pulgar_Izquierdo: 'Pulgar',
                Indice_Izquierdo: 'Indice',
                Corazon_Izquierdo: 'Corazon',
                Anular_Izquierdo: 'Anular',
                Menique_Izquierdo: 'Meñique'
            },
        },
        showCancelButton: true,
        inputValidator: (value) => {
            return new Promise((resolve) => {
                if (value !== 'Seleccione') {
                    activeSensor($(this).attr('id'), value, "enroll");
                    resolve();
                } else {
                    resolve('Debes seleccionar un dedo..!');
                }
            });
        }
    });
});


function activeSensor(userId, fingerName, option) {
    // Conexión WebSocket del cliente    
    mode = option;
    var data = {
        user: getServerKey(),
        to: getClientkey(),
        option: option,
        finger_name: fingerName,
        user_id: userId
    };
    socket.emit("mensaje", data);
}


socket.on("respuesta", function (data) {
    if (mode == "read") {
        console.log("read");
        jQuery(".imgFinger").attr("id", localStorage.getItem("server_key"));
        jQuery(".txtFinger").attr("id", localStorage.getItem("server_key") + "_texto");
        jQuery(".u_nombre").attr("id", localStorage.getItem("server_key") + "_name");
        jQuery(".u_identificacion").attr("id", localStorage.getItem("server_key") + "_identifier");

        if (data.msn == "Ok") {
            getData(data.userId, data.fingerId);
        } else {
            jQuery("#" + localStorage.getItem("server_key") + "_identifier").text("User Id: ");
            jQuery("#" + localStorage.getItem("server_key") + "_texto").text("El Usuario No existe");
            icono = "error";
            Swal.fire({
                position: 'top-end',
                icon: icono,
                title: 'El usuario no existe',
                showConfirmButton: false,
                timer: 3000
            });
        }
    } else {
        if (data.msn == "Ok") {
            Swal.fire({
                position: 'top-end',
                icon: "success",
                title: 'Huella guardada correctamente',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            Swal.fire({
                position: 'top-end',
                icon: "error",
                title: 'Ocurrió un error al guardar la huella',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
});

//Para obtener las huellas de usuario
function getFingerprintByUser() {
    var userId = jQuery(".add_finger").data("id");
    var _url = get_path("public") + "/users/" + userId + "/finger-list";
    jQuery.get(get_path("public") + "/get-finger/" + userId, function (data) {
        if (data.length > 0) {
            window.location = _url;
        }
    });
}

//verificar check in o check out
function getData(usrId, fingerId) {
    $.ajax({
        type: 'GET',
        url: get_path("public") + "/users/getdata_users/" + usrId + "/" + fingerId,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (data) {
            console.log(data);
            if (data.fingerprint.image !== null) {
                jQuery("#" + localStorage.getItem("server_key") + "_name").text(data.name);
                jQuery("#" + localStorage.getItem("server_key")).attr("src", "data:image/png;base64," + data.fingerprint.image);
                if (data.id != null) {
                    jQuery("#" + localStorage.getItem("server_key") + "_identifier").text("User Id: " + data.id);
                    jQuery("#" + localStorage.getItem("server_key") + "_texto").text("Usuario verificado");
                    icono = "success";
                    Swal.fire({
                        position: 'top-end',
                        icon: icono,
                        title: 'Usuario Verificado',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    jQuery("#" + localStorage.getItem("server_key") + "_name").text("");
                    jQuery("#" + localStorage.getItem("server_key") + "_identifier").text("User Id: ");
                    jQuery("#" + localStorage.getItem("server_key") + "_texto").text("El Usuario No existe");
                    icono = "error";
                    Swal.fire({
                        position: 'top-end',
                        icon: icono,
                        title: 'El usuario no existe',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            }

        }
    });
}


jQuery("body").on('click', '#btn_user_list', function () {
    var token = jQuery("meta[name='csrf-token']").attr("content");
    var data = new FormData();
    data.append("_token", token);
    data.append("token_pc", localStorage.getItem("srnPc"));
    $.ajax({
        type: 'POST',
        url: get_path("public") + "/api/sensor_close",
        data: data,
        dataType: 'json',
        contentType: false,
        processData: false,
        cache: false,
        success: function (response) {
            if (response.code) {
                console.log("sensor close option");
            }
        }
    });
});
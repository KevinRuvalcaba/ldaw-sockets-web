//const socket = io.connect('http://localhost:3307');
function showToast(msg){
    $.toast({
        text: msg,
        position: 'top-right'
    });
}

window.socket = null;
function connectToSocketIo(){
    let server = window.location.protocol + "//" + window.location.host;
    window.socket = io.connect(server);
    window.socket.on("toast", function(data){
        showToast(data.message);
    });

    window.socket.on("setName", (data) => {
        $('#player').html('Jugador'+data.msg);
    });

    window.socket.on("triggerBasta", ()=> {
        $('#btn').prop( "disabled", true );
    });
    window.socket.on("freeButton", ()=> {
        $('#btn').prop( "disabled", false );
    });

    window.socket.on("evaluatePlayer",() => {
        
        var nombre = $('#nombre').val();
        var color = $('#color').val();
        var fruto = $('#fruto').val();
        var name = $('#player').html();
        console.log(nombre, color, fruto);
        //nombre = nombre? nombre:"";
        //color = color? color:"";
        //fruto = fruto? fruto:"";
        
        nombre = nombre.charAt(0).toUpperCase() === $('#letra').html()? nombre:"";
        color = color.charAt(0).toUpperCase() === $('#letra').html()? color:"";
        fruto = fruto.charAt(0).toUpperCase() === $('#letra').html()? fruto:"";
        window.socket.emit("send-results", {nombre: nombre, color: color, fruto: fruto, player: name})
        
    });

    window.socket.on("alert", (data) => {
        console.log('wow');
        showToast(data.msg);
        $('#nombre').val('');
        $('#color').val('');
        $('#fruto').val('');
    });

    window.socket.on('newLetter', (data) => {
        $('#letra').html(data.letter.toUpperCase());
       
    });

    window.socket.on('broadcast',(data)=>{console.log(data.description);})
}

function messageToServer(msg) {
    window.socket.emit('message-to-server', {message: msg});
}

function sendBasta(){
    const nombre = $('#nombre').val();
    const color = $('#color').val();
    const fruto = $('#fruto').val();
    console.log(nombre, color, fruto);
    if(!nombre || !color || !fruto){
        alert('Amigo no tienes llenado uno de los campos');
      } else if(nombre.charAt(0).toUpperCase() != $('#letra').html() || color.charAt(0).toUpperCase() != $('#letra').html() || fruto.charAt(0).toUpperCase() != $('#letra').html()){
        alert('Amigo, esas letras no empiezas con la letra '+ $('#letra').html())
    }else {
        window.socket.emit('send-basta', {nombre: nombre, color: color, fruto: fruto});
    }
    
}



$(function() {
    //
    connectToSocketIo();
});


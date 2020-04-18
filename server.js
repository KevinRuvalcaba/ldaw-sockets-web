// Imports
const express = require('express');
const webRoutes = require('./routes/web');
var $ = require('jquery');
const Player = require("./classes/player");
const Game = require("./classes/game");

// Session imports
let cookieParser = require('cookie-parser');
let session = require('express-session');
let flash = require('express-flash');
let passport = require('passport');

// Express app creation
const app = express();

//socket io 
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Session configurations
let sessionStore = new session.MemoryStore;
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: appConfig.secret
}));
app.use(flash());

// Configuraciones de passport
require('./configs/passport');
app.use(passport.initialize());
app.use(passport.session());

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }))

app.use('/', express.static(__dirname+"/public"));

currentGame = new Game(1);
var allClients = [];
var gone = 0;
var MaxPlayerID = 1;
// Routes
app.use('/', webRoutes);
io.on('connection', (socket) =>{
  allClients.push(socket);
  console.log('new commer ',allClients.length);
  console.log('usuario conectado');
  player = new Player(MaxPlayerID);
  socket.emit('toast', {message: "HOLA AMIGO, eres el jugador: "+MaxPlayerID});
  socket.broadcast.emit('broadcast',  {description: MaxPlayerID+' numero de personas'});
  MaxPlayerID++;
  console.log('Player id ', player.id);
  socket.emit('setName', {msg: player.id})


  socket.on('send-basta', (nombre, color, fruto) => {
    currentGame.players = allClients;
    console.log('peeee',currentGame.players.length);
    console.log('poooooo',allClients.length);
    socket.emit('toast', {message: "SE INICIO UN BASTA"});
    socket.broadcast.emit('toast', {message: "SE INICIO UN BASTA"});
    socket.broadcast.emit('triggerBasta', {});
    var run = async function() {  
      for(var i=1;i<=10;i++){
        socket.emit('toast', {message: "BASTA "+i});
        socket.broadcast.emit('toast', {message: "BASTA "+i});
        await sleep(1000);
      }
      console.log('hello');
      socket.emit('toast', {message: "EMPIEZA UN NUEVO ROUND"});
      socket.broadcast.emit('toast', {message: "EMPIEZA UN NUEVO ROUND"});

      const letter = currentGame.displayLetter()
      currentGame.isActive = true;

      socket.broadcast.emit('evaluatePlayer', {});
      socket.emit('evaluatePlayer', {});

      currentGame.players = allClients;
      socket.broadcast.emit('newLetter', {letter: letter});
      socket.emit('newLetter', {letter: letter});
      socket.broadcast.emit('freeButton', {});
    }
    run();   
    
  });

  socket.on('disconnect', () => {
    console.log('Got disconnect!');
    //var i = allClients.indexOf(socket);
    console.log('before ',allClients.length);
    //allClients.splice(i, 1);
    allClients.pop();
    gone++;
    currentGame.players = allClients;
    console.log('after ',allClients.length);
    if(currentGame.players.length < 2){
      socket.broadcast.emit('triggerBasta', {});
      currentGame.isActive = false;
    }
  });

  socket.on("send-results", (data) => { 
    console.log('made it to results');
    console.log(currentGame.victoryMSG);
    console.log(data);
    currentGame.calculateWinner(data.nombre, data.color, data.fruto, data.player, allClients.length - gone);
    if(currentGame.victoryMSG !== ''){
      console.log(currentGame.victoryMSG);
      socket.broadcast.emit('alert', {msg: currentGame.victoryMSG});
      socket.emit('alert', {msg: currentGame.victoryMSG});
      currentGame.victoryMSG = '';
    } 
    
  });

  if(!currentGame.isActive){
    socket.emit('toast', {message: "Ya te uniste al juego"});
    
    currentGame.addPlayer(player.id);
  } else {
    socket.emit('triggerBasta', {});
    socket.emit('toast', {message: "Ya hay un juego en proceso.... esperate !!"});
  }
  //console.log(currentGame.players.length);
  if(currentGame.players.length >= 2 && !currentGame.isActive){
    socket.broadcast.emit('freeButton', {});
    const letter = currentGame.displayLetter()
    currentGame.isActive = true;
    socket.broadcast.emit('newLetter', {letter: letter});
    socket.emit('newLetter', {letter: letter});

  }
  
}); 

// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Game {
    constructor(id){
        this.id = id;
        this.players = [];
        this.isActive = false;
        this.currentLetter = "a";
        this.currentLetter;
        this.results = {};
        this.victoryMSG = '';
        //this.socket = io.connect('http://localhost:3307');
    }


    calculateWinner(nombre, color, fruto, playerId, totals) {
        
        nombre = nombre? nombre:"";
        color = color? color:"";
        fruto = fruto? fruto:"";
        this.results[playerId] = [nombre,color, fruto];
        console.log(playerId);
        console.log(this.results);
        console.log('players length: ', totals);
        console.log('results length: ', Object.keys(this.results).length);
        console.log('comparation: ', Object.keys(this.results).length >= totals);
        if(Object.keys(this.results).length >= totals){
            var mySet = {};
            let scores = {};
            Object.keys(this.results).forEach(e => {
                if (!mySet[this.results[e][0]]) mySet[this.results[e][0]] = 1  
                else{mySet[this.results[e][0]] = mySet[this.results[e][0]]+1}

                if (!mySet[this.results[e][1]]) mySet[this.results[e][1]] = 1  
                else{mySet[this.results[e][1]] = mySet[this.results[e][1]]+1}

                if (!mySet[this.results[e][2]]) mySet[this.results[e][2]] = 1  
                else{mySet[this.results[e][2]] = mySet[this.results[e][2]]+1}

                scores[e] = 0;
            });
            Object.keys(this.results).forEach(e => {
                if(this.results[e][0]  == "") scores[e]+=0;
                else if(mySet[this.results[e][0]] == 1) scores[e]+=10; 
                else scores[e]+=5;

                if(this.results[e][1]  == "") scores[e]+=0;
                else if(mySet[this.results[e][1]] == 1) scores[e]+=10; 
                else scores[e]+=5;

                if(this.results[e][2]  == "") scores[e]+=0;
                else if(mySet[this.results[e][2]] == 1) scores[e]+=10; 
                else scores[e]+=5;

            });
            var winners = [];
            var high = -1;
            Object.keys(scores).forEach(e => {
                if(scores[e] > high){
                    winners = [e];
                    high = scores[e];
                } else if(scores[e] == high){
                    winners.push(e);
                }
            });
            var msg = 'GANADORES: ';
            winners.forEach(e => {
                msg += ` ${e}`;
            });
            this.victoryMSG = msg;
            this.results = {};
        }
    }
  
    addPlayer(player){
        this.players.push(player);
    }
  
  
    displayLetter(){
        var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        var nextLetter = alphabet[Math.floor(Math.random()*alphabet.length )];
        return nextLetter;
    }
}

module.exports = Game;
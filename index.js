const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

















// --- mySnake LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#1E90FF',
    headType: 'evil',
    tailType: 'round-bum'
  }

  return response.json(data)
})

// Handle POST request to '/move'

app.post('/move', (request, response) => {

  // NOTE: Do something here to generate your move
  console.log(request);

  var arrMove = ["up", "down", "left", "right"];
  var Collision = [0, 0, 0, 0];
  var mySnake = [];
  var prevDirection = 0;
  var gameHeight = request.body.board.height;
  var gameWidth = request.body.board.width;
  var d = 0;

  for(let i = 0; i < request.body.you.body.length; i++){
    const bodyPart = {x: request.body.you.body[i].x, y: request.body.you.body[i].y};
    mySnake.push(bodyPart);
  }

  console.log("new turn" );
  console.log(mySnake);

  //Check previous move
  if(mySnake[0].x - 1 == mySnake[1].x){
    prevDirection = 3;
  }else if(mySnake[0].x + 1 == mySnake[1].x){
    prevDirection = 2;
  }else if(mySnake[0].y - 1 == mySnake[1].y){
    prevDirection = 1;
  }else if(mySnake[0].y + 1 == mySnake[1].y){
    prevDirection = 0;
  }

  //check for collisions with itself
  for(let i = 4; i < mySnake.length; i++){
    if(mySnake[i].x == mySnake[0].x + 1 && mySnake[i].y == mySnake[0].y){
      Collision[2] = 1;
    }

    if(mySnake[i].x == mySnake[0].x - 1 && mySnake[i].y == mySnake[0].y){
      Collision[3] = 1;
    }

    if(mySnake[i].x == mySnake[0].x && mySnake[i].y == mySnake[0].y + 1){
      Collision[1] = 1;
    }
    if(mySnake[i].x == mySnake[0].x && mySnake[i].y == mySnake[0].y - 1){
      Collision[0] = 1;
    }
  }

  //Check for collisions with walls
  //top wall
  if(mySnake[0].y == 0){
    Collision[0] = 1;
  }
  //bottom wall
  if(mySnake[0].y == gameHeight){
    Collision[1] = 1;
  }
  //left wall
  if(mySnake[0].x == 0){
    Collision[2] = 1;
  }
  //right wall
  if(mySnake[0].x == gameWidth){
     Collision[3] = 1;
  }

    //Handle collisions
    //check if any collisons
    if(Collision[0] == 1 || Collision[1] == 1 || Collision[2] == 1 || Collision[3] == 1){
      //check if going up and upper collision
      if(prevDirection == 0 && Collision[0] == 1){
        //Check if left is clear
        if(Collision[2] == 0){
          //turn left
          d = 2;
        } else {
          //if not clear turn right
          d = 3;
        }
      }
      if(prevDirection == 1 && Collision[1] == 1){
        if(Collision[2] == 0){
          d = 2;
        } else {
          d = 3;
        }
      }
      if(prevDirection == 2 && Collision[2] == 1){
        if(Collision[0] == 0){
          d = 0;
        } else {
          d = 1;
        }
      }
      if(prevDirection == 3 && Collision[3] == 1){
        if(Collision[0] == 0){
          d = 0;
        } else {
          d = 1;
        }
      }
      d = prevDirection;
    } else {
      d = prevDirection;
    }
/*
  if(Collision[2] == 1 && mySnake[0].x - 1 == mySnake[1].x){

    if(Collision[0] == 0){
      d = 0;
    }else if(Collision[1] == 0){
      d = 1;
    }
  }
  if(Collision[3] == 1 && mySnake[0].x + 1 == mySnake[1].x){

    if(Collision[0] == 0){
      d = 0;
    }else if(Collision[1] == 0){
      d = 1;
    }
  }
  if(Collision[1] == 1 && mySnake[0].y - 1 === mySnake[1].y){

    if(Collision[3] == 0){
      d = 2;
    }else if(Collision[2] == 0){
      d = 3;
    }
  }
  if(Collision[0] == 1 && mySnake[0].y + 1 == mySnake[1].y){

    if(Collision[3] == 0){
      d = 2;
    }else if(Collision[2] == 0){
      d = 3;
    }
  }
*/
console.log(prevDirection);
console.log(Collision);
console.log(d);
  // Response data
  var turn = arrMove[d];
  const data = {
   move: turn,
   }

  return response.json(data)
})
 
//Leaving space to not be confused
  /*To commit changes push following
      git add .
      git commit -m ""
      git push
      git push heroku master
  */



















app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this mySnake is still alive.
  return response.json({});
})

// --- mySnake LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})

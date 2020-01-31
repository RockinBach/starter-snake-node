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
  var arrCollision = [0, 0, 0, 0];
  var mySnake = [];
  var gameHeight = request.body.board.height;
  var gameWidth = request.body.board.width;
  var d = 0;
  var topCollision = 0;
  var bottomCollision = 0;
  var rightCollision = 0;
  var leftCollision = 0;

  for(let i = 0; i < request.body.you.body.length; i++){
    const bodyPart = {x: request.body.you.body[i].x, y: request.body.you.body[i].y};
    mySnake.push(bodyPart);
  }

  console.log("new turn" );
  console.log(mySnake);

  //check for collisions with itself
  for(let i = 4; i < mySnake.length; i++){
    if(mySnake[i].x == mySnake[0].x + 1 && mySnake[i].y == mySnake[0].y){
      rightCollision = 1;
    }

    if(mySnake[i].x == mySnake[0].x - 1 && mySnake[i].y == mySnake[0].y){
      leftCollision = 1;
    }

    if(mySnake[i].x == mySnake[0].x && mySnake[i].y == mySnake[0].y + 1){
      bottomCollision = 1;
    }
    if(mySnake[i].x == mySnake[0].x && mySnake[i].y == mySnake[0].y - 1){
      topCollision = 1;
    }
  }

  //Check for collisions with walls
  if(mySnake[0].y == 0 && mySnake[1].y == 1){
    topCollision = 1;
  }
  if(mySnake[0].y == gameHeight && mySnake[1].y == gameHeight - 1){
    bottomCollision = 1;
  }
  if(mySnake[0].x == 0 && mySnake[1].x == 1){
    rightCollision = 1;
  }
  if(mySnake[0].x == gameWidth && mySnake[1].x == gameWidth - 1){
     leftCollision = 1;
  }

  arrCollision[0] = topCollision;
  arrCollision[1] = bottomCollision;
  arrCollision[2] = leftCollision;
  arrCollision[3] = rightCollision;



    //Handle collisions
  if(rightCollision == 1 && mySnake[0].x - 1 == mySnake[1].x){

    if(topCollision == 0){
      d = 0;
    }else if(bottomCollision == 0){
      d = 1;
    }
  }
  if(leftCollision == 1 && mySnake[0].x + 1 == mySnake[1].x){

    if(topCollision == 0){
      d = 0;
    }else if(bottomCollision == 0){
      d = 1;
    }
  }
  if(bottomCollision == 1 && mySnake[0].y - 1 === mySnake[1].y){

    if(leftCollision == 0){
      d = 2;
    }else if(rightCollision == 0){
      d = 3;
    }
  }
  if(topCollision == 1 && mySnake[0].y + 1 == mySnake[1].y){

    if(leftCollision == 0){
      d = 2;
    }else if(rightCollision == 0){
      d = 3;
    }
  }


console.log(arrCollision)
console.log(d)
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

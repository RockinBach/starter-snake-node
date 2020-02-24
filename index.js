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

//
//
// --- mySnake LOGIC GOES BELOW THIS LINE ---
//
//

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

//
// Handle POST request to '/move'
//

app.post('/move', (request, response) => {
  var myName = "rockinbach / RockinBach";
  var arrMove = ["up", "down", "left", "right"];
  var mySnake = [];
  var foods = [];
  var prevDirection = 0;
  var gameHeight = request.body.board.height;
  var gameWidth = request.body.board.width;
  var d = 0;

  for(let i = 0; i < request.body.you.body.length; i++){
    const bodyPart = {x: request.body.you.body[i].x, y: request.body.you.body[i].y};
    mySnake.push(bodyPart);
  }
  for(let j = 0; j < request.body.board.food.length; j++){
    const foodPart = {x: request.body.board.food[j].x, y: request.body.board.food[j].y};
    foods.push(foodPart);
    //foods[j].z = Math.sqrt(Math.pow(food[j].x, 2) + Math.pow(food[j].y, 2));
  }

  //Check previous move
  if(mySnake[0].x - 1 == mySnake[1].x){
    prevDirection = 3; //right
  }else if(mySnake[0].x + 1 == mySnake[1].x){
    prevDirection = 2; //left
  }else if(mySnake[0].y - 1 == mySnake[1].y){
    prevDirection = 1; //down
  }else if(mySnake[0].y + 1 == mySnake[1].y){
    prevDirection = 0; //up
  }

  // NEW SECTION THAT USES BREADTH FIRST SEARCH
  //
  // map all data into array
  // create an array with enemy snake info
  var enemySnakes = [];
  for(let i = 0; i < request.body.board.snakes.length; i++){
    if(request.body.board.snakes[i].name == myName){
      console.log("its my snake");
    }else{
      for(let j = 0; j < request.body.board.snakes[i].body.length; j++){
        const enemyPart = {x: request.body.board.snakes[i].body[j].x, y: request.body.board.snakes[i].body[j].y};
        enemySnakes.push(enemyPart);
      }
    }  
  }

  // creat a 2d array the height and width of the board rows and columns
  var gameMap = [];
  for(let i = 0; i < gameHeight; i++){
    gameMap[i] = [];
    for(let j = 0; j < gameWidth; j++){
      gameMap[i][j] = {x: i, y: j, state: 'e'};
    }
  }

  // put mySnake into the gameMap
  for(let i = 0; i < mySnake.length; i++){
    if(i == 0){
      gameMap[mySnake[i].x][mySnake[i].y].state = 's'; //mysnake head = s for start
    }else{
      gameMap[mySnake[i].x][mySnake[i].y].state = 'b'; //mysnake body = b for body
    }
  }
  // put food locations into the gameMap
  for(let i = 0; i < foods.length; i++){
    gameMap[foods[0].x][foods[0].y].state = 'f'; //food locations = f for food
  }
  // put enemy snake locations into the gameMap
  for(let i = 0; i < enemySnakes.length; i++){
    gameMap[enemySnakes[i].x][enemySnakes[i].y].state = 'v'; //enemy snake locations = v for villain 
  }
  console.log(gameMap);

  //Maze Solving Function

  function solveMaze(){
    var Xqueue = [mySnake[0].x];
    var Yqueue = [mySnake[0].y];

    var pathFound = false;

    var xLoc;
    var yLoc;

    while(Xqueue.length > 0 && !pathFound) {
      xLoc = Xqueue.shift();
      yLoc = Yqueue.shift();

      //check if next space is solution
      if(xLoc > 0) {
        if(gameMap[xLoc - 1][yLoc].state == 'f'){
          pathFound = true;
        }
      }
      if(xLoc < gameWidth - 1){
        if(gameMap[xLoc + 1][yLoc].state == 'f'){
          pathFound = true;
        }
      }
      if(yLoc > 0) {
        if(gameMap[xLoc][yLoc - 1].state == 'f'){
          pathFound = true;
        }
      }
      if(yLoc < gameHeight - 1){
        if(gameMap[xLoc][yLoc + 1].state == 'f'){
          pathFound = true;
        }
      }
      //check if next space is empty
      if(xLoc > 0) {
        if(gameMap[xLoc - 1][yLoc].state == 'e'){
          Xqueue.push(xLoc-1);
          Yqueue.push(yLoc);
          gameMap[xLoc - 1][yLoc].state = gameMap[xLoc][yLoc].state + 'l';

        }
      }
      if(xLoc < gameWidth - 1){
        if(gameMap[xLoc + 1][yLoc].state == 'e'){
          Xqueue.push(xLoc+1);
          Yqueue.push(yLoc);
          gameMap[xLoc + 1][yLoc].state = gameMap[xLoc][yLoc].state + 'r';
        }
      }
      if(yLoc > 0) {
        if(gameMap[xLoc][yLoc - 1].state == 'e'){
          Xqueue.push(xLoc);
          Yqueue.push(yLoc-1);
          gameMap[xLoc][yLoc - 1].state = gameMap[xLoc][yLoc].state + 'u';
        }
      }
      if(yLoc < gameHeight - 1){
        if(gameMap[xLoc][yLoc + 1].state == 'e'){
          Xqueue.push(xLoc);
          Yqueue.push(yLoc+1);
          gameMap[xLoc][yLoc + 1].state = gameMap[xLoc][yLoc].state + 'd';
        }
      }
    }
    if (!pathFound){
      console.log('No path found');
    }else{
      console.log('solved');
      var path = gameMap[xLoc][yLoc].state;
      var pathLength = path.length;
      var currX = 0;
      var currY = 0;
      var nextMove = 0
      var totalPath = ['start'];
      for(var i = 0; i < pathLength-1; i++){
         if(path.charAt(i) == 'q'){
          if(path.charAt(i+1) == 'u'){
            nextMove = 0;
            totalPath.push(i) = 'u';
          }
          if(path.charAt(i+1) == 'd'){
            nextMove = 1;
            totalPath.push(i) = 'u';
          }
          if(path.charAt(i+1) == 'r'){
            nextMove = 3;
            totalPath.push(i) = 'u';
          }
          if(path.charAt(i+1) == 'l'){
            nextMove = 2;
            totalPath.push(i) = 'u';
          }
          console.log(totalPath);
          return totalPath;
        } else {
          if(path.charAt(i+1) == 'u'){
            currY -= 1;
            totalPath.push(i) = 'u';
          }
          if(path.charAt(i+1) == 'd'){
            currY += 1;
            totalPath.push(i) = 'd';
          }
          if(path.charAt(i+1) == 'r'){
            currX -= 1;
            totalPath.push(i) = 'r';
          }
          if(path.charAt(i+1) == 'l'){
            currX += 1;
            totalPath.push(i) = 'l';
          }
          gameMape[currX][currY].state = 'x'
          console.log(totalPath);
        } 
      }
    }
    return totalPath;
  }
  var paths;
  paths = solveMaze();
  console.log(paths);
  //console.log(gameMap);
  console.log("previous Direction " + prevDirection + " move " + d);
  console.log(request.body.board.turn);
  // Response data
  var turn = arrMove[d];
  const data = {
   move: turn,
   }

  return response.json(data)
})
  /*To commit changes push following
      git add .
      git commit -m ""
      git push
      git push heroku master
  */

//
//
//
//
//

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

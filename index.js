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
  var Collision = [0, 0, 0, 0];
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
    prevDirection = 3;
  }else if(mySnake[0].x + 1 == mySnake[1].x){
    prevDirection = 2;
  }else if(mySnake[0].y - 1 == mySnake[1].y){
    prevDirection = 1;
  }else if(mySnake[0].y + 1 == mySnake[1].y){
    prevDirection = 0;
  }

  //find closest food     
  for(let i = 0; i < foods.length; i++){
    if( foods[0].x - mySnake[0].x < 0){
      //check if going right to avoid collision then go left
      if(prevDirection != 3){
        d = 2;
      }else{
        d = 0;
      }
    //if food is above or below the snake
    } else if(foods[0].x - mySnake[0].x == 0){
      //food is above snake
      if (foods[0].y - mySnake[0].y < 0){
        if(prevDirection != 1){
          d = 0;
        }else{
          d = 3;
        }
      //food is below snake
      } else {
        if(prevDirection != 0){
          d = 1;
        }else{
          d = 3;
        }
      }
    }else{
      //food is right of snake
      if(prevDirection != 2){
        d = 3
      }else{
        d = 0;
      }
    }
  }

  //check for collisions with itself
  for(let i = 4; i < mySnake.length; i++){
    if(mySnake[i].x == mySnake[0].x + 1 && mySnake[i].y == mySnake[0].y){
      Collision[3] = 1;
    }

    if(mySnake[i].x == mySnake[0].x - 1 && mySnake[i].y == mySnake[0].y){
      Collision[2] = 1;
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
  if(mySnake[0].y == gameHeight - 1){
    Collision[1] = 1;
  }
  //left wall
  if(mySnake[0].x == 0){
    Collision[2] = 1;
  }
  //right wall
  if(mySnake[0].x == gameWidth - 1){
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
    } else if(prevDirection == 1 && Collision[1] == 1){
      if(Collision[2] == 0){
        d = 2;
      } else {
        d = 3;
      }
    } else if(prevDirection == 2 && Collision[2] == 1){
      if(Collision[0] == 0){
        d = 0;
      } else {
        d = 1;
      }
    } else if(prevDirection == 3 && Collision[3] == 1){
      if(Collision[0] == 0){
        d = 0;
      } else {
        d = 1;
      }
    }else{
    //d = prevDirection;
    }
  } else {
    //d = prevDirection;
  }

  console.log("Collisions " + Collision);
  console.log("previous Direction " + prevDirection + " move " + d);

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
      gameMap[i][j] = 0;
    }
  }

  // put mySnake into the gameMap
  for(let i = 0; i < mySnake.length; i++){
    if(i == 0){
      gameMap[mySnake[i].x][mySnake[i].y] = 1; //mysnake head = 1
    }else{
      gameMap[mySnake[i].x][mySnake[i].y] = 4; //mysnake body = 4
    }
  }
  // put food locations into the gameMap
  for(let i = 0; i < foods.length; i++){
    gameMap[foods[i].x][foods[i].y] = 3; //food locations = 3 
  }
  // put enemy snake locations into the gameMap
  for(let i = 0; i < enemySnakes.length; i++){
    gameMap[enemySnakes[i].x][enemySnakes[i].y] = 4; //enemy snake locations = 4 
  }

  //console.log(gameMap);

  //This is an attempt at my maze solver
  //
  //
  // Start location will be in the following format:
    // [distanceFromTop, distanceFromLeft]
  var findShortestPath = function(gameMap) {
    var distanceFromTop = mySnake[0].y;
    var distanceFromLeft = mySnake[0].x;
    
    // Each "location" will store its coordinates
    // and the shortest path required to arrive there
    var location = {
      distanceFromTop: distanceFromTop,
      distanceFromLeft: distanceFromLeft,
      path: [],
      status: 1
    };

    // Initialize the queue with the start location already inside
    var queue = [location];

    // Loop through the gameMap searching for the goal
    while (queue.length > 0) {
      // Take the first location off the queue
      var currentLocation = queue.shift();

      // Explore up
      var newLocation = exploreInDirection(currentLocation, 'up', gameMap);
      if (newLocation.status === 3) {
        return newLocation.path;
      } else if (newLocation.status === 'Valid') {
        queue.push(newLocation);
      }

      // Explore right
      var newLocation = exploreInDirection(currentLocation, 'right', gameMap);
      if (newLocation.status === 3) {
        return newLocation.path;
      } else if (newLocation.status === 'Valid') {
        queue.push(newLocation);
      }

      // Explore down
      var newLocation = exploreInDirection(currentLocation, 'down', gameMap);
      if (newLocation.status === 3) {
        return newLocation.path;
      } else if (newLocation.status === 'Valid') {
        queue.push(newLocation);
      }

      // Explore left
      var newLocation = exploreInDirection(currentLocation, 'left', gameMap);
      if (newLocation.status === 3) {
        return newLocation.path;
      } else if (newLocation.status === 'Valid') {
        queue.push(newLocation);
      }
    }

    // No valid path found
    return false;

  };

  // This function will check a location's status
  // (a location is "valid" if it is on the gameMap, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  // Returns "Valid", "Invalid", "Blocked", or "Goal"
  var locationStatus = function(location, gameMap) {
    var gridSize = gameMap.length;
    var dft = location.distanceFromTop;
    var dfl = location.distanceFromLeft;

    if (location.distanceFromLeft < 0 ||
        location.distanceFromLeft >= gridSize ||
        location.distanceFromTop < 0 ||
        location.distanceFromTop >= gridSize) {

      // location is not on the gameMap--return false
      return 'Invalid';
    } else if (gameMap[dft][dfl] === 3) {
      return 3;
    } else if (gameMap[dft][dfl] !== 0) {
      // location is either an obstacle or has been visited
      return 'Blocked';
    } else {
      return 'Valid';
    }
  };


  // Explores the gameMap from the given location in the given
  // direction
  var exploreInDirection = function(currentLocation, direction, gameMap) {
    var newPath = currentLocation.path.slice();
    newPath.push(direction);

    var dft = currentLocation.distanceFromTop;
    var dfl = currentLocation.distanceFromLeft;

    if (direction === 'up') {
      dft -= 1;
    } else if (direction === 'right') {
      dfl += 1;
    } else if (direction === 'down') {
      dft += 1;
    } else if (direction === 'left') {
      dfl -= 1;
    }

    var newLocation = {
      distanceFromTop: dft,
      distanceFromLeft: dfl,
      path: newPath,
      status: 'Unknown'
    };
    newLocation.status = locationStatus(newLocation, gameMap);

    // If this new location is valid, mark it as 'Visited'
    if (newLocation.status === 'Valid') {
      gameMap[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
    }

    return newLocation;
  };


  // OK. We have the functions we need--let's run them to get our shortest path!
  console.log(findShortestPath(gameMap));
  //
  //
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

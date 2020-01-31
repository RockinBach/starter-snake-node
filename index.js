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

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  //To commit changes push following
  //git add .
  //git commit -m ""
  //git push
  //git push heroku master

  // Response data
  const data = {
    color: '#1E90FF',
    headType: 'smile',
    tailType: 'round-bum'
  }

  return response.json(data)
})

// Handle POST request to '/move'

app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  var i = 0;
  var move = [
    'up', 'down', 'left', 'right'
  ];
  if(request.body[0].y === request.board.height){
    i = 3;
  } else {
    i = 2;
  }
  // Response data
  
  const data = {
   movement: move[i]
   }

  return response.json(data)
})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
  return response.json({});
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})

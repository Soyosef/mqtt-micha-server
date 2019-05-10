#!/usr/bin/env node

/**
 * Module dependencies.
 */
//const debug = require('debug')('nombredeapp:server');


const http = require('http');
const socketIO = require('socket.io')
var mqtt = require('mqtt')
var express = require('express')
var app = express()

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

// Socket.io
const io = socketIO(server);

const topics = ['ON_OFF', 'SLIDER']
io.on('connection', (socket) => {
    console.log('connected!');
    
    const client  = mqtt.connect('mqtt://broker.mqttdashboard.com')
    
    client.on('connect',  () => {

        topics.forEach((topic) => client.subscribe(topic, {rap: true, rh: true}))
        
        client.on('message', (topic, mensaje) => {
            // message is Buffer
            socket.emit(topic, mensaje.toString()) 
            console.log(topic, mensaje.toString());
            
            //client.end()
        })
    })


    socket.on('UI_Change', (data) => {

      const { topic, mensaje } = data;

      client.publish(String(topic), String(mensaje))

    })
    // disconnect is fired when a client leaves the server
    /* socket.on('disconnect', () => {
    console.log('user disconnected')
    }) */
}) 


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(5000);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

// peer.js
//
// This contains the guts of the peerjs server
//

import { Meteor } from 'meteor/meteor'
import express from 'express'
const debug = require('debug')('video:peerjs')

let clients = {}
let ips = {}
let outstanding = {}
let options = {
  key: 'peerjs',
  ip_limit: 10,
  concurrent_limit: 100,
}

const checkKey = function(key, ip, cb) {
  if (key === options.key) {
    if (!clients[key]) {
      clients[key] = {}
    }
    if (!outstanding[key]) {
      outstanding[key] = {}
    }
    if (!ips[ip]) {
      ips[ip] = 0
    }
    // Check concurrent limit
    if (Object.keys(clients[key]).length >= options.concurrent_limit) {
      cb('Server has reached its concurrent user limit')
      return
    }
    if (ips[ip] >= options.ip_limit) {
      cb(ip + ' has reached its concurrent user limit')
      return
    }
    cb(null)
  } else {
    cb('Invalid key provided')
  }
}

const randomId = function () {
  return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
}

const startStreaming = function() {
  debug("Start streaming")
}
const generateClientId = function(key) {
  let clientId = randomId();
  if (clients[key]) {
    return clientId;
  } else {
    clients[key] = {}
  }
  while (!!clients[key][clientId]) {
    clientId = randomId();
  }
  return clientId;
};

Meteor.startup(() => {

	debug("Starting up peerjs server")
  const peerServer = express();


  peerServer.get('/peerjs', (req, res) => {
  	debug("API Called")
  	const ip = req.connection.remoteAddress
    res.status(200).json({ message: 'Hello World!!!', ip})
  })

  // Retrieve guaranteed random ID.
  peerServer.get('/:key/id', function(req, res, next) {
    debug("GET /:key/id",req.params)
    res.contentType = 'text/html';
    res.send(generateClientId(req.params.key));
  });

  // Server sets up HTTP streaming when you get post an ID.
  peerServer.post('/:key/:id/:token/id', function(req, res, next) {
    debug("POST /:key/:id/:token/id",req.params)
    var id = req.params.id;
    var token = req.params.token;
    var key = req.params.key;
    var ip = req.connection.remoteAddress;

    if (!clients[key] || !clients[key][id]) {
      checkKey(key, ip, function(err) {
        if (!err && !clients[key][id]) {
          clients[key][id] = { token: token, ip: ip };
          ips[ip]++;
          startStreaming(res, key, id, token, true);
        } else {
          res.send(JSON.stringify({ type: 'HTTP-ERROR' }));
        }
      });
    } else {
      startStreaming(res, key, id, token);
    }
  });


  WebApp.connectHandlers.use(peerServer)
})

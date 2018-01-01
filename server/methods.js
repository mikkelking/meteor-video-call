// methods.js

import { Meteor } from 'meteor/meteor';
//
// Importing the data api's makes sure collections are set up properly.
//
const debug = require('debug')('video:methods')

const _ = require('lodash')

const myThrow = function(msg) {
  console.error("Throwing error: "+msg)
  throw new Meteor.Error(msg)
}

Meteor.methods({



});

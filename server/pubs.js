import { Meteor } from 'meteor/meteor';
// import { Students,Classes } from '/imports/api'


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Presences collection tells us who is online at any time
//
  Meteor.publish('presences', function() {
    return Presences.find();
  });
  Presences.allow({
    insert() { return true; },
    update() { return true; },
    remove() { return false; }
  });


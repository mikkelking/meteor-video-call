
Meteor.publish('machines', function() {
  return Machines.find({});
});


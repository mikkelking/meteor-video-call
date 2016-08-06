
Meteor.publish('presences', function() {
  return Presences.find({}, { userId: true });
});

Meteor.publish("users", function () {
  return Meteor.users.find({}, {fields: {"profile.peerId": true, "emails.address": true} });
});

Presences = new Mongo.Collection('presences');
// For backwards compatibilty
Meteor.presences = Presences;

presence_config = {
  debug: false,
// Client config
  tick_interval: 10,    // Client tick interval in seconds
  reconnect_count: 7,   // Nudge Meteor after this many fails
// Server config
  check_interval: 20,   // Seconds between checking for expiry
  expire_after: 3,       // Number of missed intervals at which presence is expired
  user_fields: [],
  profile_fields: ["nickname","elder"]
};

Meteor.methods({
  updatePresence: function(state) {
    check(state, Match.Any);

    var connectionId = this.isSimulation
      ? Meteor.connection._lastSessionId
      : this.connection.id;

    // Should never happen
    if (! connectionId)
      return;

    // var update = {nickname: "", elder: "", userId: ""};
    var update = { userId: ""};
    update.state = state;
    // console.log("updating presence");
    var u = Meteor.user();
    // console.log(u);
    if (typeof Meteor.userId !== 'undefined' && u) {
      update.userId = u._id;
      _.each(presence_config.user_fields,function(f) {
        update[f] = u[f];
      });
      _.each(presence_config.profile_fields,function(f) {
        if (u.profile && u.profile[f])
          update[f] = u.profile[f];
      });
    }

    Presences.update(connectionId, {$set: update});
  }
});

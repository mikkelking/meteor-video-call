var connections = {};

var expire = function(id) {
  if (presence_config.debug) {
    console.log(connections);
    console.log("Expiring presence "+id);
  }
  Presences.remove(id);
  delete connections[id];
};

var tick = function(id) {
  // if (presence_config.debug)
  //   console.log("Presence tick "+id);
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  Presences.remove({});
});

Meteor.onConnection(function(connection) {
  if (presence_config.debug)
    console.log('Added presence: ' + connection.id);
  Presences.insert({ _id: connection.id });

  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function() {
    if (presence_config.debug)
      console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  presenceTick: function() {
    check(arguments, [Match.Any]);
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function() {
  if (presence_config.debug)
    console.log("Checking connections ("+_.keys(connections).length+")");
  _.each(connections, function(connection, id) {
    if (connection.lastSeen < (Date.now() - presence_config.expire_after*presence_config.check_interval*1000))
      expire(id);
  });
}, presence_config.check_interval*1000);

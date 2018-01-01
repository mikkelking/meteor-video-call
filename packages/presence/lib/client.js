
Presence = {};
Presence.state = function() {
  return 'online';
};

var reconnect_attempt;

// For backwards compatibilty
Meteor.Presence = Presence;

Meteor.startup(function() {
  Tracker.autorun(function() {
    // This also runs on sign-in/sign-out
    if (Meteor.status().status === 'connected')
      Meteor.call('updatePresence', Presence.state());
  });

  Meteor.setInterval(function() {
  	var srec = Meteor.status()
    if (srec.status === 'connected')
	    Meteor.call('presenceTick');
    else {
    	if (presence_config.debug){
	    	console.error("Connection to Meteor server is "+srec.status+", retries="+srec.retryCount);
	    	if (srec.status === 'failed')
	    		console.log("Reason: "+srec.reason)
    	}
    	if (srec.retryCount > presence_config.reconnect_count && !reconnect_attempt) {
	    	Meteor.reconnect();					// Give Meteor a nudge
	    	reconnect_attempt = true;		// Only do it once
    	}
    }
  }, presence_config.tick_interval*1000);
});


// get audio/video
var enableVideo = function () {
  navigator.getUserMedia({audio:true, video: true}, function (stream) {
    console.log("Connecting media to stream");
    //display video
    var video = document.getElementById("myVideo");
    video.src = URL.createObjectURL(stream);
    window.localStream = stream;
  }, function (error) { console.log(error); }
  );
}

  Template.hello.events({
    "click #makeCall": function () {
      var user = this;
      enableVideo();
      var outgoingCall = peer.call(user.profile.peerId, window.localStream);
      window.currentCall = outgoingCall;
      outgoingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        var video = document.getElementById("theirVideo")
        video.src = URL.createObjectURL(remoteStream);
      });
    },
    "click #endCall": function () {
      window.currentCall.close();
    }
  });

  Template.hello.helpers({
    users: function () {
      // exclude the currentUser
      var userIds = Presences.find().map(function(presence) {return presence.userId;});
      return Meteor.users.find({_id: {$in: userIds, $ne: Meteor.userId()}});
    }
  });

  Template.hello.onCreated(function () {
    Meteor.subscribe("presences");
    Meteor.subscribe("users");

    console.log("Setting up own presence");
    window.peer = new Peer({
      key: '3hlis32874fe0zfr',  // change this key
      debug: 3,
      config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
      ]}
    });

    // This event: remote peer receives a call
    peer.on('open', function () {
      console.log("Connected to PeerJS Server");
      $('#myPeerId').text(peer.id);
      // update the current user's profile
      Meteor.users.update({_id: Meteor.userId()}, {
        $set: {
          profile: { peerId: peer.id}
        }
      });
    });

    peer.on('connection', function () {
      console.log("Connection from remote");
    });

    peer.on('close', function () {
      console.log("close - peer destroyed");
    });

    peer.on('disconnected', function () {
      console.log("disconnected from remote");
    });

    peer.on('error', function (err) {
      console.log("Error from remote: "+err);
    });

    // This event: remote peer receives a call
    peer.on('call', function (incomingCall) {
      console.log("Making a call");
      window.currentCall = incomingCall;
      incomingCall.answer(window.localStream);
      incomingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        var video = document.getElementById("theirVideo")
        video.src = URL.createObjectURL(remoteStream);
      });
    });

    console.log("Setting up user media");

    navigator.getUserMedia = ( navigator.getUserMedia ||
                      navigator.webkitGetUserMedia ||
                      navigator.mozGetUserMedia ||
                      navigator.msGetUserMedia );


  });


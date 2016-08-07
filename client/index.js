import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Accounts } from 'meteor/accounts-base';

var app = angular.module("videoCall", 
  ["angular-meteor"
  ,"accounts.ui"
  ]);

app.controller('videoCtrl', ["$scope", "$location", "$rootScope" , "$timeout", "$reactive",
  function ($scope, $location, $rootScope, $timeout, $reactive) {

    $reactive(this).attach($scope);
    this.subscribe('users', () => []);
    this.subscribe('presences', () => []);
    $scope.userId = this.userId;
    $scope.Accounts = Accounts;
//    $scope.uid = Meteor.user();
    
    $scope.helpers({
      isLoggedIn: function() {
        return !!Meteor.userId();
      },
      uid: function(){
        return this.userId;
      },
      currentUser: function() {
        return Meteor.user();
      },
      presences: function () {
        return Presences.find();
      },
      users: function () {
        // exclude the currentUser
        var userIds = Presences.find().map(function(presence) {return presence.userId;});
        return Meteor.users.find({_id: {$in: userIds, $ne: Meteor.userId()}});
      }
    });


    // get audio/video
    var enableVideo = function (cb,id) {
      navigator.getUserMedia({audio:true, video: true}, function (stream) {
        console.log("Connecting media to stream");
        //display video
        var video = document.getElementById("myVideo");
        video.src = URL.createObjectURL(stream);
        window.localStream = stream;
        cb(id); 
      }, function (error) { console.log(error); }
      );
    }

// This method cleans out the video divs by removing the source and then doing a load()
// Without the load(), the streaming would keep happening
// TODO: Have an image come up when the video is inactive
    var cleanVid = function(id){
      var vid = document.getElementById(id);
      vid.removeAttribute("src");
      vid.load();
    }

    var connectCall = function(id){
      var outgoingCall = peer.call(id, window.localStream);
      window.currentCall = outgoingCall;
      outgoingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        var video = document.getElementById("theirVideo")
        video.src = URL.createObjectURL(remoteStream);
      });
    };

    $scope.makeCall = function (id,who) {
      console.log("Starting call to "+who+" ("+id+")");
//      var user = Meteor.users.find({"profile.peerid": id});
      enableVideo(connectCall,id);
    };

    $scope.endCall = function () {
      console.log("Ending call");
      cleanVid("myVideo");
      cleanVid("theirVideo");
      if (window.currentCall)
        window.currentCall.close();
      if (window.localStream) {
        var tracks = window.localStream.getTracks();
        _.each(tracks,function(track){
          window.localStream.removeTrack(track);
        });
        delete window.localStream;
      }
    };

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

  }
]);



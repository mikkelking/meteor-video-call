// import { Meteor } from 'meteor/meteor'
// import { Accounts, STATES } from 'meteor/jlouzado:accounts-ui'

import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { render } from 'react-dom'
import { Link, Redirect } from 'react-router-dom'

const debug = require('debug')('video:main')

export default class VideoCall extends Component {
  constructor(props) {
    super(props)
    this.state = {
      peerId: null,
      connected: false,
    }

    this.openPeerJS = this.openPeerJS.bind(this)
    this.peerOpen = this.peerOpen.bind(this)
    this.incomingCall = this.incomingCall.bind(this)
    this.incomingStream = this.incomingStream.bind(this)
  }

  currentUser = {
    profile: {
      peerId: 'Not Connected'
    }
  }

  peer = null

  u = {

  }

  AvailableUsers (props) {
    return props.presences.map(p => {
      return (
        <p key={p.peerId}>
          <a href="#" onClick={() => this.makeCall(p.email)} >
            Call {p.email}</a> ({p.peerId})
        </p>
      )
    })
  }


  // function () {

  //   this.subscribe('users', () => []);
  //   this.subscribe('presences', () => []);
    
  //   this.helpers({
  //     isLoggedIn: function() {
  //       return !!Meteor.userId();
  //     },
  //     currentUser: function() {
  //       return Meteor.user();
  //     },
  //     presences: function () {
  //       return Presences.find();
  //     },
  //     users: function () {
  //       // exclude the currentUser
  //       var userIds = Presences.find().map(function(presence) {return presence.userId;});
  //       return Meteor.users.find({_id: {$in: userIds,  $ne: Meteor.userId()}});
  //     }
  //   });


    // get audio/video
    enableMyVideo (cb,id) {
		  debug("Getting user media");
      navigator.getUserMedia({audio:true, video: true}, function (stream) {
        debug("Connecting media to stream");
        //display video
        document.getElementById("myVideo").src = URL.createObjectURL(stream);
        window.localStream = stream;
    		if (id && cb) {	// Do we need to do a callback?
    			cb(id); 
    		}
      }, function (error) { debug(error); }
      );
    }

// This method cleans out the video divs by removing the source and then doing a load()
// Without the load(), the streaming would keep happening
// TODO: Have an image come up when the video is inactive
    cleanVid (id){
      const vid = document.getElementById(id);
      vid.removeAttribute("src");
      vid.load();
    }

    connectCall (id){
      const outgoingCall = this.peer.call(id, window.localStream);
      window.currentCall = outgoingCall;
      outgoingCall.on('stream', function (remoteStream) {
        window.remoteStream = remoteStream;
        document.getElementById("theirVideo").src = URL.createObjectURL(remoteStream);
      });
    };

    makeCall (id,who) {
      debug("Starting call to "+who+" ("+id+")");
      enableMyVideo(connectCall,id);
    };

    endCall () {
      debug("Ending call");
      cleanVid("myVideo");
      cleanVid("theirVideo");
      if (window.currentCall)
        window.currentCall.close();
      if (window.localStream) {
        const tracks = window.localStream.getTracks();
        _.each(tracks,function(track){
          window.localStream.removeTrack(track);
        });
        delete window.localStream;
      }
    };

    peerOpen() {
      debug("Connected to PeerJS Server, my id is "+this.peer.id);
      // $('#myPeerId').text(this.peer.id);
      this.setState({peerId: this.peer.id})
      // update the current user's profile
      Meteor.users.update({_id: Meteor.userId()}, {
        $set: {
          profile: { peerId: this.peer.id}
        }
      });
      this.peer.on('error', function (err) {
        console.error("Error from remote: "+err);
      });      
    }

    incomingCall(data) {
      debug("Receiving a call");
      window.currentCall = data;
      enableMyVideo();
      data.answer(window.localStream);
      data.on('stream', (remoteStream) => this.incomingStream(remoteStream));
    }

    incomingStream(data) {
      window.remoteStream = data;
      document.getElementById("theirVideo").src = URL.createObjectURL(data);
    }

    openPeerJS () {
      debug(this.peer)
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      debug("Setting up own presence");
      let options = {
        key: 'peerjs',  // change this key
        debug: 3,
        config: {'iceServers': [
          { url: 'stun:stun.l.google.com:19302' },
          { url: 'stun:stun1.l.google.com:19302' },
        ]},
      }
      options.host = 'localhost'
      options.port = 3040
      this.peer = new Peer(options)

      if (!this.peer) {
        this.error = "Failed to set up peerJS";
      } else {
        // This event: peer server connected
        this.peer.on('open', this.peerOpen);

        this.peer.on('connection', function () {
          debug("Connection from remote");
        });

        this.peer.on('close', function () {
          debug("close - peer destroyed");
        });

        this.peer.on('disconnected', function () {
          debug("disconnected from remote");
        });

        this.peer.on('error', function (err) {
          debug("Error from remote: "+err);
        });

        // This event: remote peer receives a call
        this.peer.on('call', (data) => this.incomingCall(data));
      }
    };

    // openPeerJS()

    // debug("Setting up user media");

    // navigator.getUserMedia = ( navigator.getUserMedia ||
    //                   navigator.webkitGetUserMedia ||
    //                   navigator.mozGetUserMedia ||
    //                   navigator.msGetUserMedia );


  render() {
    const presences = [{email:"mikkel@me.com", peerId:'xxx'}]
    return (
      <div> 
        {Meteor.userId() && ( <div> 
          <h2>Video Chat, 
          {this.state.peerId && (" my peer id is "+this.state.peerId)}
          {!this.state.peerId && (" not connected ")}
          </h2>
            <div style={{color: "red"}}>{this.error}</div>
            <button onClick={this.openPeerJS}>Re-open PeerJS</button> {this.peer && this.peer.id}
            <div >
              <video id="theirVideo" className="theirVideo video-js vjs-default-skin" controls autoPlay poster="/images/amba.png"></video>
              <video id="myVideo" muted="true" className="myVideo" 
                poster="/images/mugshot.jpg" autoPlay ></video>
          </div>

          <div>
            <br/> 
            {this.state.peerId && this.AvailableUsers({presences})}
            {this.state.connected && (<p><a href="#" onClick={this.endCall}>End Call</a></p>)}
          </div>
        </div>
        )}

        {(!Meteor.userId()) && ( 
          <div> 
            <p>Please sign in to make a video call</p>
          </div>
        )}
      </div>
    )
  }

}




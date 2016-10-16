# A Basic WebRTC tutorial using Meteor.js and PeerJS

See the blog post:

http://www.mhurwi.com/a-basic-webrtc-tutorial-using-meteor-peerjs/.

The original repo is here: https://github.com/mhurwi/webrtc-meteor-peerjs

This one is using AngularJS 1.5 for the templating, but the core code is the same.

##Getting started

  1. Install Meteor https://www.meteor.com/install
  1. Clone this repo https://github.com/mikkelking/meteor-video-call
  
```
cd meteor-video-call
npm install
meteor
```

  1. Run up a chrome browser and goto http://localhost:3000/
  1. Create a user (any email and password will do)
  1. Open an anonymous browser window
  1. goto http://localhost:3000/
  1. Create a different user

At this stage you need to refresh both pages to update the id's, and you will get a page like this:

<img src="https://github.com/mikkelking/meteor-video-call/blob/develop/public/images/logged-in.png">

Click the call xxx to start a call

<img src="https://github.com/mikkelking/meteor-video-call/blob/develop/public/images/in-call.png">




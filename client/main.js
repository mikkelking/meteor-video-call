import { Meteor } from 'meteor/meteor';
import { LoginButtons } from 'meteor/okgrow:accounts-ui-react';
const debug = require('debug')('video:main')
 
// app.js
import React, { Component } from 'react';
import { render } from 'react-dom';
// Import routing components
import { BrowserRouter, HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';

import VideoCall from '/imports/ui/video-call'

class Home extends React.Component  {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: !!Meteor.userId()
    };
    this.onSignedIn = this.onSignedIn.bind(this);
    this.onSignedOut = this.onSignedOut.bind(this);
  }

  onSignedIn(event) {
    console.log('user signed in ',this.state);
    this.setState({loggedIn: true});
  }

  onSignedOut(event) {
    console.log('user signed out ',this.state);
    this.setState({loggedIn: false});
  }

  render(){
    // console.log("render",Meteor.userId(),Meteor.user())
    if (Meteor.userId()) {
      return(
        <div>
          <LoginButtons/>
          <VideoCall />
        </div>
      );
    } else {
      return(
        <div>
          <h1>Video Login</h1>
          <LoginButtons />
        </div>
      );
    }
  }
}


Meteor.startup(() => {

	render(
    <Home />,
	    document.getElementById('container')
	);
});

const NoMatch = ({ location }) => (
  <div>
    <h1>Sorry, I could not find anything at {location.pathname}</h1>
  </div>
)
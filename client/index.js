// index.js

import { Meteor } from 'meteor/meteor';
import { Accounts, STATES } from 'meteor/jlouzado:accounts-ui';
const debug = require('debug')('tm:video-main')
 
// app.js
import React, { Component } from 'react';
import { render } from 'react-dom';
// Import routing components
import { BrowserRouter, HashRouter, Route, Switch, Link, Redirect } from 'react-router-dom';

import VideoCall from '/imports/ui/components/home'

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
    if (this.state.loggedIn && Meteor.user()) {
      const slug = Meteor.user().profile.slug || Meteor.user().slug || Meteor.user().username
      debug("slug="+slug,Meteor.user())
      if (slug === '*-*-*')
        return <Redirect push to='/schools' />
      else
        // return <Redirect push to='/steps' />
        // console.log(`CLASS SLUG ${Meteor.user().profile.slug}`)
        return <Redirect push to={`/steps/${slug}`} />
    } else {
      if (Meteor.userId()) {
        return(
          <div>
            <h3>
              <Link to="/">Start</Link>
            </h3> 
            <Accounts.ui.LoginForm 
              onSignedInHook={ this.onSignedIn }
              onSignedOutHook={ this.onSignedOut }
              />
            </div>
        );
      } else {
        return(
          <div>
            <h1>Trust Mapping Login</h1>
            <h2>Your teacher will provide you with a username and password for your class, 
            which you need to get started. </h2>
            <Accounts.ui.LoginForm 
              onSignedInHook={ this.onSignedIn }
              onSignedOutHook={ this.onSignedOut }
              />
          </div>
        );
      }
    }
  }
}


Meteor.startup(() => {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
    loginPath: '/',
    minimumPasswordLength: 3,
  });

  render(
  <BrowserRouter>
    <Switch>
// Home page 
      <Route exact path="/" component={Home}/>



// 404 page
      <Route component={NoMatch}/>
    </Switch>
  </BrowserRouter>,
      document.getElementById('container')
  );
});

const NoMatch = ({ location }) => (
  <div>
    <h1>Sorry, I could not find anything at {location.pathname}</h1>
  </div>
)
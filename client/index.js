import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Accounts } from 'meteor/accounts-base';
import 'angular-sanitize';
import {startEditor} from '../imports/madebyevan';


angular.module("fsm", 
  ["angular-meteor"
  ,"accounts.ui"
  ,"ngSanitize"
  ]);

angular.module("fsm")
.controller('fsmCtrl', ["$scope", "$location", "$rootScope" , "$timeout", "$reactive", "$sce",
  function ($scope, $location, $rootScope, $timeout, $reactive, $sce) {

    $reactive(this).attach($scope);
    this.subscribe('users', () => []);
    this.subscribe('machines', () => []);
    $scope.userId = this.userId;
    $scope.Accounts = Accounts;
    
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
      machines: function () {
        return Machines.find();
      }
    });

    console.log("Starting up");
//    startEditor();

$scope.go = () => {
  startEditor();
  }
}
]);



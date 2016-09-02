// Collections that exist on the server database
Machines = new Mongo.Collection("machines");

Meteor.users.allow({
    remove: function () {
        return true; 
    }
});

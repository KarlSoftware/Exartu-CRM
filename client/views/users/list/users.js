UsersController = RouteController.extend({
    template: 'users',
    layoutTemplate: 'usersLayout',
  onAfterAction: function() {
    var title = 'Users',
      description = '';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

Template.users.helpers({
  users : function(){
    return Meteor.users.find();
  }
})
Template.users.events({
  "click .addUser": function () { Composer.showModal('addUser', 'addUserModal'); }
})
//Template.users.viewModel = function () {
//    var self = this;
//
//    self.removeGroup = function (role, user) {
//        {
//            var usr = ko.toJS(user);
//            Meteor.users.update({
//                _id: usr._id
//            }, {
//                $pull: {
//                    roles: role
//                }
//            });
//            Meteor.call('getHierUsers', function (err, result) {
//                self.users(result);
//            });
//        }
//    };
//    Meteor.call('getHierUsers', function (err, result) {
//        self.users(result);
//    });
//
//    return self;
//};
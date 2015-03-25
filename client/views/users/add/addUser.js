AddUserController = RouteController.extend({
  template: 'addUser',
  onBeforeAction: function () {
    if (Meteor.user()) {
      alert("You can't accept an invitation for a new user while logged in. Please log out and try again.");
      this.redirect('dashboard');
    }else{
      this.next();
    }
  },
  data: function() {
    email = this.params.query.email;
    token = this.params.query.token;
    hierName = this.params.query.from;
  }
});

var email, token, hierName;

Template.addUser.userInfo = function() {
  return {email: email};
};

Template.addUser.hierName = function() {
  return hierName;
};

AutoForm.hooks({
  'registerFromInvitation': {
    onSubmit: function (user) {
      var self = this;
      Meteor.call('registerAccountFromInvitation', token, user, function (err, result) {
        if (err) {
          console.log(err);
          error = err.reason;
        } else {
          self.resetForm();
          Meteor.loginWithPassword(user.email, user.password, function() {
            Router.go('dashboard');
          });
        }
        self.done();
      });

      return false;
    }
  }
});
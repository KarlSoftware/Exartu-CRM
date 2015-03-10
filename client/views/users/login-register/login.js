LoginController = RouteController.extend({
  template: 'login',
  //layout: '',
  onBeforeAction: function () {
    if (Meteor.user()) {
      this.redirect('dashboard');
    }else{
      this.next();
    }
  },
  data: function() {
    email = this.params.email;
    return this;
  },
  //actions: function () {
  //  this.render();
  //},
  onAfterAction: function() {
    var title = 'Login',
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

var email;

var notVerified = new ReactiveVar(false),
  errorMessage = new ReactiveVar('');

LoginSchema = new SimpleSchema({
  email:{
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email"
  },
  password:{
    type: String,
    label: "Password"
  }
});

AutoForm.hooks({
  loginForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      //isSubmitting.set(true);
      email = insertDoc.email.toLowerCase();
      Meteor.loginWithPassword({ email: email }, insertDoc.password, function (err, result) {
        if (err) {
          if(err.reason == 'Email not verified') {
            notVerified.set(true);
            errorMessage.set(err.reason);
          }
          else {
            notVerified.set(false);
            errorMessage.set('Email or password is wrong. Try again.');
          }
        }
        else {
          Meteor.call('userLoginActivity');
          notVerified.set(false);
          if (Router.current().route.getName() === 'login') {
            return Router.go('/');
          }
        }
        self.done();
      });
      return false;
    }
  }
});
Template.login.helpers({
  getNotVerified: function () {
    return notVerified.get();
  },
  errorMessage: function () {
    return errorMessage.get();
  },
  intialValues: function () {
    return {
      email: email
    }
  }
});

Template.login.events({
  'click #resendVerification': function () {
    Meteor.call('resendEmailVerification', email, function(err) {
      if (err) {
        errorMessage.set('Email or password is wrong. Try again.');
      } else
        errorMessage.set('');
      notVerified.set(false);
    });
  },
  'click #googleLogin': function () {
    if (Meteor.loginWithGoogle)
      Meteor.loginWithGoogle({}, function (err) {
        if(err)
          errorMessage.set(err.reason);
        else{
          Meteor.call('userLoginActivity');
          Router.go('/');
        }
      });
  },
  'click #recoverPassword': function () {
    Utils.showModal('recoverPassword');
  }
});
MailChimpManagementController = RouteController.extend({
  waitOn: function () {  },
  action: function () {
    if (this.ready())
      this.render('mailChimpManagement');
    else
      this.render('loading');
  }
});

MailChimpConfigurationSchema = new SimpleSchema({
  apiKey: {
    type: String,
    custom: function () {
      if (this.isSet && ! this.value.match(/-/)) {
        return 'notDash';
      }
    }
  }
});

MailChimpConfigurationSchema.messages({
  'invalid': 'Mailchimp server has rejected this api key',
  'notDash': 'the mailchimp\'s tokens usually have a \'-\' you must have copy it wrong'
});

var addDisabled = new ReactiveVar(false),
  lists = new ReactiveVar([]),
  selectedList = new ReactiveVar(null),
  members = new ReactiveVar([]),
  importFinished = new ReactiveVar(false),
  importResult = new ReactiveVar(null),
  loadingLists = new ReactiveVar(false),
  loadingMembers = new ReactiveVar(false),
  importDisabled = new ReactiveVar(false),
  hotListSelected = new ReactiveVar(null);

AutoForm.hooks({
  SetMailChimpConfiguration: {
    onSubmit: function (configuration) {
      var self = this;
      addDisabled.set(true);
      Meteor.call('saveMailChimpConfiguration',configuration.apiKey, function (err, result) {
        addDisabled.set(false);

        if (err){
          MailChimpConfigurationSchema.namedContext("SetMailChimpConfiguration").addInvalidKeys([{name: "apiKey", type: "invalid", message: err.error}]);
        }else{
          $.gritter.add({
            title:	'Mail chimp',
            text:	'The configuration was successfully saved',
            image: 	'/img/logo.png',
            sticky: false,
            time: 2000
          });
        }
        self.done(err);
      });

      return false;
    }
  }
});
var refreshMembers = function () {
  var selected = selectedList.get();
  if (!selected) return;
  loadingMembers.set(true);

  Meteor.call('getSubscribers', selected, function(err, result){
    if (err){
      console.log(err);
    }else {
      members.set(result);
      importDisabled.set(!result.length);
    }
    loadingMembers.set(false);
  })
};

var refreshLists = function () {
  var currentHier = Hierarchies.findOne(Meteor.user().currentHierId);
  var apiKey = currentHier && currentHier.mailchimp ? currentHier.mailchimp.apiKey : null;
  if (! apiKey){
    return;
  }
  loadingLists.set(true);
  Meteor.call('getMailChimpLists',function(err, result){
    if (err){
      console.log(err);
    }else{
      lists.set(result);
    }
    loadingLists.set(false);
  })
}

Template.mailChimpManagement.onCreated(function () {
  importFinished.set(false);
  hotListSelected.set(null);
  this.autorun(refreshLists);
  this.autorun(refreshMembers);

  this.subscribe('allHotLists');
});

Template.mailChimpManagement.helpers({
  configuration: function () {
    var currentHier = Hierarchies.findOne(Meteor.user().currentHierId);
    return currentHier && currentHier.mailchimp ? currentHier.mailchimp : {apiKey: ''};
  },
  addDisabled: function () {
    return addDisabled.get();
  },
  lists: function () {
    return lists.get();
  },
  loadingLists: function () {
    return loadingLists.get();
  },
  isEnabled: function () {
    var currentHier = Hierarchies.findOne(Meteor.user().currentHierId);
    return currentHier && currentHier.mailchimp
  },
  isSelected: function () {
    return this.id == selectedList.get();
  },
  selectedList: function () {
    return selectedList.get();
  },
  members: function () {
    return members.get();
  },
  loadingMembers: function () {
    return loadingMembers.get();
  },
  importDisabled: function () {
    return importDisabled.get();
  },
  importFinished: function () {
    return importFinished.get();
  },
  resultClass: function () {
    var result = importResult.get();

    if (! result) return '';

    if (_.contains(result.imported, this.id)){ return 'label-success';}
    if (_.contains(result.failed, this.id)){ return 'label-danger';}
    if (_.contains(result.existed, this.id)){ return 'label-warning';}
  },
  resultText: function () {
    var result = importResult.get();

    if (!result) return '';

    if (_.contains(result.imported, this.id)){ return 'imported';}
    if (_.contains(result.failed, this.id)){ return 'failed';}
    if (_.contains(result.existed, this.id)){ return 'already existed';}
  },
  hotListSelected: function () {
    return hotListSelected.get();
  },
  hotListChanged: function () {
    return function (value) {
      hotListSelected.set(value);
    }
  },
  getHotList: function () {

    return function (string) {
      var self = this,
        result;

      if (_.isEmpty(string)){
        result = AllHotLists.find({ category: 'contact'}).fetch();
      } else {
        result = AllHotLists.find({ category: 'contact', displayName: { $regex: ".*" + string + ".*", $options: 'i' } }).fetch();
      }
      var array = _.map(result, function (r) {
        return { text: r.displayName, id: r._id };
      });
      self.ready(array);
    };
  }
});

Template.mailChimpManagement.events({
  'click .mc-list': function () {
    selectedList.set(this.id);
  },
  'click #refresh-members': refreshMembers,
  'click #refresh-lists': refreshLists,
  'click #import': function () {
    var selected = selectedList.get();
    if (!selected) return;

    importDisabled.set(true);

    Meteor.call('importFromMailchimp', selected, hotListSelected.get(), function(err, result){
      importDisabled.set(false);
      if (err){
        console.log(err);
      }else {
        importResult.set(result);
        importFinished.set(true);
        $.gritter.add({
          title:	'Mail chimp',
          text:	result.imported.length + ' contacts imported, ' + result.failed.length +
                ' failed, '+ result.existed.length + ' already existed and were ignored',
          image: 	'/img/logo.png',
          sticky: false,
          time: 2000
        });
      }
    })
  }
});



var timecardsHandler;
TimeEntryController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'timeEntry'
});


var error = new ReactiveVar(''),
    isSubmitting = new ReactiveVar(false),
    isDisabled = new ReactiveVar(true),
    saveError = new ReactiveVar(''),
    isSaving = new ReactiveVar(false),
    tcHours = {};

Template.timeEntry.helpers({
  isSubmitting: function () {
    return isSubmitting.get();
  },
  error: function () {
    return error.get();
  },
  dateOptions: function () {
    return {
      daysOfWeekDisabled: "1,2,3,4,5,6",
      todayHighlight: true,
      endDate: new Date()
    };
  },
  isDisabled: function () {
    return isDisabled.get();
  },
  timecards: function () {
    return Timecards.find().fetch();
  },
  placement: function () {
    return Placements.findOne(this.placementId);
  },
  isSaving: function () {
    return isSaving.get();
  },
  saveError: function () {
    return saveError.get();
  }
});


Template.timeEntry.events({
  'changeDate .date': function (evt) {
    if (timecardsHandler)
      timecardsHandler.stop();

    // Temporarily disable the button
    isDisabled.set(true);

    // Clear error message
    error.set('');

    if (evt.date) {
      timecardsHandler = Template.instance().subscribe('timecards', evt.date);
      Meteor.call('shouldCreateTimecards', evt.date, function (err, result) {
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          if (result) {
            isDisabled.set(false);
          }
        }
      });
    }
  },

  'click .create': function () {
    // Clear error message
    error.set('');

    // Disable the button since we are creating the timecards for the selected date
    isDisabled.set(true);

    var date = Template.instance().$('.date').data().datepicker.getDate();
    if (date) {
      isSubmitting.set(true);
      Meteor.call('createTimecards', date, function (err, result) {
        isSubmitting.set(false);
        if (err) {
          var msg = err.reason ? err.reason : err.error;
          error.set('Server error. ' + msg);
        } else {
          // Show notification
          if (result > 0) {
            $.gritter.add({
              title:	'Timecards created',
              text:	'You can now edit the time cards.',
              image: 	'/img/logo.png',
              sticky: false,
              time: 2000
            });
          } else {
            $.gritter.add({
              title:	'No new Timecards',
              text:	'There are no more timecards to create for the selected week.',
              image: 	'/img/logo.png',
              sticky: false,
              time: 2000
            });
          }
        }
      });
    }
  },

  'change .totalHours': function (evt) {
    // Store the value for later save
    tcHours[this._id] = evt.currentTarget.value
  },

  'click .saveTimecards': function () {
    // Clear error message
    saveError.set('');

    isSaving.set(true);
    Meteor.call('updateRegularHours', tcHours, function (err, result) {
      isSaving.set(false);
      if (err) {
        var msg = err.reason ? err.reason : err.error;
        saveError.set('Server error. ' + msg);
      } else {
        // Show notification
        $.gritter.add({
          title:	'Timecards updated',
          text:	'Your changes have been successfully saved.',
          image: 	'/img/logo.png',
          sticky: false,
          time: 2000
        });
      }
    });
  }
});
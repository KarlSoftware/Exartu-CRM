PastJobSchema = new SimpleSchema({
  company: {
    type: String,
    label: 'Company name'
  },
  position: {
    type: String,
    label: 'Position'
  },
  supervisor: {
    type: String,
    label: 'Supervisor'
  },
  location: {
    type: String,
    label: 'Location'
  },
  start: {
    type: Date,
    label: 'Start date'
  },
  end: {
    type: Date,
    label: 'End date',
    optional: true,
    custom: function () {
      if (Meteor.isClient && this.isSet) {
        if (this.field('start').value > this.value){
          return 'endGreaterThanStart';
        }
      }
    }
  }
});
PastJobSchema.messages({
  endGreaterThanStart: 'End date should be grater than start date'
});


var toPresent = ReactiveVar(false);

AutoForm.hooks({
  AddPastJobRecord: {
    onSubmit: function(pastJobRecord) {
      var self = this;
      var id = Template.parentData(1)._id;

      if (toPresent.get())
        pastJobRecord.end = undefined;

      Meteor.call('addPastJobRecord', id, pastJobRecord, function () {
        toPresent.set(false);
        self.done();
        self.resetForm();
      });

      return false;
    }
  }
});

// Add
Template.employeePastJobAdd.helpers({
  endDateClass: function () {
    return toPresent.get() ? 'disabled' : '';
  }
});

Template.employeePastJobAdd.events({
  'change .toPresent': function (event, template) {
    toPresent.set(!toPresent.get());
    $(template.find('[data-schema-key=end]')).val("");
  }
});

// List
Template.employeePastJobsList.helpers({
  items: function() {
    if (this.pastJobs && this.pastJobs.length > 1)
      return this.pastJobs.sort(function(d1, d2) {
        return d1.start - d2.start;
      });

    return this.pastJobs;
  }
});

// Record
Template.employeePastJobItem.helpers({
  getCtx: function () {
    var self = this;
    return {
      pastJobRecord: self,
      isEditing: new ReactiveVar(false),
      toPresent: new ReactiveVar(!self.end)
    };
  },
  isEditing: function () {
    return this.isEditing.get();
  }
});

Template.employeePastJobItem.events({
  'click .deletePastJobRecord': function () {
    var id = Template.parentData(1)._id;
    var pastJobRecord = this.pastJobRecord;

    Utils.showModal('basicModal', {
      title: 'Delete past job record',
      message: 'Are you sure you want to delete this past job record?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {label: 'Delete', classes: 'btn-danger', value: true}],
      callback: function (result) {
        if (result) {
          Meteor.call('deletePastJobRecord', id, pastJobRecord);
        }
      }
    });
  },
  'click .editPastJobRecord': function () {
    // Open edit mode
    this.isEditing.set(!this.isEditing.get());
  }
});

// Edit record
Template.employeePastJobEditItem.helpers({
  created: function () {
    var self = this;

    // Get contactableId
    var contactableId = Session.get('entityId');

    self.data.formId = Random.hexString(10);

    // Create a AutoForm hook for each record form
    AutoForm.addHooks(self.data.formId, {
      onSubmit: function(pastJobRecord, setSelector, oldRecord) {
        var self = this;
        var ctx = Template.parentData(2);
        pastJobRecord.end = ctx.toPresent.get() ? undefined: pastJobRecord.end;

        Meteor.call('editPastJobRecord', contactableId, oldRecord, pastJobRecord, function (err) {
          if (!err) {
            // Close edit mode
            ctx.isEditing.set(!ctx.isEditing.get());
            self.done();
          }
        });

        return false;
      }
    });
  },
  endDateClass: function() {
    var ctx = Template.parentData(2);
    return ctx.toPresent.get()? 'disabled' : '';
  },
  checked: function() {
    var ctx = Template.parentData(2);
    return ctx.toPresent.get()? 'checked' : undefined;
  }
});

Template.employeePastJobEditItem.events({
  'change #to-present': function() {
    var ctx = Template.parentData(1);
    ctx.toPresent.set(!ctx.toPresent.get());
  },
  'click .cancelPastJobRecordChanges': function () {
    // Close edit mode
    var ctx = Template.parentData(1);
    ctx.isEditing.set(!ctx.isEditing.get());
  }
});
Template.entityActivities.onCreated(function () {
  this.subscribe('entityActivities', Session.get('entityId'));
});

Template.entityActivities.helpers({
  activities: function () {
    return Activities.find({},{sort: {'data.dateCreated': -1}});
  },
  getTemplateForActivity: function () {
    switch (this.type) {
      case Enums.activitiesType.contactableAdd:
        return 'entityCreatedActivity';
      case Enums.activitiesType.jobAdd:
        return 'entityCreatedActivity';
      case Enums.activitiesType.taskAdd:
        return 'entityTaskAddActivity';
      case Enums.activitiesType.placementAdd:
        return 'placementAddActivity';
      case Enums.activitiesType.noteAdd:
        return 'entityNoteAddActivity';
      case Enums.activitiesType.fileAdd:
        return 'fileAddActivity';
      case Enums.activitiesType.contactableUpdate:
        return 'contactableEditActivity';
    }
  }
});

UI.registerHelper('thisToJSON', function(ctx) {
 return JSON.stringify(ctx);
});

Template.entityNoteAddActivity.events({
  'click .note-link': function () {
    Utils.showModal('addEditNote', this.entityId);
  }
});
Template.entityTaskAddActivity.events({
  'click .task-link': function () {
    Utils.showModal('addEditTask', this.entityId);
  }
});
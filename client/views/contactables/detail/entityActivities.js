Template.entityActivities.onCreated(function () {
  this.handler = Meteor.paginatedSubscribe('entityActivities', {pubArguments: this.data.entityId || Session.get('entityId'), options: {sort: {'data.dateCreated': -1}}});
});

Template.entityActivities.onDestroyed(function () {
  this.handler.stop();
});

Template.entityActivities.helpers({
  getCollection: function () {
    return Activities;
  },
  getHandlerName: function () {
    return 'entityActivities'
  }
});

Template.incomingCallActivities.onCreated(function () {
  this.handler = Meteor.paginatedSubscribe('incomingCall', {pubArguments: this.data.entityId || Session.get('entityId'), options: {sort: {'data.dateCreated': -1}}});
});

Template.incomingCallActivities.onDestroyed(function () {
  this.handler.stop();
});

Template.incomingCallActivities.helpers({
  getCollection: function () {
    return IncomingCallActivities;
  },
  getHandlerName: function () {
    return 'incomingCall'
  }
});



Template.showActivities.helpers({
  getHandlerName: function () {
    return this.handlerName;
  },
  activities: function () {
    return this.collection.find({},{sort: {'data.dateCreated': -1}});
  },
  getTemplateForActivity: function () {
    switch (this.type) {
      case Enums.activitiesType.contactableAdd:
        return 'entityCreatedActivity';
      case Enums.activitiesType.jobAdd:
        return 'entityJobAddActivity';
      case Enums.activitiesType.taskAdd:
        return 'entityTaskAddActivity';
      case Enums.activitiesType.placementAdd:
        return 'entityPlacementAddActivity';
      case Enums.activitiesType.noteAdd:
        return 'entityNoteAddActivity';
      case Enums.activitiesType.fileAdd:
        return 'entityFileAddActivity';
      case Enums.activitiesType.contactableUpdate:
        return 'contactableEditActivity';
    }
  }
});

UI.registerHelper('thisToJSON', function(ctx) {
 return JSON.stringify(ctx);
});

Template.entityNoteAddActivity.created = function(){
  
}

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


Template.entityFileAddActivity.helpers({
  getFileName: function (fileId) {
    var file = ContactablesFiles.findOne(fileId);
    return file && file.name;
  }
});

Template.entityPlacementAddActivity.helpers({
  getJobName: function (jobId) {
    var job = Jobs.findOne(jobId);
    return job && job.displayName;
  }
});
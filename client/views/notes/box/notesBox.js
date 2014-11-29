var entityType = null;
var isEntitySpecific = false;
var NotesHandler, noteQuery, status;
var statusDep = new Deps.Dependency;

var loadNoteQueryFromURL = function (params) {
  // Search string
  var searchStringQuery = {};
  if (params.search) {
    searchStringQuery.default = params.search;
  }

  var userIdQuery = {};
  if (params.userId) {
    userIdQuery.default = params.userId;
  }

  return new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      userId: userIdQuery
    }
  });
};

Template.notesBox.created = function () {
  noteQuery = noteQuery || loadNoteQueryFromURL(Router.current().params);

  var entityId = Session.get('entityId');

  if (!SubscriptionHandlers.NotesHandler) {
    SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notes");
  }
  NotesHandler = SubscriptionHandlers.NotesHandler;

  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
  if (entityType != null) isEntitySpecific = true;

  Meteor.autorun(function () {
    var urlQuery = new URLQuery();

    var queryObj = noteQuery.getObject();
    var q = {};


    if (queryObj.userId) {
      q.userId = Meteor.userId();
      urlQuery.addParam('userId', queryObj.userId);
    }

    if (queryObj.searchString) {
      q.msg = {
        $regex: queryObj.searchString,
        $options: 'i'
      };
      urlQuery.addParam('search', queryObj.searchString);
    }

    if (isEntitySpecific) {
      q.links = {$elemMatch: {id: entityId}};
    }

    urlQuery.apply();

    NotesHandler.setFilter(q);
  })
};


Template.notesBox.helpers({
  noteCount: function () {
    NotesHandler.totalCount();
  },
  users: function () {
    return Meteor.users.find();
  },
  notes: function () {

    return Notes.find();
  },
  filters: function () {
    return noteQuery;
  },
  selectedClass: function () {
    statusDep.depend();
    return this == status ? 'btn-primary' : 'btn-default';
  },
  isLoading: function () {
    return NotesHandler.isLoading();
  }
});

Template.notesBox.events({
  'click .addNote': function () {
    if (!isEntitySpecific)
      Composer.showModal('addEditNote');
    else
      Composer.showModal('addEditNote', {
        links: [{
          id: Session.get('entityId'),
          type: entityType
        }]
      })
  }
});


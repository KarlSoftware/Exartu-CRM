var entityType = null;
var isEntitySpecific = false;
var NotesHandler, noteQuery, status;

$("#userDropdown").prop("selectedIndex", -1);
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


  entityType = Utils.getEntityTypeFromRouter();
  isEntitySpecific = false;
  if (entityType != null) isEntitySpecific = true;
  Meteor.autorun(function () {
    var urlQuery = new URLQuery();

    var queryObj = noteQuery.getObject();
    var q = {};

    if (queryObj.userId) {
      q.userId = queryObj.userId;
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
    console.log('query',q);
    urlQuery.apply();

    if (!SubscriptionHandlers.NotesHandler) {
      SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe('notes', {filter: q});
    }else{
      SubscriptionHandlers.NotesHandler.setFilter(q);
    }
    NotesHandler = SubscriptionHandlers.NotesHandler;
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


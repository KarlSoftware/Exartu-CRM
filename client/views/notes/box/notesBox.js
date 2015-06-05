var entityType = null;
var isEntitySpecific = false;
var NotesHandler, noteQuery, status;
var searchStringQuery = {};
var q={};
var selectedSort = new ReactiveVar();
var tourIndex;
var loadNoteQueryFromURL = function (params) {
  // Search string

  if (params.search) {
    searchStringQuery.default = params.search;
  }

  var userIdQuery = {};
  if (params.userId) {
    userIdQuery.default = params.userId;
  }
  // CreationDate
  var creationDateQuery = {};
  if (params.creationDate) {
    creationDateQuery.default = params.creationDate;
  }
  // Owned by me
  var ownedByMeQuery = {type: Utils.ReactivePropertyTypes.boolean};
  ownedByMeQuery.default=false;
  if (params.owned) {
    ownedByMeQuery.default = params.owned ? true: false;
  }

  var x = new Utils.ObjectDefinition({
    reactiveProps: {
      searchString: searchStringQuery,
      userId: userIdQuery,
      ownedByMe: ownedByMeQuery,
      selectedLimit: creationDateQuery
    }
  });
  return x;
};
var options = {};

Template.notesBox.rendered = function(){
  Meteor.call('getIndexTour', "tourActivities", function(err,cb){
    tourIndex = cb;
    if((tourIndex>=22)&&(tourIndex < 27)){
      $("#tourActivities").joyride({
        autoStart: true,
        startOffset:tourIndex + 1,
        modal: true,
        postRideCallback: function(e) {
          Meteor.call('setVisitedTour', "tourActivities", 27, function(err,cb){
          })
        },
        postStepCallback: function(e, ctx){
          tourIndex = e;
          Meteor.call('setVisitedTour', "tourActivities", tourIndex, function(err,cb){
          })


        }
      });
    }
  });
};

Template.notesBox.destroyed = function() {
  $("#tourActivities").joyride('destroy');
  SubscriptionHandlers.NotesHandler.stop()
  SubscriptionHandlers.NotesHandler = undefined;
}

Template.notesBox.created = function () {
  noteQuery = noteQuery || loadNoteQueryFromURL(Router.current().params.query);
  var entityId = Session.get('entityId');

  if (!SubscriptionHandlers.NotesHandler) {
    SubscriptionHandlers.NotesHandler = Meteor.paginatedSubscribe("notesView");
  }
  NotesHandler = SubscriptionHandlers.NotesHandler;

  entityType = Utils.getEntityTypeFromRouter();

  isEntitySpecific = (entityType != null);

  Meteor.autorun(function () {
    var urlQuery = new URLQuery();
    var queryObj = noteQuery.getObject();
    q = {};

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
    if (queryObj.selectedLimit) {
      var dateLimit = new Date();
      q.dateCreated = {
        $gte: dateLimit.getTime() - queryObj.selectedLimit
      };
      urlQuery.addParam('creationDate', queryObj.selectedLimit);
    }
    if (queryObj.ownedByMe) {
      q.userId = Meteor.userId();
      urlQuery.addParam('owned', true);
    }

    urlQuery.apply();
    if (selectedSort.get()) {
      var selected = selectedSort.get();
      options.sort = {};
      options.sort[selected.field] = selected.value;
    } else {
      delete options.sort;
    }
    NotesHandler.setFilter(q);
    NotesHandler.setOptions(options);
  })
};

Template.notesBox.helpers({
  noteCount: function () {
    return NotesHandler.totalCount();
  },
  users: function () {
    return Meteor.users.find({}, {sort: {'emails.address': 1}});
  },
  notes: function () {
    return NotesView.find(q,options);
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
  },
  isUserSelected: function () {
    return this._id == noteQuery.userId.value;
  }
});

Template.notesBox.events({
  'keyup #searchString': _.debounce(function (e) {
    noteQuery.searchString.value = e.target.value;
  }, 200),
  'click .addNote': function () {
    if (!isEntitySpecific)
      Utils.showModal('addEditNote');
    else
      Utils.showModal('addEditNote', {
        links: [{
          id: Session.get('entityId'),
          type: entityType
        }]
      })
  }
});
// list sort


selectedSort.field = 'dateCreated';
selectedSort.value = -1;
var sortFields = [
  {field: 'dateCreated', displayName: 'Date'},
];

Template.noteListSort.helpers({
  sortFields: function () {
    return sortFields;
  },
  selectedSort: function () {
    return selectedSort.get();
  },
  isFieldSelected: function (field) {
    return selectedSort.get() && selectedSort.get().field == field.field;
  },
  isAscSort: function () {
    return selectedSort.get() ? selectedSort.get().value == 1 : false;
  }
});

var setSortField = function (field) {
  var selected = selectedSort.get();
  if (selected && selected.field == field.field) {
    if (selected.value == 1)
      selected = undefined;
    else
      selected.value = 1;
  } else {
    selected = field;
    selected.value = -1;
  }
  selectedSort.set(selected);
};

Template.noteListSort.events = {
  'click .sort-field': function () {
    setSortField(this);
  }
};


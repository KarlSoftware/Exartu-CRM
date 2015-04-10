var pageLimit = 10;

var entityType = null;
var isEntitySpecific = false;

var membersCollection = Contactables;
var hotListCollection = HotLists;
var HotListMembersHandler, query;

// Vars
var searchFields = ['person.firstName', 'person.lastName', 'person.middleName', 'organization.organizationName'];
var defaultSort = {
    'displayName': -1
};

var options = {};
var searchQuery = {};

var hotList;
var isSearching = false;

// Reactive vars
//var hotListMembers = new ReactiveVar();
var membersCount = new ReactiveVar();
var members = new ReactiveVar();

// Dependencies
searchDep = new Tracker.Dependency;
var hotListMembersDep = new Deps.Dependency();


var loadqueryFromURL = function (params) {
    // Search string
    var searchStringQuery = {};
    if (params.search) {
        searchStringQuery.default = params.search;
    }

    return new Utils.ObjectDefinition({
        reactiveProps: {
            searchString: searchStringQuery
        }
    });
}


var setSubscription = function (searchQuery, options) {

    hotList.members = members.get();
    searchQuery = {_id: { $in : members.get() } };
    if (SubscriptionHandlers.HotListMembersHandler) {
        SubscriptionHandlers.HotListMembersHandler.setFilter(searchQuery);
        SubscriptionHandlers.HotListMembersHandler.setOptions(options);
    }
    else {
        SubscriptionHandlers.HotListMembersHandler =
            Meteor.paginatedSubscribe('hotListMembers', {
                pubArguments: hotList._id,
                filter: searchQuery,
                options: options
            });
    }

    HotListMembersHandler = SubscriptionHandlers.HotListMembersHandler;

    //membersCount.set( HotListMembersHandler.totalCount() );
    var skip = (HotListMembersHandler.currentPage()-1)*pageLimit;

    options.limit = pageLimit;
    options.skip = skip;

    searchDep.depend();
    return;
}


/**
 * HotList Members - Template
 */
Template.hotListMembersBox.created = function () {

    query = query || loadqueryFromURL(Router.current().params.query);

    if(this.data.hotList) hotList = this.data.hotList;
    else hotList = HotLists.findOne({_id: Session.get('entityId')});

    members.set(hotList.members);
    membersCount.set( hotList.members.length );

    searchQuery = {_id: { $in : hotList.members } };
    options.sort = {};
    options.sort = defaultSort;
    options.pubArguments = hotList._id;
    setSubscription(searchQuery, options);
};

Template.hotListMembersBox.destroyed = function(){
    if(SubscriptionHandlers.HotListMembersHandler){
        SubscriptionHandlers.HotListMembersHandler.stop();
        delete SubscriptionHandlers.HotListMembersHandler;
    }
};

Template.hotListMembersBox.helpers({
    isSearching: function () {
        return isSearching;
    }
});


/**
 * HotList Members - Header template
 */
Template.hotListMembersHeader.helpers({
    membersCount: function () {
        return membersCount.get();
    }
});


/**
 * HotList Members - Search template
 */
Template.hotListMembersSearch.helpers({
    searchString: function () {
        return query.searchString;
    },
    isLoading: function () {
        return HotListMembersHandler.isLoading();
    }
});

Template.hotListMembersSearch.events({
  'keyup #searchString': _.debounce(function (e) {
    query.searchString.value = e.target.value;
    setSubscription(searchQuery, options);
  }, 200),

  'click .addHotListMember': function (e, ctx) {
    Utils.showModal(
      'hotListMemberAdd',
      hotList._id, function (memberId, hotListId) {
        var tempHotList = HotLists.findOne({_id: Session.get('entityId')});
        var mbrs = tempHotList.members;

        if (tempHotList.members.indexOf(memberId) > -1) {
          return false;
        }

        mbrs.push(memberId);

        HotLists.update({_id: hotListId}, {$set: {members: mbrs}});

        membersCount.set(mbrs.length);
        members.set(mbrs);

        setSubscription(searchQuery, options);
        searchDep.changed();
        return;
      }
    );
  },

  'click #sendEmailTemplate': function () {
    var hotlist = HotLists.findOne({_id: Session.get('entityId')});
    var members = Contactables.find({_id: {$in: hotlist.members}}, {sort: {displayName: 1}}).fetch();

    // Find the first contactable type that is not multiple types unless all of them are
    var contactableType = Utils.getContactableType(members[0]);
    for (var i = 1; i < members.length && contactableType.indexOf('/') !== -1; i++) {
      contactableType = Utils.getContactableType(members[i]);
    }

    // Get the category for each type of contact
    var categories = [];
    _.each(contactableType.split('/'), function (type) {
      switch (type) {
        case 'Client':
          categories.push(MergeFieldHelper.categories.client.value);
          break;
        case 'Employee':
          categories.push(MergeFieldHelper.categories.employee.value);
          break;
        case  'Contact':
          categories.push(MergeFieldHelper.categories.contact.value);
          break;
      }
    });

    // Choose the template to send
    Utils.showModal('sendEmailTemplateModal', {
      categories: categories,
      callback: function (result) {
        if (result) {
          var recipients = [];

          // Get the email of all the members of the hotlist when available
          var emailCMTypes = _.pluck(LookUps.find({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            lookUpActions: {
              $in: [
                Enums.lookUpAction.ContactMethod_Email,
                Enums.lookUpAction.ContactMethod_PersonalEmail,
                Enums.lookUpAction.ContactMethod_WorkEmail
              ]
            }
          }).fetch(), '_id');
          _.each(members, function (member) {
            var email = _.find(member.contactMethods, function (cm) {
              return _.indexOf(emailCMTypes, cm.type) != -1
            });
            if (email)
              recipients.push({ contactableId: member._id, email: email.value });
          });

          // send the email template to the recipients
          Meteor.call('sendEmailTemplate', result, recipients, function (err, result) {
            if (!err) {
              $.gritter.add({
                title: 'Email template sent',
                text: 'The email template was successfully sent.',
                image: '/img/logo.png',
                sticky: false,
                time: 2000
              });
            }
          });
        }
      }
    });
  }
});


/**
 * HotList Members - List section
 */
Template.hotListMembersList.created = function () {

    options = {};
    searchQuery = {};
    query = query || loadqueryFromURL(Router.current().params);

    options.sort = {};
    options.sort = defaultSort;
    options.pubArguments = hotList._id;
    setSubscription(searchQuery, options);

    Tracker.autorun(function () {


        var urlQuery = new URLQuery();
        searchQuery = {
            _id: { $in : hotList.members },
            $and: [] // Push each $or operator here
        };

        options = {};
        options.sort = {};
        options.sort = defaultSort;
        options.pubArguments = hotList._id;

        // String search
        if (query.searchString.value) {
            var stringSearches = [];

            _.each(searchFields, function (field) {
                var aux = {};
                aux[field] = {
                    $regex: query.searchString.value,
                    $options: 'i'
                };
                stringSearches.push(aux);
            });

            searchQuery.$and.push({
                $or: stringSearches
            });

            urlQuery.addParam('search', query.searchString.value);
        }

        // if there are no search conditions
        if (searchQuery.$and.length == 0){
            delete searchQuery.$and;
        }

        urlQuery.apply();
        setSubscription(searchQuery, options);
    });
};

Template.hotListMembersList.helpers({
    isLoading: function () {
        return HotListMembersHandler.isLoading();
    },
    hotListMembers: function () {
        return membersCollection.find(searchQuery, options);
    }
});

Template.hotListMembersList.events({
    'click .removeMember': function (e, ctx) {
        var tempHotList = HotLists.findOne({_id: Session.get('entityId')});
        tempHotList.members.splice(tempHotList.members.indexOf(this._id), 1);
        HotLists.update({_id: tempHotList._id}, {$set: {members: tempHotList.members}});

        //HotLists.update({_id: tempHotList._id}, {$pull: { 'members': this._id }});

        membersCount.set( tempHotList.members.length );

        members.set( tempHotList.members );
        setSubscription(searchQuery, options);

        e.preventDefault();
        searchDep.changed();
        return;
    }
});


/**
 * HotList Members - Item template
 */
Template.hotListMembersListItem.helpers({
    getAcronym: function(str) {
        var matches = str.match(/\b(\w)/g);
        return matches.join('');
    }
});
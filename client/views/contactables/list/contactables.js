var objType = ko.observable();

var filters = ko.observable(ko.mapping.fromJS({
  objType: '',
  tags: [],
  statuses: [],
  inactives: false,
  limit: 20
}));

ContactablesController = RouteController.extend({
  template: 'contactables',
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [ObjTypesHandler, ContactableHandler, PlacementHandler];
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }

    if (this.isFirstRun == false) {
      this.render();
      return;
    }
    var type = this.params.hash || this.params.type;
    if (type != undefined && type != 'all') {
      var re = new RegExp("^" + type + "$", "i");
      var objType = dType.ObjTypes.findOne({
        name: re
      });
      query.objType.value = objType.name;
      info.objType.value = objType.name+'s';
    } else {
      query.objType.value = undefined;
      info.objType.value = 'record(s)';
    }
    this.render('contactables');
  },
  onAfterAction: function() {
    var title = 'My Network',
      description = 'All your contacts are here';
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

var timeLimits = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

var info = new Utils.ObjectDefinition({
  reactiveProps: {
    contactablesCount: {},
    objType: {},
    isRecentDaySelected: {
      default: false
    },
    objTypeDisplayName: {},
    isRecentWeekSelected: {
      default: false
    },
    isRecentMonthSelected: {
      default: false
    },
    isRecentYearSelected: {
      default: false
    },
    isFiltering: {
      default: false
    }
  }
});
var query = new Utils.ObjectDefinition({
  reactiveProps: {
    searchString: {},
    objType: {},
    inactives: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    onlyRecents: {
      type: Utils.ReactivePropertyTypes.boolean,
      default: false
    },
    selectedLimit: {},
    tags: {
      type: Utils.ReactivePropertyTypes.array,
      default: []
    },
    limit: {},
    location: {},
    candidateStatus: {}
  }
});

Template.contactables.created = function(){
  query.limit.value = 20
}
// List

Template.contactablesList.info = function() {
  info.isFiltering.value = Contactables.find().count() != 0;
  return info;
};

var contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};
Template.contactablesListSearch.contactableTypes = contactableTypes;

Template.contactablesListSearch.resumeParserRestrictions = function() {
  return [SubscriptionPlan.plansEnum.enterprise];
};

var searchDep = new Deps.Dependency;
var isSearching = false;
Template.contactables.isSearching = function() {
  searchDep.depend();
  return isSearching;
}

Template.contactablesListItem.isESSearch = function() {
  return !_.isEmpty(query.searchString.value);
};

var locationFields = ['address', 'city', 'state', 'country'];

var getLocationTagValue = function(locationField, locationFields) {
  var regex = new RegExp('(?:'+ locationField + ':)((?!'+ locationFields.filter(function(field) {
    return field != locationField;
  }).map(function(field){
    return field + ':';
  }).join('|') +').)*', 'ig');
  var match = regex.exec(query.location.value);
  var value;
  if (match) 
    value = match[0].substring(locationField.length + 1).trim();

  return value;
};

// Elasticsearch
var esDep = new Deps.Dependency;
var esResult = [];

Meteor.autorun(function() {
  if (_.isEmpty(query.searchString.value))
    return;

  query.searchString.dep.depend();

  // Process filters
  var filters = {
    bool: {
      must: [],
      should: []
    },
  };

  // Contactable type
  if (query.objType.value)
    filters.bool.must.push({term: {objNameArray: [query.objType.value.toLowerCase()]}});

  // Tags
  if (query.tags.value.length > 0) {
    var tags = {or: []};
    _.forEach(query.tags.value, function(tag) {
      tags.or.push({term: {tags: tag}});
    });
    filters.bool.must.push(tags);
  }

  // Only recent filters
  if (query.selectedLimit.value) {
    var now = new Date();
    filters.bool.must.push({range: {dateCreated: {gte: moment(new Date(now.getTime() - query.selectedLimit.value)).format("YYYY-MM-DDThh:mm:ss")}}});
  }

  // Include inactives
  if (!query.inactives.value) {
    var activeStatusFilter = {or: []}; 
    var activeStatuses;
    _.each(['Employee','Contact', 'Customer'], function(objName){
      activeStatuses = getActiveStatuses(objName);
      _.forEach(activeStatuses, function(activeStatus) {
        var statusFilter = {};
        statusFilter[objName + '.status'] = activeStatus.toLowerCase();
        activeStatusFilter.or.push({term: statusFilter});
      })
    });
    filters.bool.must.push(activeStatusFilter);
  }

  // Location filter
  var locationOperatorMatch = false;
  if (query.location.value) {
    _.forEach(locationFields, function(locationField) {
      var value = getLocationTagValue(locationField, locationFields);

      if (value) {
        locationOperatorMatch = true;
        var aux = { regexp: {}};
        aux.regexp['location.' + locationField] = '.*' + value + '.*';
        filters.bool.must.push(aux); 
      }
    });
  }

  // If not location operator match is used then search on each field
  if (query.location.value && !locationOperatorMatch) {
    _.forEach(locationFields, function(locationField) {
      var aux = { regexp: {}};
      aux.regexp['location.' + locationField] = '.*' + query.location.value + '.*';
      filters.bool.should.push(aux); 
    });
  }

  isSearching = true;
  searchDep.changed();

  Contactables.esSearch('.*' + query.searchString.value + '.*', filters,function(err, result) {
    if (!err) {
      esResult = _.map(result.hits, function(hit) {
        var contactable = Contactables._transform(hit._source);
        contactable._match = {
          score: (hit._score / result.max_score) * 100,
          properties: _.map(hit.highlight, function(matchedProperty, propertyName) {
            return propertyName;
          }),
          contexts: _.flatten(_.map(hit.highlight, function(matchedProperty, propertyName) {
            return matchedProperty;
          })),
        }
        return contactable;
      });
      esDep.changed();
      isSearching = false;
      searchDep.changed();
    } else
      console.log(err)
  });
});

var getActiveStatuses = function(objName){
  var status = Enums.lookUpTypes[objName.toLowerCase()];
  status = status && status.status;
  if (status){
    var lookUpCodes = status.lookUpCode,
      implyActives = LookUps.find({lookUpCode: lookUpCodes, lookUpActions: Enums.lookUpAction.Implies_Active}).fetch();
    return _.map(implyActives,function(doc){ return doc._id});
  }
  return null;
}

Template.contactablesList.contactables = function() {
  var searchQuery = {
    $and: [] // Push each $or operator here
  };

  // Dependencies
  esDep.depend();

  // Elasitsearch
  if (!_.isEmpty(query.searchString.value)) { 
    return esResult;
  }

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  if (query.selectedLimit.value) {
    var dateLimit = new Date();
    searchQuery.dateCreated = {
        $gte: dateLimit.getTime() - query.selectedLimit.value
    };
  }

  if (! query.inactives.value) {
    var inactiveStatusOR = {
      $or: []
    };
    var activeStatuses;
    var aux;
    _.each(['Employee', 'Contact', 'Customer'], function(objName){
      activeStatuses = getActiveStatuses(objName);
      if (_.isArray(activeStatuses) && activeStatuses.length > 0){
        aux={};
        aux[objName + '.status'] = {
          $in: activeStatuses
        };
        inactiveStatusOR.$or.push(aux)
      }
    })
    searchQuery.$and.push(inactiveStatusOR);
  }

  // Location filter
  var locationOperatorMatch = false;
  if (query.location.value) {
    _.forEach(locationFields, function(locationField) {
      var value = getLocationTagValue(locationField, locationFields);

      if (value) {
        locationOperatorMatch = true;
        var aux = { term: {}};
        searchQuery['location.' + locationField] = {
          $regex: value,
          $options: 'i'
        };
      }
    });
  }

  // If not location operator match is used then search on each field
  if (query.location.value && !locationOperatorMatch) {
    var locationOR = {
      $or: []
    };
    _.forEach(locationFields, function(locationField) {
      var aux = {};
      aux['location.' + locationField] = {
        $regex: query.location.value,
        $options: 'i'
      };
      locationOR.$or.push(aux);
    });
    searchQuery.$and.push(locationOR);
  }

  // Tags filter
  if (query.tags.value.length > 0) {
    searchQuery.tags = {
      $in: query.tags.value
    };
  }

  if (searchQuery.$and.length == 0)
    delete searchQuery.$and;

  if (query.candidateStatus.value){
    searchQuery._id = {$in:_.map(Placements.find({candidateStatus: query.candidateStatus.value }).fetch(), function(placement){return placement.employee})}
  }

  var contactables = Contactables.find(searchQuery, {limit: query.limit.value});


  return contactables;
};

// All

Template.contactables.information = function() {
  var searchQuery = {};

  if (query.objType.value)
    searchQuery.objNameArray = query.objType.value;

  info.contactablesCount.value = Contactables.find(searchQuery).count();

  return info;
};

Template.contactables.showMore = function() {
  return function() { query.limit.value = query.limit.value + 15 };
};

// List search

Template.contactablesList.contactableTypes = function() {
  return dType.ObjTypes.find({ parent: Enums.objGroupType.contactable });
};

Template.contactablesListSearch.searchString = function() {
  return query.searchString;
};

// List filters

Template.contactablesFilters.query = function () {
  return query;
};

Template.contactablesFilters.contactableTypes2 = contactableTypes;

Template.contactablesFilters.recentOptions = function() {
  return timeLimits;
};

Template.contactablesFilters.isSelectedType = function(typeName){
  return query.objType.value == typeName;
};

Template.contactablesFilters.candidateeStatusChanged = function(){
  return function(lookUpId){
    query.candidateStatus.value = lookUpId;
  }
};

Template.contactablesFilters.typeOptionClass = function(option) {
  return query.objType.value == option.name? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';

};

Template.contactablesFilters.recentOptionClass = function(option) {
  return query.selectedLimit.value == option? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
};

Template.contactablesFilters.showInactives = function() {
  return query.inactives.value? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
};

Template.contactablesFilters.tags = function() {
  return query.tags;
};

var addTag = function() {
  var inputTag = $('#new-tag')[0];

  if (!inputTag.value)
    return;

  if (_.indexOf(query.tags.value, inputTag.value) != -1)
    return;

  query.tags.insert(inputTag.value);
  inputTag.value = '';
  inputTag.focus();
};

var setDateCreatedFilter = function(value) {
  if (query.selectedLimit.value == value)
    query.selectedLimit.value = undefined;
  else
    query.selectedLimit.value = value;
};

Template.contactablesFilters.events = {
  'click .add-tag': function() {
    addTag();
  },
  'keypress #new-tag': function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      addTag();
    }
  },
  'click .remove-tag': function() {
    query.tags.remove(this.value);
  },
  'click .focusAddTag': function(){
    $('#new-tag')[0].focus();
  },
  'click #recent-day': function() {
    setDateCreatedFilter(timeLimits.day);
  },
  'click #recent-week': function() {
    setDateCreatedFilter(timeLimits.week);
  },
  'click #recent-month': function() {
    setDateCreatedFilter(timeLimits.month);
  },
  'click #recent-year': function() {
    setDateCreatedFilter(timeLimits.year);
  },
  'click #show-inactives': function() {
    query.inactives.value = !query.inactives.value;
  },
  'click .typeSelect': function() {
    if (query.objType.value == this.name){
      query.objType.value= null;
    }else{
      query.objType.value= this.name;
    }
  }
};

// Item
Template.contactablesListItem.pictureUrl = function(pictureFileId) {
  var picture = ContactablesFS.findOne({_id: pictureFileId});
  return picture? picture.url('ContactablesFSThumbs') : undefined;
};

Template.contactablesListItem.contactableIcon = function() {
  return helper.getEntityIcon(this);
};

Template.contactablesListItem.displayObjType = function() {
  return Utils.getContactableType(this);
};

// Employee item
Template.employeeInformation.placementInfo = function () {
  if (!this.placement)
    return undefined;

  var placementInfo = {};
  var placement = Placements.findOne({_id: this.placement});

  var job = Jobs.findOne({
    _id: placement.job
  }, {
    transform: null
  });

  var customer = Contactables.findOne({_id: job.customer}, {transform: null});

  placementInfo.job = job._id;
  placementInfo.jobTitle = job.publicJobTitle;
  if (customer) {
    placementInfo.customerName = customer.organization.organizationName;
    placementInfo.customer = customer._id;
  }

  return placementInfo;
}

// Google analytic

_.forEach(['employeeInformation', 'contactInformation', 'customerInformation'],
  function(templateName){
    Template[templateName]._events = Template[templateName]._events || [];
    Template[templateName]._events.push({
      events: 'click',
      handler: function() {
        GAnalytics.event("/contactables", "quickAccess", templateName);
      },
    });
});

// Elasticsearch context match template
Template.esContextMatch.rendered = function() {
  var text = this.$('.contextText');
  text[0].innerHTML = this.data;
};
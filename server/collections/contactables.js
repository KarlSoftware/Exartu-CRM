Meteor.publish('singleContactable', function (id) {
  var sub = this;
  ContactablesList.publishCursor(Utils.filterCollectionByUserHier.call(this, ContactablesList.find({_id: id})), sub, 'contactables');
  sub.ready();
});

ContactablesList = new View('auxContactables',{
  collection: Contactables,
  cursors: function (contactable) {

    // Placements
    this.publish({
      cursor: function (contactable) {
        if (contactable.placement !== undefined) {
          return PlacementView.find({ _id: contactable.placement });
        }
      },
      to: 'placements',
      observedProperties: ['placement'],
      onChange: function (changedProps, oldSelector) {
        if (changedProps.placement !== undefined) {
          return PlacementView.find({ _id: changedProps.placement });
        }
      }
    });

    // Publish contact's customer
    this.publish({
      cursor: function (contactable) {
        if (contactable.Contact && contactable.Contact.customer) {
          return Contactables.find(contactable.Contact.customer, { fields: { 'organization.organizationName': 1 } });
        }
      },
      to: 'contactables',
      observedProperties: ['Contact'],
      onChange: function (changedProps, oldSelector) {
        if (changedProps.Contact.customer) {
          return Contactables.find(changedProps.Contact.customer, { fields: { 'organization.organizationName': 1 } });
        }
      }
    });

    // Publish customer's contacts
    this.publish({
      cursor: function (contactable) {
        if (contactable.Customer) {
          return Contactables.find({'Contact.customer': contactable._id});
        }
      },
      to: 'contactables'
    });

    // Publish customer's jobs
    this.publish({
      cursor: function (contactable) {
        return Jobs.find({customer: contactable._id});
      },
      to: 'jobs'
    });

    // Last note
    this.publish({
      cursor: function (contactable) {
        return Notes.find({'links.id': contactable._id}, {limit: 1, sort: { dateCreated: -1}});
      },
      to: 'notes'
    });
  }
});

Meteor.paginatedPublish(ContactablesList, function () {
    if (!this.userId)
      return false;
    console.log('searchcalled')
    return Utils.filterCollectionByUserHier.call(this, ContactablesList.find({},
      {
        fields: {
          // Only fields displayed on list
        },
        sort: {
          dateCreated: -1
        }
      })
    );
  },
  {
    pageSize: 10,
    publicationName: 'auxContactables',
    updateSelector: function (oldSelector, clientParams) {
      console.log('searchcalled2');
      var newSelector = EJSON.clone(oldSelector);
      if (clientParams && clientParams.placementStatus) {
        // Get ids of employees that have placements with status equal to clientParams.placementStatus
        newSelector._id = {$in: Placements.find({candidateStatus: {$in: clientParams.placementStatus}}).map(function(placement){
          return placement.employee;
        })};
      }

      return newSelector;
    }
  }
);

Meteor.publish('allCustomers', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({ Customer: { $exists: true } }, {
    fields: {
      'organization.organizationName': 1,
      'Customer.department':1,
      houseAccount: 1
    }
  })), sub, 'allCustomers');
  sub.ready();
});
Meteor.publish('allEmployees', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({ Employee: { $exists: true } }, {
    fields: {
      'person.lastName': 1,
      'person.middleName': 1,
      'person.firstName': 1
    }
  })), sub, 'allEmployees');
  sub.ready();
});
Meteor.publish('allContactables', function () {
  var sub = this;
  Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({},{
    fields: {
      'person.lastName': 1,
      'person.middleName': 1,
      'person.firstName': 1,
      'organization.organizationName': 1,
      'Customer.department':1
    }
  })), sub, 'allContactables');
  sub.ready();
});

Contactables.allow({
  insert: function () {
    return false;
  },
  update: function (userId, doc) {
    return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().currentHierId, doc.hierId) == -1;
  },
  remove: function () {
    return false;
  }
});

// Hooks

Contactables.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  }catch (e) {
    var user= { }
  }

  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();
  if (!doc.activeStatus) doc.activeStatus=LookUpManager.getActiveStatusDefaultId();

  if (doc.organization)
  {
    doc.displayName= doc.organization.organizationName;
  };
  if (doc.person)
  {
    doc.displayName= doc.person.lastName+', ' + doc.person.firstName;
  }

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
});

// Contactables documents

ContactablesFS = new Document.Collection({
  collection: Contactables
});
ContactablesFS.publish();

Meteor.publish('contactablesFiles', function () {
  return ContactablesFiles.find();
});

// Employee resumes
Resumes = new Mongo.Collection('resumes');
Meteor.publish('resumes', function() {
  return Resumes.find({userId: this.userId});
});

Resumes.allow({
  insert: function (userId, file) {
    return false;
  },
  update: function (userId, file, fields, modifier) {
    return false;
  },
  remove: function (userId, file) {
    return false;
  }
});

// Indexes

Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({'dateCreated': 1});
Contactables._ensureIndex({objNameArray: 1});
Contactables._ensureIndex({'Employee.status': 1});
Contactables._ensureIndex({'Customer.status': 1});
Contactables._ensureIndex({'Contact.status': 1});

var flds = {'organization.organizationName': 1, 'Client.department': 1};
JobView = new View('jobs', {
    collection: Jobs,
    cursors: function (job) {
        // Client
        //this.publish({
        //    cursor: function (job) {
        //        if (job.client)
        //            return Contactables.find(job.client, {fields: flds});
        //    },
        //    to: 'contactables',
        //    observedProperties: ['client'],
        //    onChange: function (changedProps, oldSelector) {
        //        oldSelector._id = changedProps.client;
        //        return Contactables.find(oldSelector, {fields: flds});
        //    }
        //});

        // Publish the three most recent placements
        var placements = Placements.find({job: job._id}, {fields: {'employee': 1, 'job': 1}, sort: {dateCreated: -1}});
        var employeeIds = placements.fetch().map(function (p) {
            return p.employee;
        });

        this.publish({
            cursor: function () {
                return placements;
            },
            to: 'placements'
        });

        //// Employees
        //this.publish({
        //    cursor: function () {
        //        return Contactables.find({_id: {$in: employeeIds}});
        //    },
        //    to: 'contactables'
        //});

    }
});

JobListView = new View('jobsList', {
  collection: Jobs,
  cursors: function (job) {
    // Client
    //this.publish({
    //    cursor: function (job) {
    //        if (job.client)
    //            return Contactables.find(job.client, {fields: flds});
    //    },
    //    to: 'contactables',
    //    observedProperties: ['client'],
    //    onChange: function (changedProps, oldSelector) {
    //        oldSelector._id = changedProps.client;
    //        return Contactables.find(oldSelector, {fields: flds});
    //    }
    //});

    // Publish the three most recent placements
    var placements = Placements.find({job: job._id}, {fields: {'employee': 1, 'job': 1}, sort: {dateCreated: -1}});
    var employeeIds = placements.fetch().map(function (p) {
      return p.employee;
    });

    this.publish({
      cursor: function () {
        return placements;
      },
      to: 'placements'
    });

    //// Employees
    //this.publish({
    //    cursor: function () {
    //        return Contactables.find({_id: {$in: employeeIds}});
    //    },
    //    to: 'contactables'
    //});

  }
});

Meteor.paginatedPublish(JobListView, function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return [];

    return Utils.filterCollectionByUserHier.call(this, JobListView.find({},
        {
            fields: {
                // Only fields displayed on list
            },
            sort: {
                dateCreated: -1
            }
        }
    ));
}, {
    pageSize: 15,
    publicationName: 'jobsList'
});

JobPlacementView = new View('jobs', {
    collection: Jobs,
    cursors: function (job) {
        // Client
        this.publish({
            cursor: function (job) {
                if (job.client)
                    return Contactables.find(job.client, {fields: flds});
            },
            to: 'contactables',
            observedProperties: ['client'],
            onChange: function (changedProps, oldSelector) {
                oldSelector._id = changedProps.client;
                return Contactables.find(oldSelector, {fields: flds});
            }
        });
    }
});

Meteor.publish('singleJob', function (id) {
    return Utils.filterCollectionByUserHier.call(this, JobView.find({_id: id}));
});

Meteor.publish('allJobs', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Jobs.find({}, {
            fields: {
                publicJobTitle: 1,
                client: 1
            }
        })
    ), sub, 'allJobs');
    sub.ready();
});

Jobs.allow({
    update: function () {
        return true;
    }
});
var setComputedDisplayFields=function (doc) {
    if (doc.client) {
        var c = Contactables.findOne(doc.client);
        if (c) doc.clientDisplayName = c.displayName;
    };

    if (doc.jobTitle){
        var jt = LookUps.findOne(doc.jobTitle);
        if (jt) doc.jobTitleDisplayName=jt.displayName;
    }
    doc.displayName=doc.jobTitleDisplayName + ' @ ' + doc.clientDisplayName;
    return doc;
};


// Indexes
Jobs._ensureIndex({client: 1});
Jobs._ensureIndex({status: 1});

Jobs._ensureIndex({activeStatus: 1});
Jobs._ensureIndex({userId: 1});
Jobs._ensureIndex({hierId: 1});
Jobs._ensureIndex({objNameArray: 1});
Jobs._ensureIndex({dateCreated: 1});

//// View
//
//JobView = new Meteor.Collection('JobView', {
//  collection: Jobs,
//  mapping: {
//    clientInfo: {
//      find: function(job) {
//        return Contactables.find(job.clientId,{
//          fields: {
//            'organization.organizationName': 1
//          }
//        });
//      },
//      map: function (doc) {
//        if (! doc) return null;
//
//        return {
//          id: doc._id,
//          displayName: doc.organization.organizationName
//        };
//      }
//    }
//  }
//});

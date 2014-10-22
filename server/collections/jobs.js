JobView = new View('jobs', {
  collection: Jobs,
  mapping: function(job) {
    console.log(job._id);
    console.log(job.customer);

    return Contactables.find(job.customer);
  }
});

Meteor.paginatedPublish(JobView, function(){
  var user = Meteor.users.findOne({
    _id: this.userId
  });

  if (!user)
    return false;
  return JobView.find();
}, {
  pageSize: 3,
  publicationName: 'jobs'
});

Meteor.publish('jobDetails', function (id) {
  return Utils.filterCollectionByUserHier.call(this, JobView.find(id));
});




Jobs.allow({
  update: function () {
    return true;
  }
});

Jobs.before.insert(function (userId, doc) {
  try {
    var user = Meteor.user() || {};
  } catch (e) {
    var user = {}
  }
  doc.hierId = user.currentHierId || doc.hierId;
  doc.userId = user._id || doc.userId;
  doc.dateCreated = Date.now();

  var shortId = Meteor.npmRequire('shortid');
  var aux = shortId.generate();
  doc.searchKey = aux;
  console.log('shortId: ' + aux);
});

// Indexes

Jobs._ensureIndex({hierId: 1});
Jobs._ensureIndex({objNameArray: 1});

//// View
//
//JobView = new Meteor.Collection('JobView', {
//  collection: Jobs,
//  mapping: {
//    customerInfo: {
//      find: function(job) {
//        return Contactables.find(job.customerId,{
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

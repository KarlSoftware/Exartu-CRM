Meteor.publish('hierarchies', function() {
  var user = Meteor.users.findOne(this.userId);
  if (!user)
    return [];

  var userHierarchies = [];
  _.forEach( user.hierarchies, function (hierarchy) {
    var $or = Utils.filterByHiers(hierarchy, '_id');
    userHierarchies = userHierarchies.concat($or);
  });

  return Hierarchies.find({$or: userHierarchies});
});

Hierarchies.allow({
  update: function(userId, doc, fieldNames, modifier){
    // Only allow to edit hier name
    if (fieldNames.length == 1 && fieldNames[0] == 'name') {
      var user = Meteor.users.findOne(userId);

      // Check if the user has permissions
      return canEdit(user.hierarchies, doc._id);
    } else {
      return false;
    }
  }
});

// Returns true if one hierarchy in hierarchies is the same or a parent of hierId
var canEdit = function (hierarchies, hierId) {
  var result = false;
  _.every(hierarchies, function(h){
    result = methods.getHierarchiesRelation(hierId, h) == -1;
    return ! result;
  })
  return result;
};

Hierarchies.after.insert(function(userId, doc){
  if (!doc.parent){
    if (doc._id != ExartuConfig.TenantId) {
      seedSystemLookUps(doc._id);
      seedEmailTemplates(doc._id);
      createHouseAccount(doc);
    }
  }
});

// Users files

HierarchiesFS = new Document.Collection({
  collection: Hierarchies
});
HierarchiesFS.publish();
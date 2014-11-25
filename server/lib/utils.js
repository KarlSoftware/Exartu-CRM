systemLookUps = [];

Utils = {};

_.extend( Utils, {
  getUserHiers: function () {
    var userHierarchies = [];
    _.forEach( Meteor.user().hierarchies, function (hierarchy) {
      var $or = Utils.filterByHiers(hierarchy, '_id');
      userHierarchies = userHierarchies.concat($or);
    });

    return Hierarchies.find({$or: userHierarchies}).fetch();
  },
  getUserHierId: function(userId) {
    if (!userId)
      return undefined;

    var user = Meteor.users.findOne({
      _id: userId
    });

    if (!user)
      return undefined;

    return user.currentHierId;
  },
  getHierTreeRoot: function (hier) {
    var parts = hier.split('-');
    var root = parts[0];
    var index = 1;
    while( root === ExartuConfig.SystemHierarchyId) {
      root += '-' + parts[index];
      index++;
    }
    return root;
  },
  filterByHiers: function (hier, key) {
    var accumulated = '';
    var ors = [];
    var key = key || 'hierId';

    var hierIdSplitted = hier.split('-');
    var userHiersIds = hierIdSplitted.splice(1, hierIdSplitted.length - 1);
    _.each(userHiersIds, function (part) {
      accumulated = accumulated + (accumulated ? '-' : '') + part;
      var aux={};
      aux[key] = {
        $regex: '^' + ExartuConfig.SystemHierarchyId + '-' + accumulated + '$'
      };
      ors.push(aux)
    });
    var aux={};
    aux[key] = {
      $regex: '^' + hier + '.*'
    };

    ors.push(aux);

    return ors;
  },
  filterCollectionByUserHier: function(c, options) {
    options = options || {};

    var currentHier = Utils.getUserHierId(this.userId);
    if (!currentHier) {
      return false;
    }

    var hierarchiesQuery = {
      $or: Utils.filterByHiers(currentHier, options.hierIdKeyName)
    };

    var selector = c._cursorDescription.selector;
    if (selector.$or) {
      selector.$and = [];
      selector.$and.push({ $or: selector.$or });
      selector.$and.push(hierarchiesQuery);
      delete selector.$or;
    } else {
      _.extend(selector, hierarchiesQuery);
    }

    return c;
  },
  getLocationDisplayName: function (location) {
    return !location ? '' : (
    (location.address  || '' ) + ' '  +
    (location.address1 || '' ) + ', ' +
    (location.city     || '' ) + ', ' +
    (location.state    || '' ) + ', ' +
    (location.country  || '' ));
  }
});
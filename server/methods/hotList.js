Meteor.methods({
    'addHotList': function (hotList) {
    // Validate data
    check(hotList, {
      displayName: String,
      category: String
    });

    try {
      return HotListManager.addHotList(hotList);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  'hotListTextMessageSend': function (msg, id) {
      return HotListManager.hotListTextMessageSend(msg,id);
  },
  'getValidResponseMembers': function(hotlist){
     var hotlistMembers = hotlist.members;
     var validMembers = [];
     _.forEach(hotlistMembers, function(m){
       var result = HotLists.findOne({_id:{$ne: hotlist._id},dateCreated:{$gte:  hotlist.dateCreated}, members:{$in: [m]}  })
       if(!result){
         validMembers.push(m);
       }
     });
    return validMembers;
  },
  'updateHotList': function(hotlist){
    try {
      return HotListManager.updateHotList(hotlist);
    } catch (err) {
      throw new Meteor.Error(err.message);
    }
  },

  'findHotList': function (categories, text) {
    return Utils.filterCollectionByUserHier2(Meteor.userId(), HotLists.find({
      category: {$in: categories},
      displayName: {$regex: ".*" + text + ".*", $options: 'i'}
    },{
      displayName: 1
    })).fetch();
  },
  'addMembersToHotList': function (hotListId, membersId) {
    return HotListManager.addToHotlist(hotListId, membersId);
  },
  'removeFromHotList': function (hotListId, memberId) {
    return HotListManager.removeFromHotList(hotListId, memberId);
  },
  'addMembersToHotListFromQuery': function (hotListId, filter) {
    // us the filter to get the contactables ids an call addToHotlist
    var membersId = _.pluck(ContactablesView.find(filter, {_id:1}).fetch(),'_id');

    return HotListManager.addToHotlist(hotListId, membersId);
  }
});
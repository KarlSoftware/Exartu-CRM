LookupsManagementController = RouteController.extend({
  template: 'lookUpsManagement',
onAfterAction: function() {
    var title = 'Settings',
      description = 'Lookup configurations, etc';
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
  },
   waitOn: function () {
    return HierarchiesHandler;
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('lookUpsManagement');
  }
});

var query = new Utils.ObjectDefinition({
  reactiveProps: {
   searchString: {},
   lookUpCode: {},
   lookUpActions: []
  }
});
var defaultUpdateDep = new Deps.Dependency;

var injectTestData= function()
    {
        if (  Contactables.find().count()>10)
        {
            var msg1="It looks like you've already been creating data quite a bit of data in this tenancy, so I'm a bit afraid to ";
            var msg1=msg1+ "do it here.  Have development do it for you with Meteor.call(\'loadDemoData\')";
            alert(msg1);
            return;
        }
        if (confirm('Inject test data into this tenancy node?'))
        Meteor.call('loadDemoData');
    };


Template.selectLookUpType.lookUpTypes = function() {
  var lookUpTypes = [];
  _.forEach(Enums.lookUpTypes, function(subType){
    _.forEach(subType, function(item){
      lookUpTypes.push(item)
    })
  });
//  query.lookUpCode.value = lookUpTypes[0].code;
//  var items= Template.lookUpsManagement.items();
  return _.sortBy(lookUpTypes,'displayName');

};




Template.selectLookUpType.isSelected = function(id){
  return (this.value || this._id) ==id;
};

Template.selectLookUpType.events = {
  'change': function(e) {
      query.lookUpCode.value = parseInt(e.currentTarget.value);
  }
};

Template.searchLookUpItem.searchString = function() {
  return query.searchString;
};
Template.lookUpsManagement.getId= function(row)
{
    return row._id;
}
Template.lookUpsManagement.getLookUpActions= function()
{
  defaultUpdateDep.depend();
  var lookUpActions = [];
  _.forEach(Enums.lookUpTypes, function(subType){
    _.forEach(subType, function(item){

        if (item.lookUpCode == query.lookUpCode.value)
        {
          lookUpActions = item.lookUpActions;
        }
    })
  });

  return lookUpActions;

}


Template.selectLookUpType.lookUpActions=function()
{
    defaultUpdateDep.depend();
}

Template.lookUpsManagement.items = function() {
  defaultUpdateDep.depend();
  var q = { lookUpCode: query.lookUpCode.value};
  if (query.searchString.value)
    q.$or = [
      {
        displayName: {
          $regex:  query.searchString.value ,
          $options: 'i'
        }
      }
    ];

  var hier = Hierarchies.findOne();
  return LookUps.find(q,
    {
      transform: function(item) {
        Utils.reactiveProp(item,'editMode',false);
        Utils.reactiveProp(item,'editActionMode',false);
        item.errMsg = '';
        return item;
      },
      sort: {displayName: 1}
    }
  );
};

Template.lookUpsManagement.events = {
    'click .btn-injectTestData': function(){
        injectTestData();
    },
  'change .set-default': function(e) {
    var item = this;
    if (e.target.checked){
      Meteor.call('setLookUpDefault', item.lookUpCode, item._id);
      defaultUpdateDep.changed();
    }else{
      $(e.target).prop('checked', true);
    }
  },
  'click .edit': function(){
    this.editMode = ! this.editMode;
  },
    'click .editAction': function(){
        this.editActionMode = ! this.editActionMode;
    },
  'click .cancel': function(){
    this.editMode = false;
  },
    'click .cancelAction': function(){
        this.editActionMode = false;
    },
  'click .save': function(e, ctx){
    var displayName= ctx.$('#' + this._id).val();
    if (!displayName) return;
    LookUps.update({_id: this._id},{ $set: { displayName: displayName } });
    this.editMode = false;
  },
  'click .save_lookUpAction': function(e, ctx){
        var newLookUpAction=ctx.$('#' + this._id+'newLookUpAction').val();
        var lookup=LookUps.findOne({_id: this._id});
        if (lookup.lookUpActions==null)  lookup.lookUpActions=[];
        lookup.lookUpActions=_.without(lookup.lookUpActions, newLookUpAction) ;
        lookup.lookUpActions.push(newLookUpAction);
        LookUps.update({_id: this._id},{$set: {lookUpActions: lookup.lookUpActions}} );
        this.editActionMode=false;
  },

  'change .inactive': function(e){
    LookUps.update({ _id: this._id }, { $set: { inactive: e.target.checked } });
  },
  'click .remove-tag': function(tag) {
      var id=tag.target.id;
      var action=this.toString();
      var item=LookUps.findOne({_id:id});
      var newActions=_.without(item.lookUpActions, action) ;
      LookUps.update({_id: id},{$set: {lookUpActions: newActions}});
  }
};

Template.addNewLookUpItem.events({
  'click #add-item': function() {
          var newValue = $('#new-item').val();
          var lookUpCode = query.lookUpCode.value;
          if (!newValue)
              return;
          if (confirm('Add new item ' + newValue)) {
              LookUps.insert({
                  displayName: newValue,
                  lookUpCode: lookUpCode,
                  hierId: Meteor.user().hierId
              });
              $('#new-item')[0].value=null;
          };
  }
});

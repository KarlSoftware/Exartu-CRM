EditMode = {
  val: false,
  dep: new Deps.Dependency,
  show: function () {
    this.val = true;
    this.dep.changed();
  },
  hide: function () {
    this.val = false;
    this.dep.changed();
  }
};

Object.defineProperty(EditMode, "value", {
  get: function () {
    this.dep.depend();
    return this.val;
  },
  set: function(newValue) {
    this.val = newValue;
    this.dep.changed();
  }
});

var contactable = {};
var hideTaxID = new ReactiveVar(false);

Template.contactableDetailBox.helpers({
  created:function(){
    EditMode.hide();
  },
  isSelected: function(value1, value2){
    return value1==value2
  },
  contactable: function() {
    contactable = new dType.objInstance(this, Contactables);
    return contactable;
  },
  editMode : function() {
    return EditMode.value;
  },
  editModeColor: function() {
    return EditMode.value? '#008DFC' : '';
  },
  fetchStatusOptions: function () {
    return this.options.map(function (status) {
      return {id: status._id, text: status.displayName};
    });
  },
  onSelectedStatus: function () {
    return function (newStatus) {
      var ctx = Template.parentData(2);
      ctx.property._value = newStatus;
    }
  },
  hideTaxID: function () {
    return hideTaxID.get();
  }
});

Template.contactableDetailBox.events = {
  'click #edit-mode': function() {
    if (EditMode.value) {
      EditMode.hide();
      contactable.reset();
    }
    else
      EditMode.show();
  },
  'click #save-details': function() {
    if (!contactable.validate()) {
      contactable.showErrors();
      return;
    }
    contactable.save(function(err) {
      if (!err) {
        EditMode.hide();
//        contactable.reset();
        GAnalytics.event("/contactable", "Edit contactable details", contactable.getUpdate() != {}? 'With changes' : 'Without changes');
      }
    });
  },
  'click #cancel-details': function() {
    EditMode.hide();
    contactable.reset();
  },
  'click .showHideTaxId': function () {
    hideTaxID.set(! hideTaxID.get());
  }
};
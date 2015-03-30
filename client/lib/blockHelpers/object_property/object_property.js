UI.registerHelper('objectProperty', function() {
  var self = this;
  var template = {};
  if (self.property==null)
    {
        console.log('unknown object passed to registerHelper.  did you spell the field name correctly',self);
        return null;
    }
  switch(self.property.fieldType) {
    case Utils.ReactivePropertyTypes.array:
      template = Template.object_property_multiple;
      template.helpers({values: function() {
        return this.property.value;
      }});
      break;
    case  Utils.ReactivePropertyTypes.lookUp:
      template = Template.object_property_lookup;
      template.helpers({isEditable: function() {
        return self.editable;
      }});
      break;
    case  Utils.ReactivePropertyTypes.date:
      template = Template.object_property_date;
      template.helpers({isEditable: function() {
        return self.editable;
      }});
      break;
    case Utils.ReactivePropertyTypes.boolean:
      template = Template.object_property_checkbox;
      template.helpers({value: function() {
        return this.property.value;
      }});
      break;
    case Utils.ReactivePropertyTypes.availability:
      template = Template.object_property_availability;
      template.helpers({values: function() {
        return this.property.value;
      }});
      break;
    default:{
      if (self.editable !== undefined) {
        template = Template.object_property_single_editable;
        template.helpers({isEditable: function() {
          return self.editable;
        }});
      }
      else
        template = Template.object_property_single;
      }
      template.helpers({error: function() {
        if (_.isObject(this.property.error)){
          return this.property.error.hasError? this.property.error.message : ''
        }else{
          return this.property.error;
        }
      }});
      template.helpers({hasError: function(){
        return !this.property.error.hasError? '': 'object-property-error';
      }});
  }

  return template;
});

Template.object_property_lookup.events = {
  'change select': function(e, ctx) {
    ctx.data.property.value = e.target.value=='null'? null: e.target.value;
  }
};
Template.object_property_lookup.helpers({
  options: function(){

    //todo: create helper in utils
    return LookUps.find({lookUpCode: this.property.lookUpCode, inactive: { $not: { $in: [true]}}});
  },
  displayName: function(){
    if (this.property.value == null) 
      return 'Not Set';
    
    return LookUps.findOne({_id: this.property.value}) ? LookUps.findOne({_id: this.property.value}).displayName : 'Unknown';
  }
})

Template.object_property_date.events = {
  'changeDate .date': function (e, ctx) {
    ctx.data.property.value = e.date;
  }
};

Template.object_property_single.events = {
  'change .prop-input': function(e) {
    this.property.value = e.target.value;
  }
};

Template.object_property_single_editable.events = {
  'change .prop-input': function(e, ctx) {
    if(e.target.type=='number'){
      ctx.data.property.value = Number.parseFloat(e.target.value) || 0;
    }else{
      ctx.data.property.value = e.target.value;
    }
  }
};

Template.object_property_checkbox.events = {
  'change .prop-input': function(e, ctx) {
    ctx.data.property.value = e.target.checked;
  }
};
var newNoteLinks=[];
var originalLinks=[];
var typeDep= new Deps.Dependency();
var linkedDep= new Deps.Dependency();


//<editor-fold desc="helper functions">
var getEntity= function(link){
  return Utils.getEntityFromLink(link);
}
var link=function(link){
  if (_.findWhere(newNoteLinks,{
    id: link.id
  }))
    return;
    console.log('pushlink',link);
  newNoteLinks.push(link);
}

var addNote=function (e, ctx) {
    var content=ctx.$('#note-input').val();
    if (_.isEmpty(content)) {
      $('#add-note-feedback').text("Please enter a note");
      return;
    }
    Notes.insert({
      content: content,
      links: newNoteLinks,
      userId: Meteor.userId()
    }, function (err, result) {

      newNoteLinks= _.clone(originalLinks);
      linkedDep.changed();
      if (!err) {
        ctx.$('#note-input').val('');
        GAnalytics.event("/contactable", "Add note");
      }
    });
}
//</editor-fold>

Template.contactableNotesAdd.created=function(){

  originalLinks=[{
    type: this.data.type.value,
    id: Session.get('entityId')
  }];
  newNoteLinks=[];
  if (this.data.type){
    link({
      type: this.data.type.value,
      id: Session.get('entityId')
    })
  };
}

Template.contactableNotesAdd.helpers({
  types: function(){
    return _.map(_.keys(Enums.linkTypes),function(key){
      return Enums.linkTypes[key];
    })
  },
  getEntity: getEntity,
  entities:function(){
    typeDep.depend();
    var selectedType= $('#typeSelect').val();
    selectedType=parseInt(selectedType);
    return Utils.getEntitiesFromType(selectedType);
  },
  linkedEntities: function(){
    linkedDep.depend();
    return newNoteLinks;
  }
});

Template.contactableNotesAdd.events({
  'keypress #note-input': function(e, ctx){
    if (e.which == 13 && !e.shiftKey) {
      // Read enter key press to add a note. Show a message if note is empty and hide it when
      // the user add a non-empty value.
      e.preventDefault();

      addNote(e, ctx);


      if (_.isEmpty(e.currentTarget.value)) {
        $('#add-note-feedback').text("Please enter a note");
        return;
      }

      Meteor.call('addContactableNote', Session.get('entityId'), {
        content: e.currentTarget.value
      }, function (err, result) {
        if (!err) {
          e.currentTarget.value = '';
          GAnalytics.event("/contactable", "Add note");
        }
      });
    }
    else  {
      // Hide warning message when user enter a non-empty value
      if (!_.isEmpty(e.currentTarget.value))
        $('#add-note-feedback').text("");
    }
  },
  'click .add-note-btn': addNote,
  'change #typeSelect': function(){
    typeDep.changed();
  },
  'click #linkEntity':function(){
    var type= $('#typeSelect').val();
    type= parseInt(type);
    var entity= $('#entitySelect').val();
    if (!_.isNumber(type) || ! entity) return;

    link({
      type: type,
      id: entity
    });
    linkedDep.changed();
  }
});




Template.contactableNotesList.notesCounts = function() {
  return this.entity? this.entity.notes.length : 0;
}
Template.contactableNotesList.getEntity = getEntity;
Template.contactableNotesList.getUrl = function(link){
    return Utils.getHrefFromLink(link);
};


Template.contactableNotesList.getNotes = function () {
    return Notes.find({links: { $elemMatch: { id: Session.get('entityId') } }});
}

Template.contactableNotesList.notes = function () {
  var temp = _.clone(this.entity? this.entity.notes || [] : []);
  return temp.reverse();

};
Template.contactableNotesAdd.events({
  'keypress #note-input': function (e) {
    if (e.which == 13 && !e.shiftKey) {
      // Read enter key press to add a note. Show a message if note is empty and hide it when
      // the user add a non-empty value.
      e.preventDefault();

      if (_.isEmpty(e.currentTarget.value)) {
        $('#add-note-feedback').text("Please enter a note");
        return;
      }
      console.log(Session.get('entityId'));
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
  }
});

Template.contactableNotesList.notesCounts = function() {
  return this.entity? this.entity.notes.length : 0;
}

Template.contactableNotesList.notes = function () {
  var temp = _.clone(this.entity? this.entity.notes || [] : []);
  return temp.reverse();
};
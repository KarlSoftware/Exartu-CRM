Template.noteItem.helpers({
  noteClass: function () {
    return 'note-' + this.state + (this.inactive ? ' inactive' : '');
  },
  hasLinks: function () {
    if (!this.links) return false;
    return this.links.length;
  },
  getHref: function () {
     return Utils.getHrefFromLink(this);
  },
  isMe: function () {
    return (Meteor.userId() == this._id) ? 'text-info' : '';
  },
  fromEmployee: function () {
    if (Session.get('entityId'))
    {
      var c = Contactables.findOne({_id: Session.get('entityId')});
      if (c) {
        var empUser = c.user;
        return empUser && empUser === this.userId;
      }
    }
  },
  displayEmployeeName: function () {
    var emp = Contactables.findOne({_id: Session.get('entityId')});
    return emp.displayName;
  }
});

Template.noteItem.events({
  'click .editNote': function () {
    Utils.showModal('addEditNote', this)
  },
  'click .deleteNoteRecord': function () {
    var id = this._id;

    Utils.showModal('basicModal', {
      title: 'Delete note',
      message: 'Are you sure you want to delete this note?',
      buttons: [{label: 'Cancel', classes: 'btn-default', value: false}, {
        label: 'Delete',
        classes: 'btn-danger',
        value: true
      }],
      callback: function (result) {
        if (result) {
          Meteor.call('removeNote', id);
        }
      }
    });
  }
});
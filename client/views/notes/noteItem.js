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
    getEntity: function () {
        return Utils.getEntityFromLink(this);
    },
    isMe: function () {
        return (Meteor.userId() == this._id) ? 'text-info' : '';
    },
    capMsglength: function () {
        var lastWord = this.msg.indexOf(' ', 299);
        return lastWord === -1 ? this.msg : this.msg.substring(0, lastWord) + '...';
    },
    fromEmployee: function () {
        var e = Contactables.findOne({_id: Session.get('entityId')});
        if (!e) return false;
        var empUser= e.userId;
        return empUser && empUser === this.userId;
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
                    Notes.remove({_id: id});
                }
            }
        });
    },
    //'click .editNoteRecord': function () {
    //    // Open edit mode
    //    this.isEditing.set(!this.isEditing.get());
    //}
});
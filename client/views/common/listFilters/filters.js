// Entity type
Template.filter_entityType.helpers({
    typeOptionClass: function (option) {
        var selectedType = UI._parentData(1).selected;
        return selectedType.value == option.name ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    }
});

Template.filter_entityType.events = {
    'click .typeSelect': function () {
        var selectedType = UI._parentData(0).selected;
        if (selectedType.value == this.name) {
            selectedType.value = null;
        } else {
            selectedType.value = this.name;
        }
        selectedType.dep.changed();
    }
};


// LookUp
Template.filter_lookUp.helpers({
    cb: function () {
        var self = this;
        return function (lookUpId) {
            self.lookUpValue.value = lookUpId;
        }
    }
});


// Inactive
Template.filter_inactive.helpers({
    showInactive: function () {
        return this.showInactive.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    }
});

Template.filter_inactive.events = {
    'click #show-inactives': function () {
        this.showInactive.value = !this.showInactive.value;
    }
};

// CreatedDate
var setDateCreatedFilter = function (value) {
    if (this.selectedLimit.value == value)
        this.selectedLimit.value = undefined;
    else
        this.selectedLimit.value = value;
};


Template.filter_dateCreated.helpers({
    recentOptions: function () {
        return Global.timeLimits;
    },
    recentOptionClass: function (option) {
        return this.selectedLimit.value == option ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    }
});
Template.filter_dateCreatedISO.helpers({
    recentOptionsISO: function () {
        return Global.timeLimitsISO;
    },
    recentOptionClass: function (option) {
        return this.selectedLimit.value == option ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    }
});

Template.filter_dateCreated.events = {
    'click #recent-day': function () {
        setDateCreatedFilter.call(this, Global.timeLimits.day);
    },
    'click #recent-week': function () {
        setDateCreatedFilter.call(this, Global.timeLimits.week);
    },
    'click #recent-month': function () {
        setDateCreatedFilter.call(this, Global.timeLimits.month);
    },
    'click #recent-quarter': function () {
        setDateCreatedFilter.call(this, Global.timeLimits.quarter);
    },
    'click #recent-year': function () {
        setDateCreatedFilter.call(this, Global.timeLimits.year);
    }
};
Template.filter_dateCreatedISO.events = {
    'click #recent-day': function () {
        setDateCreatedFilter.call(this, Global.timeLimitsISO.day);
    },
    'click #recent-week': function () {
        setDateCreatedFilter.call(this, Global.timeLimitsISO.week);
    },
    'click #recent-month': function () {
        setDateCreatedFilter.call(this, Global.timeLimitsISO.month);
    },
    'click #recent-quarter': function () {
        setDateCreatedFilter.call(this, Global.timeLimitsISO.quarter);
    },
    'click #recent-year': function () {
        setDateCreatedFilter.call(this, Global.timeLimitsISO.year);
    }
};


// Tags
var addTag = function () {


    if (!selectedValue)
        return;

    if (_.indexOf(this.tags.value, selectedValue) != -1)
        return;

    this.tags.insert(selectedValue);

};
Template.filter_tags.events = {
    'click .add-tag': function () {
        addTag.call(this);
    },
    'keypress #new-tag': function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            addTag.call(this);
        }

    },
    'click .remove-tag': function () {
        var tags = UI._parentData(0).tags;
        tags.remove(this.value);
    },
    'click .focusAddTag': function () {
        $('#new-tag')[0].focus();
    }
};

var selectedValue = ""

Template.filter_tags.helpers({
    getTags: function () {
        return function (string) {
            var self = this;

            //todo: calculate method
            Meteor.call('apiGetAllTags', string, function (err, result) {
                if (err)
                    return console.log(err);

                self.ready(_.map(result, function (r) {
                        return {text: r.tags, id: r.tags};
                    })
                );
            });
        };
    },
    tagsChanged: function () {
        var self = this;
        return function (value) {
            self.value = value;
            selectedValue = value;
        }
    },
    defaultValue: function () {
        var self = this;
        return function (cb) {
           cb("");
        };
    }

});


// Created By
Template.filter_createdBy.helpers({
    showMineOnly: function () {
        return this.showMineOnly.value ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    }
});

Template.filter_createdBy.events = {
    'click #show-mineOnly': function () {
        this.showMineOnly.value = !this.showMineOnly.value;
    }
};
Template.lookupFilterActionTemplate.created = function () {
    this.data.selectedDep = new Deps.Dependency;
    this.data.selected = [];
    if (this.data.callback) {
        Meteor.autorun(_.bind(function () {
            this.data.selectedDep.depend();
            this.data.callback(_.map(this.data.selected, function (option) {
                return option.id;
            }));
        }, this));
    }
};
Template.lookupFilterActionTemplate.getOptions = function () {
    console.log('options sorted', LookUps.find({lookUpCode: this.lookUpCode}, {sort: {sortOrder: 1,displayName:1}}).fetch());
    return _.bind(function () {

        if (!this.options) {
            this.options = _.map(LookUps.find({lookUpCode: this.lookUpCode}, {sort: {sortOrder: 1,displayName:1}}).fetch(), function (lookup) {
                return {
                    id: lookup._id,
                    text: lookup.displayName,
                    sortOrder: lookup.sortOrder
                }
            });
        }

        this.selectedDep.depend();
        return _.reject(this.options, function (option) {
            return !!_.findWhere(this.selected, {id: option.id});
        }, this);
    }, this);
};
Template.lookupFilterActionTemplate.selectedValues = function () {
    this.selectedDep.depend();
    return this.selected
}
Template.lookupFilterActionTemplate.add = function () {
    return _.bind(function (value) {
        if (this.options) {
            var option = _.findWhere(this.options, {id: value});
            if (option) {
                this.selected.push(option);
                this.selectedDep.changed();
            }
        }
    }, this);
};
Template.lookupFilterActionTemplate.events({
    'click .removeSelection': function (e, ctx) {
        ctx.data.selectedDep.changed();
        ctx.data.selected.splice(ctx.data.selected.indexOf(this), 1);
    }
});

Template.select2Action.rendered = function () {
    if (this.data && _.isArray(this.data.options)) {
        var options = this.data.options;
        this.$('#input').select2({
            data: options
        });
    }
    if (this.data && _.isFunction(this.data.options)) {
        Meteor.autorun(_.bind(function () {
            var options = this.data.options();
            if (_.isArray(options)) {
                this.$('#input').select2({
                    data: options
                });
            }
        }, this));
    }
}
Template.select2Action.events({
    'select2-selected #input': function (e, ctx) {
        ctx.data && ctx.data.onSelected && ctx.data.onSelected(e.val);
    }
});
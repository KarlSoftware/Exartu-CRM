PlacementsController = RouteController.extend({
  template: 'placements',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    return [PlacementHandler, Meteor.subscribe('jobs'), Meteor.subscribe('contactables')];
  },
  onAfterAction: function() {
    var title = 'Placements',
    description = 'Manage your list here';
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
  }
});

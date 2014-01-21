Router.configure({
	before: function () {
		if (!Meteor.userId() && Router.current().route.name != 'login') {
			this.redirect('login');
		}
	}
});
Router.map(function () {
	this.route('dashboard', {
		path: '/',
		controller: 'DashboardController'
	});

	this.route('login', {
		path: '/login',
		template: 'login'
	});

	this.route('contactables', {
		path: '/contactables',
		controller: 'ContactablesController'
	});

	this.route('contactable', {
		path: '/contactable/:_id',
		controller: 'ContactableController'
	});
});
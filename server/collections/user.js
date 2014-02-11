Accounts.onCreateUser(function (options, user) {
	var hierId = '';
	var userEmail = options.email;

	if (user.services) {
		if (user.services.google) {
			//todo: check if the account is already in the database
			userEmail = user.services.google.email;
			user.emails = [{
				"address": userEmail,
				"verified": true
            }];

		}
	}
	if (!options.profile || !options.profile.hierId) {
        // if there are no hierarchies yet in the db, then this is give this user all roles including systemadministrator
        if (!Hierarchies.findOne())
        {
            userRoles=[];
            _.forEach(Roles.find().fetch(),function(role)
            {
                userRoles.push(role.name);
            });
            user.roles=userRoles;
            user.permissions=adminMethods.getPermissions(user);
        }
		hierId = Meteor.call('createHier', {
			name: userEmail.split('@')[0]
		});
	} else
		hierId = options.profile.hierId;

	user.hierId = hierId;


	Hierarchies.update({
		_id: user.hierId
	}, {
		$addToSet: {
			users: user._id
		}
	});

	return user;
});

/*
 * extending the user data that is sended to the client
 */
Meteor.publish("userData", function () {

	var user = Meteor.users.findOne({
		_id: this.userId
	});
	if (!user)
		return;

	return Meteor.users.find({
		hierId: user.hierId
	}, {
		fields: {
			'username': 1,
			'emails': 1,
			'services.google.picture': 1,
			"hierId": 1,
			"createdAt": 1,
			"roles": 1
		}
	});
});

Meteor.publish("users", function () {
	return Meteor.users.find();
});

Meteor.methods({
	addHierUser: function (user, hierId) {
		hierId = hierId || Meteor.user().hierId;
		var options = {};
		options.username = user.username;
		options.email = user.email;
		options.password = user.password;
		options.profile = {
			hierId: hierId,
			// more information from user
		}
		var userId = Accounts.createUser(options);

		_.forEach(user.roles, function (rol) {
			Roles.addUsersToRoles(userId, rol);
		})

		return userId;
	},
	getUserInformation: function (userId) {
		var user = Meteor.users.findOne({
			_id: userId
		});
		var info = {};

		info.username = user.username || undefined;
		if (user.emails)
			info.email = user.emails[0].address;
		if (user.services) {
			if (user.services.google) {
				info.picture = user.services.google.picture;
			}
		}

		console.dir(info);
		return info;
	}
});
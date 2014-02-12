Template.login.rendered = function () {

    var viewmodel = function () {
        var self = this;

        self.errorMessage = ko.observable();

        self.email = ko.observable();
        self.password = ko.observable();

        self.loginWith = function (serviceName) {
            if (Meteor['loginWith' + serviceName])
                Meteor['loginWith' + serviceName]({}, function () {
                    Router.go('/');
                });
        }

        self.loginWithPassword = function () {
            Meteor.loginWithPassword({
                email: self.email()
            }, self.password(), function (err, result) {
                if (err)
                    self.errorMessage('Something is wrong with your email or password. Try again.');
                else
                    Router.go('/');
            });
        }

        self.newAccount = ko.validatedObservable({
            username: ko.observable().extend({
                required: true,
                uniqueUserInformation: {
                    params: {
                        field: 'username'
                    },
                    message: 'Username is already in use'
                }
            }),
            password: ko.observable().extend({
                required: true
            }),
            passwordVerification: ko.observable(),
            email: ko.observable().extend({
                required: true,
                uniqueUserInformation: {
                    params: {
                        field: 'emails.address'
                    },
                    message: 'Email is already in use by another account'
                }
            }),
        })

        self.newAccount().passwordVerification.extend({
            areSame: {
                params: self.newAccount().password,
                message: "Confirm password must match password"
            }
        });

        self.isValidating = ko.computed(function () {
            return this.newAccount().username.isValidating() || this.newAccount().email.isValidating();
        }, this);

        self.createNewAccount = function () {
            if (self.isValidating())
                return;

            if (!self.newAccount.isValid())
                self.newAccount.errors.showAllMessages();

            Accounts.createUser(_.omit(ko.toJS(self.newAccount()), 'passwordVerification'), function (err, result) {
                if (!err)
                    Router.go('/');
            });
        }

        return self;
    };

    helper.applyBindings(viewmodel, 'loginVM');

    // HTML Events

    var login = $('#loginform');
    var recover = $('#recoverform');
    var register = $('#registerform');
    var login_recover = $('#loginform, #recoverform');
    var login_register = $('#loginform, #registerform');
    var recover_register = $('#recoverform, #registerform');
    var loginbox = $('#loginbox');
    var userbox = $('#user');
    var animation_speed = 300;

    $(document).ready(function () {

        var loc = window.location + '';
        var ee = loc.split('#');

        if (ee[1] == 'recoverform' && ee[1] != undefined) {
            loginbox.css({
                'height': '183px'
            });
            $('#loginform, #registerform').css({
                'z-index': '100',
                'opacity': '0.01'
            });
            $('#recoverform').css({
                'z-index': '200',
                'opacity': '1',
                'display': 'block'
            });
        } else if (ee[1] = 'registerform' && ee[1] != undefined) {
            loginbox.css({
                'height': '280px'
            });
            login_recover.css({
                'z-index': '100',
                'opacity': '0.01'
            });
            register.css({
                'z-index': '200',
                'opacity': '1',
                'display': 'block'
            });
        }

        $('.flip-link.to-recover').click(function () {
            switch_container(recover, login_register, 183);
        });
        $('.flip-link.to-login').click(function () {
            switch_container(login, recover_register, 255);
        });
        $('.flip-link.to-register').click(function () {
            switch_container(register, login_recover, 280);
        });

        $('#loginform').submit(function (e) {
            var thisForm = $(this);
            var userinput = $('#username');
            var passinput = $('#password');
            if (userinput.val() == '' || passinput.val() == '') {
                highlight_error(userinput);
                highlight_error(passinput);
                loginbox.effect('shake');
                return false;
            } else {
                e.preventDefault();
                loginbox.animate({
                    'top': '+=100px',
                    'opacity': '0'
                }, 250, function () {
                    $('.user_name').text(userinput.val());
                    userbox.animate({
                        'top': "+=75px",
                        'opacity': '1'
                    }, 250, function () {
                        setTimeout(function () {
                            thisForm.unbind('submit').submit();
                        }, 600);
                    });
                });
                return true;
            }
        });

        $('#username, #password').on('keyup', function () {
            highlight_error($(this));
        }).focus(function () {
            highlight_error($(this));
        }).blur(function () {
            highlight_error($(this));
        });
    });

    function highlight_error(el) {
        if (el.val() == '') {
            el.parent().addClass('has-error');
        } else {
            el.parent().removeClass('has-error');
        }
    }

    function switch_container(to_show, to_hide, cwidth) {
        to_hide.css('z-index', '100').fadeTo(animation_speed, 0.01, function () {
            loginbox.animate({
                'height': cwidth + 'px'
            }, animation_speed, function () {
                to_show.fadeTo(animation_speed, 1).css('z-index', '200');
            });
        });
    }
};
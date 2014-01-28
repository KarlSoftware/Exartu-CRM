Template.header.rendered = function () {
    //	switch (Router.current().route.name) {
    //	case 'dashboard':
    //		$('#dashboardLink').addClass("active");
    //		break;
    //	case 'contactables':
    //		$('#contactablesLink').addClass("active");
    //		break;
    //	case 'jobs':
    //		$('#jobsLink').addClass("active");
    //		break;
    //	};

    var ul = $('#sidebar > ul');
    var ul2 = $('#sidebar li.open ul');

    var initialized = false;
    // === jPanelMenu === //
    var jPM = $.jPanelMenu({
        menu: '#sidebar',
        trigger: '#menu-trigger'
    });

    $("html").niceScroll({
        hideraildelay: 1,
        zindex: 9999,
        horizrailenabled: false
    });

    // === Resize window related === //
    $(window).resize(function () {
        if ($(window).width() > 480 && $(window).width() < 769) {
            ul2.css({
                'display': 'none'
            });
            ul.css({
                'display': 'block'
            });
        }

        if ($(window).width() <= 480) {
            ul.css({
                'display': 'none'
            });
            ul2.css({
                'display': 'block'
            });
            if (!$('html').hasClass('jPanelMenu')) {
                jPM.on();
                $('#jPanelMenu-menu').niceScroll();
                $('#jPanelMenu-menu').getNiceScroll().resize();
            }

            if ($(window).scrollTop() > 35) {
                $('body').addClass('fixed');
            }
            $(window).scroll(function () {
                if ($(window).scrollTop() > 35) {
                    $('body').addClass('fixed');
                } else {
                    $('body').removeClass('fixed');
                }
            });
        } else {
            jPM.off();
        }
        if ($(window).width() > 768) {
            ul.css({
                'display': 'block'
            });
            ul2.css({
                'display': 'block'
            });
            $('#user-nav > ul').css({
                width: 'auto',
                margin: '0'
            });
        }
        $('html').getNiceScroll().resize();
    });


    if ($(window).width() <= 480) {
        if ($(window).scrollTop() > 35) {
            $('body').addClass('fixed');
        }
        $(window).scroll(function () {
            if ($(window).scrollTop() > 35) {
                $('body').addClass('fixed');
            } else {
                $('body').removeClass('fixed');
            }
        });
        jPM.on();
        $('#jPanelMenu-menu').niceScroll({
            zindex: '9999'
        });
        $('#jPanelMenu-menu').getNiceScroll().resize();
    }

    if ($(window).width() > 480) {
        ul.css({
            'display': 'block'
        });
        jPM.off();
    }
    if ($(window).width() > 480 && $(window).width() < 769) {
        ul2.css({
            'display': 'none'
        });
    }



    // === Tooltips === //
    $('.tip').tooltip();
    $('.tip-left').tooltip({
        placement: 'left'
    });
    $('.tip-right').tooltip({
        placement: 'right'
    });
    $('.tip-top').tooltip({
        placement: 'top'
    });
    $('.tip-bottom').tooltip({
        placement: 'bottom'
    });


    $(document).on('click', '.dropdown > a', function (e) {
//        debugger;
        e.preventDefault();
        var submenu = $(this).siblings('ul');
        var li = $(this).parents('li');
        if ($(window).width() > 480) {
            var submenus = $('#sidebar li.submenu ul');
            var submenus_parents = $('#sidebar li.submenu');
        } else {
            var submenus = $('#jPanelMenu-menu li.submenu ul');
            var submenus_parents = $('#jPanelMenu-menu li.submenu');
        }

        if (li.hasClass('open')) {
            if (($(window).width() > 768) || ($(window).width() <= 480)) {
                submenu.slideUp();
            } else {
                submenu.fadeOut(250);
            }
            li.removeClass('open');
        } else {
            if (($(window).width() > 768) || ($(window).width() <= 480)) {
                submenus.slideUp();
                submenu.slideDown();
            } else {
                submenus.fadeOut(250);
                submenu.fadeIn(250);
            }
            submenus_parents.removeClass('open');
            li.addClass('open');
        }
        $('html').getNiceScroll().resize();
    });

    $('.go-full-screen').click(function () {
        backdrop = $('.white-backdrop');
        wbox = $(this).parents('.widget-box');
        /*if($('body > .white-backdrop').length <= 0) {
			$('<div class="white-backdrop">').appendTo('body');
		}*/
        if (wbox.hasClass('widget-full-screen')) {
            backdrop.fadeIn(200, function () {
                wbox.removeClass('widget-full-screen', function () {
                    backdrop.fadeOut(200);
                });
            });
        } else {
            backdrop.fadeIn(200, function () {
                wbox.addClass('widget-full-screen', function () {
                    backdrop.fadeOut(200);
                });
            });
        }
    });
}
Template.header.hasPicture = function () {
    var user = Meteor.user()
    return user && user.services && user.services.google && user.services.google.picture
}
Template.header.picture = function () {
    return Meteor.user().services.google.picture
}
Template.header.events = {
    'click #dashboardLink': function () {
        // Remove class from previous navigation link
        $('.ats-navItem .active').removeClass('active');
        // Add class
        $('#dashboardLink').addClass('active');
    },
    'click #contactablesLink': function () {
        // Remove class from previous navigation link
        $('.ats-navItem .active').removeClass('active');
        // Add class
        $('#contactablesLink').addClass('active');
    },
    'click #jobsLink': function () {
        // Remove class from previous navigation link
        $('.ats-navItem .active').removeClass('active');
        // Add class
        $('#jobsLink').addClass('active');
    }
}
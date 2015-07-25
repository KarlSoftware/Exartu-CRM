var allNotes = [];
var mineQuery = {};
var showMineOnly = true;
var showToday = true;
var showNext = false;
var showPrev = false;
var showByMonth = true;
var showByWeek = false;
var showByDay = false;
var start;
var end;
var init = false;
var loadingCount = false;
var currentMonth = new ReactiveVar();
var currentDay = new Date();
CalendarController = RouteController.extend({
    template: 'agendaBox'
});

var startEndDep = new Deps.Dependency();
var loadingDep = new Deps.Dependency();

var handler;
Meteor.autorun(function () {
    // depend start, end
    startEndDep.depend();

    if (!start || !end || (showMineOnly== null)) return;

    loadingCount = true;
    loadingDep.changed();

    handler && handler.stop();
    init = false;
    handler = Meteor.subscribe("calendarNotes", start, end, showMineOnly, function () {
        rerender();
        loadingCount = false;
        loadingDep.changed();
    });

});
var observe;
Template.agendaBox.created = function() {
    var calendarDiv = $('.fc');
    startEndDep.changed();
    observe = CalendarNotes.find({}).observe({
      //TODO: to make it completly reactive it need the add and remove
      changed: function (newDocument, oldDocument) {
        var calendarDiv = $('.fc');
        var event = _.find(calendarDiv.fullCalendar('clientEvents'), function (ev) {
          return oldDocument._id == ev.id;
        });

        event.title = newDocument.msg;
        event.start = newDocument.remindDate;
        event.end = newDocument.remindDate;
        calendarDiv.fullCalendar('updateEvent', event);
        renderDay();

      },
      removed: function (oldDocument) {
          var calendarDiv = $('.fc');
          calendarDiv.fullCalendar('removeEvents', function (event) {
            debugger;
            $('#'+event.id+'_circle').remove();
            return event.id == oldDocument._id;
          })
        }
    });
};

Template.agendaBox.destroyed = function() {
  observe && observe.stop();
  handler && handler.stop();
  handler = undefined;
};

var rerender = _.debounce(function () {
    var calendarDiv = $('.fc');
    calendarDiv.fullCalendar( 'refetchEvents');
    calendarDiv.find('.fc-month-view > table').addClass('table');
    calendarDiv.find('.fc-month-view table .fc-row.fc-widget-header').attr('style', '');
    init = true;
},650);

var renderDay = function(){
  var calendarDiv = $('.fc');
  var events = [];
  if(currentDay != null) {
    var eventCount = calendarDiv.fullCalendar('clientEvents', function (eventObj) {
      if (eventObj.start.format('YYYY-MM-DD') == currentDay.format('YYYY-MM-DD')) {
        events.push(eventObj);
        return true;
      } else {
        return false;
      }
    }).length;
  }

  //alert('we have '+eventCount+' events');
  //console.log(events);

  //console.log('intra aici');
  var html = '';
  if( $('.calendar-widget .list-type-8').length )
    $('.calendar-widget .list-type-8').html('');
  else
    $('.calendar-widget').append('<ul class="list-type-8"></ul>');

  _.each(events, function(item){
    var event = Notes.findOne({_id: item.id});
    html = '<li><a class="item-icon item-icon-notes item-icon-sm" id="'+item.id+'" href="#"><i class="icon-pencil-3" id="'+item.id+'"></i></a><div class="item-content"><div class="title"><a href="#" id="'+item.id+'">';
    html += item.title;

    html += '</a></div></div></li>';
    $('.calendar-widget .list-type-8').append(html);
  });
}

Template.agendaBox.helpers({
    options: function () {
        return {
            id: 'dashboard-calendar',
            monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'],
            nextDayThreshold: "00:00:00",
            firstDay: 1,
            fixedWeekCount: false,
            eventLimit: true,
            header:false,
            timeFormat:'HH:mm',
            events: function (start, end, timezone, callback) {
                callback(_.map(CalendarNotes.find({}).fetch(), function (t) {
                        return {id: t._id,title: t.msg, start: t.remindDate, end: t.remindDate, description:""  } ;
                }));
            },
            viewRender: function (view, element) {
                //searching by class because id isn't working
                start = view.start.local().toDate();
                end = view.end.local().toDate();
                startEndDep.changed();
           },
            eventRender: function( event, element, view ){
                var currentDate = event.start.format('YYYY-MM-DD');
                var calendarDiv = $('.fc');
                var dayCell = calendarDiv.find('td[data-date="'+currentDate+'"]');

                if (! dayCell.find('.day-tasks').length) {
                  dayCell.append('<div class="day-tasks"></div>');
                }

                if( dayCell.find('.day-tasks i.fa-circle').length < 3 ) {
                    dayCell.find('.day-tasks').append('<i id="'+event.id+'_circle" class="fa fa-circle"></i>');
                }
            },
            dayRender: function(date, cell) {
                cell.html('<a href="#">'+date.format('D')+'</a>');
            },
            dayClick: function(date, jsEvent, view) {
                currentDay = date;
                renderDay();
            },
            eventAfterAllRender: function(view){
                var calendarDiv = $('.fc');
                var calendarDate = calendarDiv.fullCalendar('getDate');
                var html = '';

                if( calendarDate && calendarDate.format('YYYY-MM') == moment().format('YYYY-MM') ) {
                  html = "Today <span>" + moment().format('D') + "<sup>`th</sup> " + moment().format('MMMM') + "</span>";
                  currentDay = calendarDate;
                  renderDay();
                }
                else {
                  currentDay = null;
                  renderDay();
                  html = calendarDiv.fullCalendar('getView').title;
                }
                currentMonth.set(html);

               // cleanup the calendar view
                calendarDiv.find('.fc-content-skeleton').remove();
                calendarDiv.find('.fc-other-month a').remove();
                calendarDiv.find('.fc-other-month .day-tasks').remove();
            },
            loading: function(bool) {
                var calendarDiv = $('.fc');
                if (bool){
                    calendarDiv.find('.notes-navi .current').hide();
                }
                else{
                    calendarDiv.find('.notes-navi .current').show();
                }
            }
        }
    },
    notesCount: {
        title:function(){
            loadingDep.depend();
            if(loadingCount){
                return ""
            }
            return "notes";
        },



        count: function(){
            loadingDep.depend();
            if(loadingCount){
                return "loading..."
            }
            return CalendarNotes.find({}).count();
        }
    },
    query: function () {
        return query;
    },
    showMineOnly: function () {
        startEndDep.depend();
        return showMineOnly ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showToday: function(){
        startEndDep.depend();
        return showToday ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
        //cambiar el return
    },
    showNext: function(){
        startEndDep.depend();
        return showNext ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showPrev: function(){
        startEndDep.depend();
        return showPrev ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showByMonth: function(){
        startEndDep.depend();
        return showByMonth ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
        //cambiar el return
    },
    showByWeek: function(){
        startEndDep.depend();
        return showByWeek ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    showByDay: function(){
        startEndDep.depend();
        return showByDay ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-default';
    },
    currentMonth: function(){
        return currentMonth.get();
    }
});


Template.agendaBox.events = {
    'click .list-type-8': function(e){
       var note = CalendarNotes.findOne({_id: e.target.id});
       if(note){
         Utils.showModal('addEditNote', note);
       }
      loadingDep.changed();
    },
    'click #next-month-btn': function () {

        var calendarDiv = $('.fc');
        calendarDiv.fullCalendar('next');
        var today = new Date();
        if((today>start) && (today<end)){
            showToday = true;
            showNext = false;
            showPrev = false;
        }
        else if(today>end){
            showToday = false;
            showNext = false;
            showPrev = true;
        }
        else if(today<start){
            showToday = false;
            showNext = true;
            showPrev = false;
        }
        startEndDep.changed();
    },
    'click #prev-month-btn': function () {

        var calendarDiv = $('.fc');
        calendarDiv.fullCalendar('prev');
        var today = new Date();
        if((today>start) && (today<end)){
            showToday = true;
            showNext = false;
            showPrev = false;
        }
        else if(today>end){
            showToday = false;
            showNext = false;
            showPrev = true;
        }
        else if(today<start){
            showToday = false;
            showNext = true;
            showPrev = false;
        }
        startEndDep.changed();
    }
};
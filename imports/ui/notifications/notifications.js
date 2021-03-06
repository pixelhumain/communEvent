import './notifications.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import { NotificationHistory } from '../../api/notification_history.js';

Template.notifications.helpers({
  notificationsCount () {
    return NotificationHistory.find({}).count();
  }
});

Template.notificationsList.helpers({
  notifications () {
    return NotificationHistory.find({
  		'expiration': {
  			$gt: new Date()
  		}
  	}, {
  		sort: {
  			'addedAt': -1
  		}
  	});
  }
});

Template.notificationsList.events({
    'click .removeMe': function(event, template) {
      event.preventDefault();
        Meteor.call('markRead', this._id, function(err, resp) {
            //console.log('mark as read response', resp)
        });
    },
    'click .clickGo': function(event, template) {
      event.preventDefault();
        Meteor.call('registerClick', this._id);
        Router.go(this.link);
    }
})

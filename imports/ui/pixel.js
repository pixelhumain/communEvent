import './pixel.html'

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { $ } from 'meteor/jquery';

import { NotificationHistory } from '../api/notification_history.js';

import './settings/settings.js';
import './notifications/notifications.js';

Template.layout.onCreated(function(){
  Meteor.subscribe('notificationsUser');
});

const scanQrACtion = (result) => {
  let qr = {};
  if (result.text.split('#').length === 2) {
    let urlArray = result.text.split('#')[1].split('.');
    if (urlArray && urlArray.length === 4) {
      qr.type = urlArray[0];
      qr._id = urlArray[3];
    }
  } else {
    qr=JSON.parse(result.text);
  }

  if(qr && qr.type && qr._id){
    if(qr.type=="person"){
      Meteor.call('followPersonExist',qr._id, function (error, result) {
        if (!error) {
          window.alert("Connexion à l'entité réussie");
        }else{
          window.alert(error.reason);
          console.log('error',error);
        }
      });
    }else if(qr.type=="event"){
      Meteor.call('saveattendeesEvent',qr._id, function (error, result) {
        if (!error) {
          window.alert("Connexion à l'entité réussie");
          Router.go("newsList",{scope:'events',_id:qr._id});
        }else{
          window.alert(error.reason);
          console.log('error',error);
        }
      });
    }else if(qr.type=="organization"){
      Meteor.call('connectEntity',qr._id,'organizations', function (error, result) {
        if (!error) {
          window.alert("Connexion à l'entité réussie");
        }else{
          window.alert(error.reason);
          console.log('error',error);
        }
      });
    }else if(qr.type=="project"){
      Meteor.call('connectEntity',qr._id,'projects', function (error, result) {
        if (!error) {
          window.alert("Connexion à l'entité réussie");
        }else{
          window.alert(error.reason);
          console.log('error',error);
        }
      });
    }
  }else{
  Router.go("newsList",{scope:'events',_id:result.text});
  }
};

Template.scanner_page.onRendered(function(){
  //this.$('#reader').html5_qrcode_stop();
  this.$('#reader').html5_qrcode(function(data){
           // do something when code is read
           $('#reader').html5_qrcode_stop();
           console.log(JSON.stringify(data));
           IonModal.close();
           let result = {};
           result.text = data;
           scanQrACtion(result);
      },
      function(error){
          //show read errors
          //window.alert("Scanning failed: " + error);
          return ;
      }, function(videoError){
          //the video stream could be opened
          //window.alert("Video failed: " + error);
          return ;
      }
  );
});


Template.scanner_page.events({
  'click .stopscan' : function(event, template) {
    $('#reader').html5_qrcode_stop();
  },
});

Template.layout.events({
  'change .all-read input' : function(event, template) {
    Meteor.call('allRead');
  },
  'click .scanner' : function(event, template){
    event.preventDefault();
    if(Meteor.isCordova){
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if(result.cancelled==false && result.text && result.format=='QR_CODE'){
            scanQrACtion(result);
          }else{
            return ;
          }
        },
        function (error) {
          window.alert("Scanning failed: " + error);
          return ;
        }
      );
    }
    return ;
  }
});

Template.layout.helpers({
  notificationsCount () {
    return NotificationHistory.find({}).count();
  },
  allReadChecked (notificationsCount) {
    if(notificationsCount==0) return "checked";
  }
});

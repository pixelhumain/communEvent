import './changeposition.html';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Location } from 'meteor/djabatav:geolocation-plus';

//submanager
import { listEventsSubs } from '../../api/client/subsmanager.js';

let pageSession = new ReactiveDict('pageChangePosition');

/*Template.changePosition.onCreated(function () {
    pageSession.set( 'cities', null );
    pageSession.set( 'city', null );
    pageSession.set('filter', null );
  });*/

Template.changePosition.onRendered(function () {
      this.autorun(function(c) {
        if(pageSession.get("filter")){
        let query = pageSession.get("filter");
        Meteor.call('searchCities',query,function(error, result){
          console.log(result);
          if(result){
            pageSession.set( 'cities', result );
          }
        });
      }
      });
  });

  Template.changePosition.helpers({
    cities: function () {
      return pageSession.get("cities");
    },
    countCities: function () {
      return pageSession.get("cities") && pageSession.get("cities").length;
    },
    filter: function () {
      return pageSession.get("filter");
    },
    citie: function () {
      return Session.get("citie");
    },
  });

  Template.changePosition.events({
    'keyup #search, change #search': function(event,template){
      if(event.currentTarget.value.length>2){
        pageSession.set( 'filter', event.currentTarget.value);
      }
    },
    'click .city': function(event,template){
      var self = this;
      var onOk=IonPopup.confirm({title:TAPi18n.__('Position'),template:TAPi18n.__('Utiliser la position de cette ville'),
      onOk: function(){
        Session.set( 'city', self);
        if(self.geoShape && self.geoShape.coordinates){
          Session.set('radius', false);          
        }
        Session.set('geolocate',  false);
        Location.setMockLocation({
          latitude : self.geo.latitude,
          longitude : self.geo.longitude,
          updatedAt : new Date()
        });
        //clear cache
        listEventsSubs.clear();
        Router.go('listEvents');
    }
    });

    }
  });

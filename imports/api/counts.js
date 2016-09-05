import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

export const Counts = new Mongo.Collection('counts');

Counts.get = function countsGet (name) {
  var count = this.findOne(name);
  return count && count.count || 0;
};

Counts.has = function countsHas (name) {
  return !!this.findOne(name);
};

Template.registerHelper('getPublishedCount', function(name) {
    return Counts.get(name);
  });

  Template.registerHelper('hasPublishedCount', function(name) {
    return Counts.has(name);
  });

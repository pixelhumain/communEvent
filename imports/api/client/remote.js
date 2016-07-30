import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { Accounts , AccountsClient } from 'meteor/accounts-base';
import { Tracker } from 'meteor/tracker';
import { Router } from 'meteor/iron:router';

if(Meteor.settings.public.remoteUrl && Meteor.isClient){
  var connection = DDP.connect(Meteor.settings.public.remoteUrl);
  ClientAccounts = new AccountsClient({connection: connection});
  Meteor.connection = connection;
  Accounts.connection = connection;
  Accounts.users = ClientAccounts.users;
  Meteor.users = ClientAccounts.users;
  var methods = ["subscribe", "call", "apply", "methods", "status", "reconnect", "disconnect", "onReconnect"];
  methods.forEach(function (method) {
    Meteor[method] = function () {
      return connection[method].apply(connection, arguments);
    };
  });

  Tracker.autorun(function () {
    var token = Meteor._localStorage.getItem('_storedLoginToken');

    if (token) {
      ClientAccounts.loginWithToken(token, function (err) {
        if (!err) {
          console.log('loginWithToken ', token);
        }
        else {
          console.log('loginWithTokenError ', err)
        }
      });

      ClientAccounts.onLogin(function(){
        var path = Router.current().route.path(this);
        console.log(path);
        if (path!='/' && path=="/login")
        history.back();
      });
    }
  });

  Tracker.autorun(function () {
    var user = ClientAccounts.user();
    if (user === null) {
      user = undefined;
    }
    if (user) {
      Meteor._localStorage.setItem('_storedLoginToken', Accounts._storedLoginToken());
    }
  });

}

function AnalyticsTracker() {

  this.initialize = function() {
    console.log('AnalyticsTracker initializing...');

    var _this = this;
    this.asyncList = [];

    mixpanel.init("3f9ed715a30d310093e324e07cac1f30", {
      loaded: function() {
        for (var i = 0; i < _this.asyncList.length; i++) {
          func = _this.asyncList[i];
          func()
        }
      }
    })


    // this.currentUser = currentUser
    // this.setUpUser();

    console.log('AnalyticsTracker initialized');
  }

  this.alias = function(newId, oldId){
    this.delayed(function(){
      mixpanel.alias(newId, oldId);
    });
  }

  this.delayed = function(callback){
    if (!mixpanel.__loaded){
      this.asyncList.push(callback)
    } else {
      callback()
    }
  }

  this.getProperty = function(propertyName){
    if (mixpanel.__loaded){
      return mixpanel.get_property(propertyName);
    }
  }

  this.identify = function(userId){
    this.delayed(function(){
      return mixpanel.identify(userId);
    });
  }

  // setPeopleProperties(dataHash) {
  //   var _this = this;
  //   this.delayed(function(){
  //     if (_this.currentUser != null && _this.currentUser.id != null) {
  //       mixpanel.identify(_this.currentUser.id);
  //     }
  //     return mixpanel.people.set(dataHash);
  //   });
  // };

  // setSuperProperties(dataHash) {
  //   var _this = this;
  //   this.delayed(function(){
  //     if (_this.currentUser != null && _this.currentUser.id != null) {
  //       mixpanel.identify(_this.currentUser.id);
  //     }
  //     return mixpanel.register(dataHash);
  //   });
  // };

  this.track = function(event, args) {
    var _this = this;
    this.delayed(function(){
      // args = $.extend(args, {'logged_in' : _this.userLoggedIn()});
      return mixpanel.track(event, args);
    });
  };

  // trackCampaign(campaign, mixpanelProperties) {
  //   var _this = this;
  //   this.delayed(function(){
  //     mixpanelProperties["logged_in"] = _this.userLoggedIn();
  //     return mixpanel.track(campaign, mixpanelProperties);
  //   });
  // };

  this.trackPageview = function(location, action) {
    var _this = this;
    this.delayed(function(){
      return mixpanel.track(location, {
        'action': action,
        'logged_in': _this.currentUser != null ? true : false
      });
    });
  };

  // userLoggedIn(){
  //   return this.currentUser != null ? true : false;
  // };

}

// AnalyticsTracker.prototype.initialize = function(currentUser) {
//   console.log('AnalyticsTracker initializing...');

//   this.currentUser = currentUser
//   this.setupUser();

//   console.log('AnalyticsTracker initialized');
// };

// AnalyticsTracker.prototype.alias = function(newId, oldId) {
//   this.delayed(function(){
//     mixpanel.alias(newId, oldId);
//   });
// };

// AnalyticsTracker.prototype.delayed = function(callback) {
//   if (!mixpanel.__loaded){
//     this.asyncList.push(callback)
//   } else {
//     callback()
//   }
// }

// AnalyticsTracker.prototype.get_property = function(propertyName) {
//   if (mixpanel.__loaded){
//     return mixpanel.get_property(propertyName);
//   }
// }

// AnalyticsTracker.prototype.identify = function(userId) {
//   this.delayed(function(){
//     return mixpanel.identify(userId);
//   });
// };

// AnalyticsTracker.prototype.setupUser = function() {
  // var _this = this;
  // this.delayed(function(){
  //   var created_at, first_seen, now, timeString, yesterday;

  //   // set the even property and super property
  //   var distinctId = AnalyticsTracker.get_property('distinct_id').toString();
  //   // If mixpanel distinctId, we need to parse hex string into form.
  //   if (distinctId.indexOf('-') >= 0) {
  //     var parts = distinctId.split('-');
  //     distinctId = parseInt(parts[parts.length - 1], 16);
  //   }

  //   mixpanel.people.set_once({
  //     "$even": ((distinctId) % 2 == 0)
  //   })
  //   mixpanel.register({
  //     "Even": ((distinctId) % 2 == 0)
  //   })


  //   if (_this.currentUser != null) {

  //     // Identify user.
  //     mixpanel.identify(_this.currentUser.id);

  //     // Set user properties.
  //     mixpanel.people.set({
  //       "$first_name": _this.currentUser.first_name,
  //       "$last_name": _this.currentUser.last_name,
  //       "$created": _this.currentUser.created_at,
  //       "$email": _this.currentUser.email,
  //       "$purchased": _this.currentUser.purchased
  //     });

  //     // Set purchased super property
  //     mixpanel.register({
  //       "Purchased": _this.currentUser.purchased || mixpanel.get_property("Purchased")
  //     });
  //   }


  //   // Set first seen property and super property
  //   first_seen = mixpanel.get_property("First seen");
  //   created_at = _this.currentUser ? _this.currentUser.created_at : first_seen;

  //   yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);

  //   // If we have seen the user before.
  //   if (first_seen != null) {

  //     // Set up variable
  //     timeString = null;

  //     // Set the first seen date to be the earlier of the first
  //     // time mixpanel recognized this user and when this user
  //     // was created.
  //     if (new Date(created_at) < new Date(first_seen)) {

  //       timeString = new Date(created_at).toISOString();

  //       mixpanel.people.set({
  //         "$first_seen": timeString
  //       });
  //       mixpanel.register({
  //         "First seen": timeString
  //       });
  //     } else {
  //       timeString = new Date(first_seen).toISOString();

  //       mixpanel.people.set({
  //         "$first_seen": timeString
  //       });
  //       mixpanel.register({
  //         "First seen": timeString
  //       });
  //     }

  //     // Set new/returning user property
  //     if (new Date(timeString) < yesterday) {
  //       return mixpanel.register({
  //         "New user": false
  //       });
  //     } else {
  //       return mixpanel.register({
  //         "New user": true
  //       });
  //     }

  //   } else if (created_at != null) {
  //     timeString = new Date(created_at).toISOString();
  //     mixpanel.people.set({
  //       "$first_seen": timeString
  //     });
  //     mixpanel.register({
  //       "First seen": timeString
  //     });

  //     // Set new/returning user property
  //     if (created_at < yesterday) {
  //       return mixpanel.register({
  //         "New user": false
  //       });
  //     } else {
  //       return mixpanel.register({
  //         "New user": true
  //       });
  //     }
  //   } else {

  //     now = new Date().toISOString();

  //     mixpanel.people.set_once({
  //       "$first_seen": now,
  //       "$purchased": false
  //     });

  //     return mixpanel.register_once({
  //       "First seen": now,
  //       "New user": true,
  //       "Purchased": false
  //     });
  //   }
  // });
// };

// AnalyticsTracker.prototype.setPeopleProperties = function(dataHash) {
//   var _this = this;
//   this.delayed(function(){
//     if (_this.currentUser != null && _this.currentUser.id != null) {
//       mixpanel.identify(_this.currentUser.id);
//     }
//     return mixpanel.people.set(dataHash);
//   });
// };

// AnalyticsTracker.prototype.setSuperProperties = function(dataHash) {
//   var _this = this;
//   this.delayed(function(){
//     if (_this.currentUser != null && _this.currentUser.id != null) {
//       mixpanel.identify(_this.currentUser.id);
//     }
//     return mixpanel.register(dataHash);
//   });
// };

// AnalyticsTracker.prototype.track = function(event, args) {
//   var _this = this;
//   this.delayed(function(){
//     args = $.extend(args, {'logged_in' : _this.userLoggedIn()});
//     return mixpanel.track(event, args);
//   });
// };

// AnalyticsTracker.prototype.trackCampaign = function(campaign, mixpanelProperties) {
//   var _this = this;
//   this.delayed(function(){
//     mixpanelProperties["logged_in"] = _this.userLoggedIn();
//     return mixpanel.track(campaign, mixpanelProperties);
//   });
// };

// AnalyticsTracker.prototype.trackPageview = function(location, action) {
//   var _this = this;
//   this.delayed(function(){
//     return mixpanel.track(location, {
//       'action': action,
//       'logged_in': _this.currentUser != null ? true : false
//     });
//   });
// };

var tracker = new AnalyticsTracker();
tracker.initialize();

window.AnalyticsTracker = tracker;


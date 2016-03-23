
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
*/
// Parse.Cloud.define("reminder", function(request, response) {

Parse.Cloud.afterSave("Feed", function(request) {
  // get the user of the Feed comment
  console.log(request);
  var user = request.user;
  console.log(user);
  var friendlyName = "@" + user.get('friendlyName').toLowerCase();
  var entityType = request.object.get('entityType');
  var entityName = request.object.get('entityName');
  var kpi = request.object.get('kpi');
  var channel = '#' + entityType.toLowerCase() + " #" + entityName.toLowerCase() + " #" + kpi.toLowerCase();
  var commentText = request.object.get('comment');

  var message = friendlyName + ": " + commentText + " " + channel;

  var pushQuery = new Parse.Query(Parse.Installation);
  pushQuery.notEqualTo('userObjectId', user.id);

  // find all users except the requeste.user
  // var pushQuery = new Parse.Query(Parse.User);
  // pushQuery.notEqualTo("username", user.get('username'));
  console.log(pushQuery);
  Parse.Push.send({
    // where: userQuery, // Set our Installation query
    where: pushQuery, // Set our Installation query
    data: {
      alert: message,
      badge: "Increment",
      // sound: "Bell.caf",
      sound: "default",   // "" doesn't work, use "default"
    }
  }, {
    success: function() {
      // console.log("Beeper morning reminder sent!");
    },
    error: function(error) {
      console.error("Beeper Feed aftersave send failure");
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});

// Parse background job
Parse.Cloud.job("morningReminder", function(request, status) {
  var query = new Parse.Query(Parse.Installation);
  Parse.Push.send({
      where: query,
      data: {
        alert: "Hey, don't forget to check your KPIs today!",
        badge: "Increment",
        // sound: "Bell.caf",
        sound: "default",   // "" doesn't work, use "default"
      }
    }, { success: function() {
      status.success("Beeper morning reminder sent!");
    // Push was successful
    }, error: function(error) {
      status.error("Beeper monring reminder send failure");
    // Handle error
    }
  });
});

// Parse test background job
Parse.Cloud.job("pushTest", function(request, status) {
  var query = new Parse.Query(Parse.Installation);
  Parse.Push.send({
      where: query,
      data: {
        alert: "This is a test of Parse iOS push notificaton!",
        badge: "Increment",
        // sound: "Bell.caf",
        sound: "default",   // "" doesn't work, use "default"
      }
    }, { success: function() {
      status.success("Beeper test push sent!");
    // Push was successful
    }, error: function(error) {
      status.error("Beeper test push send failure");
    // Handle error
    }
  });
});

/*
Parse.Cloud.job("morningReminder", function(request, status) {
  var query = new Parse.Query(Parse.Installation);
  Parse.Push.send({
      where: query,
      data: {
        alert: "Great news, yesterday's Beeper performance data is ready!"
      }
    }, { success: function() {
      status.success("Beeper morning reminder sent!");
    // Push was successful
    }, error: function(error) {
      status.error("Beeper monring reminder send failure");
    // Handle error
    }
  });
});
*/

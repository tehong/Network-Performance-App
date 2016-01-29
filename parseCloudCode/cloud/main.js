
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
*/
// Parse.Cloud.define("reminder", function(request, response) {

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


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*
Parse.Cloud.define("hello", function(request, response) {
  console.log("hello call success");
  response.success("Hello world!");
});
*/

function saveUserPassword(userEmail, newPassword, callback) {
  // Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Parse.User);
  query.equalTo("email", userEmail);

  query.first({
      success: function(theUser){

        if (!theUser) {
          callback.error('Unable to find email "' + userEmail + '" in our system.');
          return;
        }
        theUser.set("password", newPassword);
        theUser.set("isUpdatePassword", true);
        theUser.setPassword(newPassword);

        theUser.save(null,{
            success: function(theUser){
                // The user was saved correctly
                callback.success(theUser);
            },
            error: function(SMLogin, error){
                callback.error("Unable to set a new password.");
            },
            useMasterKey: true
        });
      },
      error: function(error){
          callback.error("Unable to query your email in our system.");
      },
      useMasterKey: true
  });
}

Parse.Cloud.define("resetUserPassword", function(request, response) {

// response.success("resetUserPassword called!");

  // var client = require('cloud/myMailModule-1.0.0.js');
  var client = require('./myMailModule-1.0.0.js');
  client.initialize('sandbox2b785383c4144bbfa77aadf236ee7141.mailgun.org', 'key-50ae8c67309ad8248834e8fc24a9af30');
//  console.log("email client initilized");

  var toEmail = request.params.email;

  // to generat a new random password => see http://stackoverflow.com/questions/9719570/generate-random-password-string-with-requirements-in-javascript
  var newPassword = Math.random().toString(36).substring(3, 9);  // extract char 3-8


  saveUserPassword(toEmail, newPassword, {
    success: function(user) {

      console.log("saveUserPassword call success");
      var username = user.get('username');

      var emailHtml =
"Forgot your password? No big deal!<br><br>\
Here’s a temporary one you can use to log back into Beeper.<br>\
Remember, this is just temporary, you’ll be prompted to change your password at login.<br><br>\
Username: " + username + "<br>Password: " + newPassword + "<br><br>\
This is part of the procedure to create a new password on the system. If you DID NOT request a new password then please ignore this email and your password will remain the same.<br><br>\
Thank you,<br>\
The 3TEN8 Team!";

        var emailText =
"Forgot your password? No big deal!\n\n\
Here’s a temporary one you can use to log back into Beeper.\n\
Remember, this is just temporary, you’ll be prompted to change your password at login.\n\n\
Username: " + username + "\nPassword: " + newPassword + "\n\n\
This is part of the procedure to create a new password on the system. If you DID NOT request a new password then please ignore this email and your password will remain the same.\n\n\
Thank you,\n\
The 3TEN8 Team!";

      client.sendEmail({
        to: toEmail,
        from: "support@3ten8.com",
        subject: "Your temporary password for Beeper. (no reply)",
        text: emailText,
        html: emailHtml,
      }).then(function(httpResponse) {
        response.success("Your username and new password have been sent to your registered email address...");
      }, function(httpResponse) {
        console.error(httpResponse);
        response.error("unable to send email.");
      });
    },
    error: function(error) {
      console.log("saveUserPassword call failure");
      response.error(error);
    },
    useMasterKey: true
  });
});

Parse.Cloud.afterSave("Feed", function(request) {
  // get the user of the Feed comment
  // console.log(request);
  var user = request.user;
  // console.log(user);
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
  // console.log(pushQuery);
  /*
  if (Parse.Push.send) {
    console.log("pushing comment...");
  }
  */

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
      console.log("Beeper Feed aftersave send successful");
    },
    error: function(error) {
      console.error("Beeper Feed aftersave send failure");
      throw "Got an error " + error.code + " : " + error.message;
    },
    useMasterKey: true
  });

  // console.log("pushing comment ended.");
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
    },
    useMasterKey: true
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
    },
    useMasterKey: true
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

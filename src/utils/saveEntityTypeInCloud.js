/**
 * created by ehong 02/20/2016
 */
'use strict';

var Parse = require('parse/react-native');

function saveEntityTypeInCloud(entityType: string) {
  var Entity = Parse.Object.extend("Entity");
  var entityArray = [];
  var entitySaveArray = [];
  // first find all Entities in the Entity table
  var query = new Parse.Query(Entity);
  query.find({
    success: function(results) {
      var found = false;
      if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
          var entityObj = results[i]
          if (entityObj.get('entityType') === entityType) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        var entity = new Entity();
        entity.set('entityType', entityType)
        entity.save(null, {
          success: function(entity) {
            // Execute any logic that should take place after the object is saved.
            console.log('New Entity object created with objectId: ' + entity.id);
          },
          error: function(entity, error) {
            // error is a Parse.Error with an error code and message.
            console.log('Failed to create new Entity object, with error code: ' + error.message);
          }
        });
      }
    },
    error: function(error) {
      // error is an instance of Parse.Error.
    }
  });
}

module.exports = saveEntityTypeInCloud;

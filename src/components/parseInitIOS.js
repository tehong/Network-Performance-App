/**
 * This native module sets up the iOS Parse with the right appID and appKey.
 * It also set up the proper channel for subscription in the ParseInit
 */
'use strict';

var ParseInit = require('react-native').NativeModules.ParseInit;

function parseInitIOS(appId: string, appKey: string) {
  ParseInit.init(appId, appKey);
}

module.exports = parseInitIOS;

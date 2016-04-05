/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */
'use strict';

var Mixpanel = require('react-native').NativeModules.RNMixpanel;

function mixpanelTrack(trackPoint: string, trackProperties: object, user: object) {
  var properties = trackProperties?trackProperties:{};
  if (global.BeeperVersion) {
    properties["Beeper Release"] = global.BeeperVersion;
  }
  /*  No need since we now have Mixpanel.identify and Mixpanel.peopleSet
  if (user) {
    var username = user.get("username");
    var name = user.get('firstName') + ' ' + user.get('lastName');
    if (properties === null) {
      var properties = {}; // empty dictionary
    }
    properties["name"] = name;
    properties["username"] = username;
  }
  */
  if (global.currentUser) {
    Mixpanel.peopleSet(
      {
        "Last Event Seen": trackPoint,
      }
    );
  }
  Mixpanel.track(trackPoint, properties);
}

module.exports = mixpanelTrack;

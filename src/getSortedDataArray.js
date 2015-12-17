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

var getThreshold = require('./getThreshold');
var getDailyAverage = require('./getDailyAverage');

function getSortedDataArray(dataArray: Array<any>): Array<any> {
  dataArray.sort(
    function(a,b) {
      // red = -11, yellow = 0, green = 1 , we need to to put red in lower place i.e. smaller at the front of the array
      var aStatus = 0;  // default to red
      var bStatus = 0;  // default to red
      var kpi = a["kpi"];
      // temp. fix the category of the zone and sector service API results
      if (a["geoEntity"] !== "area") {
        if (kpi.indexOf("Downlink") !== -1) {
          a["category"] = "Downlink";
        }
        if (kpi.indexOf("Uplink") !== -1) {
          a["category"] = "Uplink";
        }
        kpi = kpi.replace("Data ", "");
        kpi = kpi.replace("Downlink ", "");
        kpi = kpi.replace("Uplink ", "");
      }
      var a_redThreshold = getThreshold(a["thresholds"], "red", kpi);
      var a_greenThreshold = getThreshold(a["thresholds"], "green", kpi);
      var a_dailyAverage = getDailyAverage(a["dailyAverage"]);

      // modify the threhsold to the correct one
      a["thresholds"]['red'] = a_redThreshold;
      a["thresholds"]['green'] = a_greenThreshold;
      a["dailyAverage"] = a_dailyAverage;
      a["kpi"] = kpi;
      // get a status
      if (a_redThreshold < a_greenThreshold) {
        if (a_dailyAverage <= a_redThreshold) {
          // red
          aStatus = -1;
        } else if (a_dailyAverage >= a_greenThreshold) {
          // green
          aStatus = 1;
        }
      } else {
        // get a status
        if (a_dailyAverage >= a_redThreshold) {
          // red
          aStatus = -1;
        } else if (a_dailyAverage <= a_greenThreshold) {
          // green
          aStatus = 1;
        }
      }
      kpi = b["kpi"];
      // temp. fix the category of the zone and sector service API results
      if (b["geoEntity"] !== "area") {
        if (kpi.indexOf("Downlink") !== -1) {
          b["category"] = "Downlink";
        }
        if (kpi.indexOf("Uplink") !== -1) {
          b["category"] = "Uplink";
        }
        kpi = kpi.replace("Data ", "");
        kpi = kpi.replace("Downlink ", "");
        kpi = kpi.replace("Uplink ", "");
      }

      // get b status
      var b_redThreshold = getThreshold(b["thresholds"], "red", kpi);
      var b_greenThreshold = getThreshold(b["thresholds"], "green", kpi);
      var b_dailyAverage = getDailyAverage(b["dailyAverage"]);
      // modify the threhsold to the correct one
      b["thresholds"]['red'] = b_redThreshold;
      b["thresholds"]['green'] = b_greenThreshold;
      b["dailyAverage"] = b_dailyAverage;
      b["kpi"] = kpi;
      if (b_redThreshold < b_greenThreshold) {
        if (b_dailyAverage <= b_redThreshold) {
          // red
          bStatus = -1;
        } else if (b_dailyAverage >= b_greenThreshold) {
          // green
          bStatus = 1;
        }
      } else {
        if (b_dailyAverage >= b_redThreshold) {
          // red
          bStatus = -1;
        } else if (b_dailyAverage <= b_greenThreshold) {
          // green
          bStatus = 1;
        }
      }
      return aStatus - bStatus;
    },
  )
  return dataArray;
}

module.exports = getSortedDataArray;

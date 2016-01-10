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
      // get the relevant thresholds and dailyAverage
      var a_redThreshold = getThreshold(a["thresholds"], "red", kpi);
      var a_greenThreshold = getThreshold(a["thresholds"], "green", kpi);
      var a_dailyAverage = getDailyAverage(a["dailyAverage"]);

      // modify the threhsold to remove the signs
      a["thresholds"]['red'] = a_redThreshold;
      a["thresholds"]['green'] = a_greenThreshold;
      a["dailyAverage"] = a_dailyAverage;
      a["kpi"] = kpi;

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

      // get the relevant thresholds and dailyAverage
      var b_redThreshold = getThreshold(b["thresholds"], "red", kpi);
      var b_greenThreshold = getThreshold(b["thresholds"], "green", kpi);
      var b_dailyAverage = getDailyAverage(b["dailyAverage"]);
      // modify the threhsold to the correct one
      b["thresholds"]['red'] = b_redThreshold;
      b["thresholds"]['green'] = b_greenThreshold;
      b["dailyAverage"] = b_dailyAverage;
      b["kpi"] = kpi;

      // based on dailyAverage and the sorting direction, return the right value
      if (a_redThreshold < a_greenThreshold) {
        return a_dailyAverage - b_dailyAverage;
      } else {
        return b_dailyAverage - a_dailyAverage;
      }
    },
  )
  return dataArray;
}

module.exports = getSortedDataArray;

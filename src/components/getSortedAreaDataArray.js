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

var getSortedDataArray = require('./getSortedDataArray');
var getImageFromAverage = require('./getImageFromAverage');
var isDataEmpty = require('./isDataEmpty');


function getSortedAreaDataArray(dataArray: Array<any>): Array<any> {
  var sortedDataArray = getSortedDataArray(dataArray);
  sortedDataArray.sort(
    function(a,b) {
      // red = -11, yellow = 0, green = 1 , we need to to put red in lower place i.e. smaller at the front of the array
      var aEmpty = isDataEmpty(a["data"]);
      var bEmpty = isDataEmpty(b["data"]);      // could be that the data is not there so put that in the back
      if (aEmpty) {
        if (bEmpty) {
          return 0;
        } else {
          return 1;
        }
      }
      if (bEmpty) {
        if (aEmpty) {
          return 0;
        } else {
          return -1;
        }
      }
      var aImage = getImageFromAverage(a["dailyAverage"], a["thresholds"]["red"], a["thresholds"]["green"]);
      var bImage = getImageFromAverage(b["dailyAverage"], b["thresholds"]["red"], b["thresholds"]["green"]);

      // sorted alphbetically if the same color
      if (aImage === bImage) {
        if(a['category'] < b['category']) return -1;
        if(a['category'] > b['category']) return 1;
      // sorted by color if not equal
      } else {
        // always put red up front
        if (aImage.indexOf("Red") > -1) return -1;
        if (bImage.indexOf("Red") > -1) return 1;
        // put the yellow in front of the green
        if (aImage.indexOf("Yellow") > -1 && bImage.indexOf("Green") > -1) {
          return -1
        } else {
          // must be reverse return 1
          return 1;
        }
      }
      return 0;
    },
  )
  return sortedDataArray;
}

module.exports = getSortedAreaDataArray;
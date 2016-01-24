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
var isDataEmpty = require('./isDataEmpty');


function getSortedSectorDataArray(dataArray: Array<any>): Array<any> {
  dataArray.sort(
    function(a,b) {
      // sorted alphbetically
      var aKpiString = a["category"] + " " + a["kpi"];
      var bKpiString = b["category"] + " " + b["kpi"];
      if(aKpiString < bKpiString) return -1;
      if(aKpiString > bKpiString) return 1;
      return 0;
    },
  )
  return dataArray;
}

module.exports = getSortedSectorDataArray;

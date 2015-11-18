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

function getSortedDataArray(dataArray: Array<any>): Array<any> {
  dataArray.sort(
    function(a,b) {
      // red = 1, yellow = 0, green = -1 , we need to to put red in lower place i.e. front of the array
      var aStatus = 0;  // default to red
      var bStatus = 0;  // default to red
      // get a status
      if (a["dailyAverage"] <= a["thresholds"]["red"]) {
        // red
        aStatus = -1;
      } else if (a["dailyAverage"] >= a["thresholds"]["green"]) {
        // green
        aStatus = 1;
      }
      // if redThreshold > greeThreshold, we need to reverse the direction
      if (a["thresholds"]["red"] > a["thresholds"]["green"]) {
        aStatus = -aStatus;
      }
      // get b status
      if (b["dailyAverage"] <= b["thresholds"]["red"]) {
        // red
        bStatus = -1;
      } else if (b["dailyAverage"] >= b["thresholds"]["green"]) {
        // green
        bStatus = 1;
      }
      // if redThreshold > greeThreshold, we need to reverse the direction
      if (b["thresholds"]["red"] > b["thresholds"]["green"]) {
        bStatus = -bStatus;
      }
      return aStatus - bStatus;
    }
  )
  return dataArray;
}

module.exports = getSortedDataArray;

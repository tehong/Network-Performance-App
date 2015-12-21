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

function getThreshold(thresholds: any, thresholdName: string, kpi: string) {
  if (typeof thresholds.red !== "string") {
    switch(thresholdName) {
      case "red":
        return thresholds.red;
        break;
      case "green":
        return thresholds.green;
        break;
    }
  }
  var redDirection = ">";
  var redIndex = thresholds.red.indexOf(redDirection);
  var greenIndex = thresholds.green.indexOf(">") + 1;
  if (redIndex === -1) {
    redDirection = "<";
    redIndex = thresholds.red.indexOf(redDirection) + 1;
  } else {
    redIndex = redIndex + 1;
    // data > or < could be wrong, here is to saftgurad it.
    if (thresholds.green.indexOf("<") !== -1) {
      greenIndex = thresholds.green.indexOf("<") + 1;
    }
  }
  var redThreshold = parseFloat(thresholds.red.substring(redIndex, thresholds.red.length));
  var greenThreshold = parseFloat(thresholds.green.substring(greenIndex, thresholds.green.length));
  switch(thresholdName) {

    case "red":
      // adjust red and green to >= or <= numbers
      if (kpi.indexOf("Throughput") !== -1) {
        return redThreshold;
      }
      if (redDirection == ">") {
        return redThreshold;
      } else {
        return redThreshold === 0?0:redThreshold;
      }
      break;
    case "green":
      if (kpi.indexOf("Throughput") !== -1) {
        return greenThreshold;
      }
      if (redDirection == ">") {
        return greenThreshold === 0?0:greenThreshold;
      } else {
        return greenThreshold;
      }
      break;
  }
}

module.exports = getThreshold;

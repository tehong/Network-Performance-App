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
  // the red/green thresholds are in "< number" or "> number" string format, let's parse the actual value
  var redDirection = ">";
  var greenDirection = "<=";
  var redIndex = thresholds.red.indexOf(redDirection);
  var greenIndex = thresholds.green.indexOf(greenDirection);
  if (redIndex === -1) {
    redDirection = "<";
    greenDirection = ">=";
    redIndex = thresholds.red.indexOf(redDirection) + 1;
    greenIndex = thresholds.green.indexOf(greenDirection) + 2;
  } else {
    redIndex = redIndex + 1;
    greenIndex = greenIndex + 2;
  }
  var redThreshold = parseFloat(thresholds.red.substring(redIndex, thresholds.red.length));
  var greenThreshold = parseFloat(thresholds.green.substring(greenIndex, thresholds.green.length));
  switch(thresholdName) {

    case "red":
      return redThreshold === 0?0:redThreshold;
    case "green":
      return greenThreshold === 0?0:greenThreshold;
  }
}

module.exports = getThreshold;

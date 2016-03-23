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

function getThresholdSign(thresholds: any, thresholdName: string) {

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
  switch(thresholdName) {
    case "red":
      var redThresholdSign =
        (thresholds.red.indexOf(">=") > -1 ? "\u2265" :
        (thresholds.red.indexOf(">") > -1 ? ">" :
        (thresholds.red.indexOf("<=") > -1 ? "\u2264" :
        (thresholds.red.indexOf("<") > -1 ? "<" :
        "?"))));
      return redThresholdSign;
      break;
    case "green":
      var greenThresholdSign =
        (thresholds.green.indexOf(">=") > -1 ? "\u2265" :
        (thresholds.green.indexOf(">") > -1 ? ">" :
        (thresholds.green.indexOf("<=") > -1 ? "\u2264" :
        (thresholds.green.indexOf("<") > -1 ? "<" :
        "?"))));
      return greenThresholdSign;
      break;
  }
}

module.exports = getThresholdSign;

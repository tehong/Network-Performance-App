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
      case "green":
        return thresholds.green;
    }
  }
  // the red/green thresholds are in ">=/< number" or "<=/> number" string format, let's parse the actual value
  switch(thresholdName) {
    case "red":
      var redIndex = thresholds.red.indexOf(">=") === -1 ? thresholds.red.indexOf("<=") : thresholds.red.indexOf(">=");
      if (redIndex === -1) {
        redIndex = thresholds.red.indexOf(">") === -1 ? thresholds.red.indexOf("<") : thresholds.red.indexOf(">");
      } else {
        redIndex++;
      }
      var redThreshold = parseFloat(thresholds.red.substring(redIndex+1, thresholds.red.length));
      return redThreshold;
    case "green":
      var greenIndex = thresholds.green.indexOf(">=") === -1 ? thresholds.green.indexOf("<=") : thresholds.green.indexOf(">=");
      if (greenIndex === -1) {
        greenIndex = thresholds.green.indexOf(">") === -1 ? thresholds.green.indexOf("<") : thresholds.green.indexOf(">");
      } else {
        greenIndex++;
      }
      var greenThreshold = parseFloat(thresholds.green.substring(greenIndex+1, thresholds.green.length));
      return greenThreshold;
  }
}

module.exports = getThreshold;

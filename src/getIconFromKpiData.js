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

var getImageFromAverage = require('./getImageFromAverage');

function getIconFromKpiData(kpiKey:string, kpiData:{}): string {
  var redThreshold = kpiData.thresholds.red;
  var greenThreshold = kpiData.thresholds.green;
  var dailyAverage = kpiData.dailyAverage;
  switch(kpiKey) {
    case "data-accessibility":
      var kpiImage = "Icon_DA";
      break;
    case "data-retainability":
      var kpiImage = "Icon_DR";
      break;
    case "downlink-throughput":
      var kpiImage = "Icon_DT";
      break;
    case "uplink-throughput":
      var kpiImage = "Icon_UT";
    case "data-tnol":
      var kpiImage = "Icon_T";
      break;
    case "volte-accessibility":
      var kpiImage = "Icon_VA";
      break;
    case "volte-retainability":
      var kpiImage = "Icon_VR";
      break;
    case "cs-fallback":
      var kpiImage = "Icon_CS";
      break;
  }
  var colorBackground = (getImageFromAverage(dailyAverage, redThreshold, greenThreshold)).toLowerCase();
  if (colorBackground.indexOf("red") > -1) {
    kpiImage = kpiImage + "_Red";
  } else if (colorBackground.indexOf("yellow") > -1) {
    kpiImage = kpiImage + "_Yellow";
  } else {
    kpiImage = kpiImage + "_Green";
  }
  return kpiImage;
}

module.exports = getIconFromKpiData;

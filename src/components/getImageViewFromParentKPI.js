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

var React = require('react-native');
var {
  Image,
  StyleSheet,
} = React;

function getImageViewFromParentKPI(category: string, kpi: string): string {
  var cat = category.toLowerCase();
  if (category.toLowerCase().indexOf("uplink") > -1) {
    cat = "uplink";
  }
  if (category.toLowerCase().indexOf("downlink") > -1) {
    cat = "downlink";
  }
  var correctedKpi = kpi.replace("Data ", "");
  correctedKpi = correctedKpi.replace("Uplink ", "");
  correctedKpi = correctedKpi.replace("Downlink ", "");
  switch(correctedKpi.toLowerCase()) {
    case "accessibility":
      if (cat === "volte") {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_VA.png")}/>
        );
      } else {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_DA.png")}/>
        );
      }
      break;
    case "retainability":
      if (cat == "volte") {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_VR.png")}/>
        );
      } else {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_DR.png")}/>
        );
      }
      break;
    case "throughput":
      if (cat === "downlink") {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_DT.png")}/>
        );
      } else {
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_UT.png")}/>
        );
      }
      break;
    case "tnol":
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_T.png")}/>
        );
      break;
    case "fallback":
        return (
          <Image style={styles.kpiImage} source={require("../assets/icons/Icon_CS.png")}/>
        );
      break;
  }
}

var styles = StyleSheet.create({
  kpiImage: {
    flex: 1,
    // borderColor: "pink",
    // borderWidth: 1,
    height: 22,
    width: 36,
  },
});


module.exports = getImageViewFromParentKPI;

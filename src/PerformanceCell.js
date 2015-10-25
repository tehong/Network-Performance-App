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
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  View
} = React;

var getStyleFromScore = require('./getStyleFromScore');
var getImageSource = require('./getImageSource');
var getTextFromScore = require('./getTextFromScore');
var getImageFromAverage = require('./getImageFromAverage');
var getImageFromParentKPI = require('./getImageFromParentKPI');

var PerformanceCell = React.createClass({
  render: function() {
    var dailyAverage = this.props.market.dailyAverage;
    var redThreshold = this.props.market.threshold.red;
    var greenThreshold = this.props.market.threshold.green;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold);
    // default to yellow
    return (
      <TouchableElement style={styles.container}
          onPress={this.props.onSelect}
          onShowUnderlay={this.props.onHighlight}
          onHideUnderlay={this.props.onUnhighlight}>
        <Image style={styles.backgroundImage} source={{uri: backgroundImage, isStatic: true}}>
          <View style={styles.row}>
            {/* $FlowIssue #7363964 - There's a bug in Flow where you cannot
              * omit a property or set it to undefined if it's inside a shape,
              * even if it isn't required */}
            {this.kpiView()}
            {this.chartView()}
          </View>
        </Image>
      </TouchableElement>
    );
  },
  kpiView: function() {
    var kpiImage = getImageFromParentKPI(this.props.market.category, this.props.market.parentKpi);
    var dailyAverage = this.props.market.dailyAverage;
    var unit = this.props.market.unit;
    return(
      <View style={styles.kpiContainer}>
        <View style={styles.iconContainer}>
          <Image style={styles.kpiImage} source={{uri: kpiImage, isStatic: true}}/>
          <View style={styles.kpiSpace}></View>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.marketContainer}>
            <Text style={styles.marketTitle}>
                {this.props.market.market}
            </Text>
          </View>
          <View style={styles.kpiValueContainer}>
            <Text style={styles.category}>
              {this.props.market.category}
            </Text>
            <Text style={styles.parentKpi}>
              {this.props.market.parentKpi}
            </Text>
            <View style={styles.dailyAverage}>
              <Text style={styles.dailyValue}>
                {dailyAverage}
              </Text>
              <Text style={styles.unit}>
                {unit}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
  chartView: function() {
    return(
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <Image style={styles.chartImage} source={{uri: "BG_Chart_Bands", isStatic: true}}/>
          <View style={styles.chartSpace}></View>
        </View>
        <View style={styles.threshold}>
          <View style={styles.thresholdValue}>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>GREEN</Text>
              <Text style={styles.tv}>&gt;99%</Text>
            </View>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>YELLOW</Text>
              <Text style={styles.tv}>98-99%</Text>
            </View>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>RED</Text>
              <Text style={styles.tv}>&lt;97%</Text>
            </View>
          </View>
          <View style={styles.thresholdSpace}>
          </View>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
  },
  backgroundImage: {
    alignItems: "stretch",
  },
  row: {
    alignItems: 'flex-start',
    alignItems: "stretch",
    flexDirection: 'row',
    // borderColor: "yellow",
    // borderWidth: 2,
    height: 198,
  },
  kpiContainer: {
    flex:2,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems:'stretch',
    borderColor: "blue",
    borderWidth: 2,
    marginTop: 13,
  },
  chartContainer: {
    flex: 3,
    borderColor: "red",
    borderWidth: 2,
  },
  iconContainer: {
    flex: 2,
    flexDirection: "column",
    alignItems: 'flex-end',
    // borderColor: "purple",
    // borderWidth: 2,
  },
  textContainer: {
    flex: 5,
    flexDirection: "column",
    paddingLeft: 2,
    // borderColor: "blue",
    // borderWidth: 2,
  },
  kpiValueContainer: {
    flex:4,
    flexDirection: "column",
  },
  kpiImage: {
    flex: 1,
    // borderColor: "pink",
    // borderWidth: 1,
    height: 25,
    width: 36,
  },
  kpiSpace: {
    flex: 4,
    // borderColor: "white",
    // borderWidth: 1,
  },
  marketContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  category: {
    color: 'black',
    fontSize: 13,
    fontWeight: '600',
  },
  marketTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  parentKpi: {
    color: '#555555',
    fontSize: 16,
  },
  dailyAverage: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dailyValue: {
    color: 'white',
    fontSize: 38,
    fontWeight: '600',
  },
  unit: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  chart: {
    flex: 31,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    borderColor: "green",
    borderWidth: 2,
  },
  threshold: {
    flex: 9,
    flexDirection: "row",
    borderColor: "white",
    borderWidth: 2,
  },
  chartImage: {
    flex: 11,
    borderColor: "blue",
    borderWidth: 2,
  },
  chartSpace: {
    flex: 2,
    borderColor: "yellow",
    borderWidth: 2,
  },
  thresholdValue: {
    flexDirection: "row",
    flex: 11,
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "yellow",
    borderWidth: 2,
  },
  thresholdSpace: {
    flex: 2,
    borderColor: "green",
    borderWidth: 2,
  },
  ttContainer: {
    alignItems: "flex-start",
    borderColor: "red",
    borderWidth: 1,
  },
  tt: {
    color: "white",
    fontSize: 10,
    fontWeight: "400",
  },
  tv: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

module.exports = PerformanceCell;

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

var getImageSource = require('./getImageSource');
var getTextFromScore = require('./getTextFromScore');
var getImageFromAverage = require('./getImageFromAverage');
var getImageFromParentKPI = require('./getImageFromParentKPI');
var SparklineView= require('./SparklineView');

var PerformanceCell = React.createClass({
  render: function() {
    var dailyAverage = this.props.market.dailyAverage;
    var redThreshold = this.props.market.thresholds.red;
    var greenThreshold = this.props.market.thresholds.green;
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
  // find the Y location and Y length
  //   [0] => Y Location
  //   [1] => Y Length
  findYScale: function() {
    var yScale = [];
    var data = this.props.market.data;
    var maxY = 0.0;
    yScale[0] = 0.0;
    yScale[1] = 0.0;
    for (var i in data) {
      var item = data[i][1];
      if (item > maxY) {
        maxY = item;
      }
    }
    var minY = maxY;

    // find minY
    for (var i in data) {
      var item = data[i][1];
      if (item < minY) {
        minY = item;
      }
    }

    // This algorithm centers the redThreshold line horizontally on the chart by finding the right display location and length of y-axis

    var greenThreshold = this.props.market.thresholds.green;
    if (greenThreshold >= maxY) {
      yScale[0] = minY
      yScale[1] = (greenThreshold - minY) * 2
    } else if (greenThreshold <= minY) {
      yScale[0] = greenThreshold - (maxY - greenThreshold)
      yScale[1] = (maxY - greenThreshold) * 2
    } else if (greenThreshold - minY >= maxY - greenThreshold) {
      yScale[0] = minY
      yScale[1] = (greenThreshold - minY) * 2
    } else {
      yScale[0] = greenThreshold - (maxY - greenThreshold)
      yScale[1] = (maxY - greenThreshold) * 2
    }
    return yScale;
  },
  kpiView: function() {
    var kpiImage = getImageFromParentKPI(this.props.market.category, this.props.market.kpi);
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
                {this.props.market.name}
            </Text>
          </View>
          <View style={styles.kpiValueContainer}>
            <Text style={styles.category}>
              {this.props.market.category}
            </Text>
            <Text style={styles.kpi}>
              {this.props.market.kpi}
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
    var kpi = this.props.market.kpi;
    var redThreshold = this.props.market.thresholds.red;
    var greenThreshold = this.props.market.thresholds.green;
    var yellowLowThreshold = redThreshold + 1;
    var yellowHighThreshold = greenThreshold;
    var redDir =  redThreshold > greenThreshold?">":"<";
    var greenDir =  redThreshold > greenThreshold?"<":">";
    var unit = this.props.market.unit;
    var data = this.props.market.data;
    if (kpi.toLowerCase() == "throughput" || kpi.toLowerCase() == "fallback") {
      yellowLowThreshold = redThreshold;
    }
    var yScale = this.findYScale();
    var yMinValue = Math.round(yScale[0] * 10) / 10;
    var yMaxValue = Math.round((yMinValue + yScale[1]) * 10) / 10 ;
    var yUnit = "";
    if (yMinValue < 0) {
      yMinValue = 0;
    }
    /*
    if (unit === "%" && yMaxValue > 100) {
      yMaxValue = 100;
    }
    */
    if (unit === "%") {
      var yUnit = unit;
    }
    else {
      unit = ""
    }
    return(
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          <Image style={styles.chartImage} source={{uri: "BG_Chart_Bands", isStatic: true}}>
            <SparklineView
              greenThreshold={greenThreshold}
              yScale={yScale}
              dataArray={data}
              style={styles.hostView}
            />
          </Image>
          <View style={styles.chartSideContainer}>
            <Text style={styles.yMaxValue}>{yMaxValue}{yUnit}</Text>
            <View style={styles.threshArrowContainer}>
              <Image style={styles.threshImage} source={{uri: "Icon_Chart_Indicator", isStatic: true}}/>
              <Text style={styles.chartThresh}>{greenThreshold}{yUnit}</Text>
            </View>
            <View style={styles.yMinValueContainer}>
              <Text style={styles.yMinValue}>{yMinValue}{yUnit}</Text>
            </View>
          </View>
        </View>
        <View style={styles.threshold}>
          <View style={styles.thresholdValue}>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>GREEN</Text>
              <Text style={styles.tv}>{greenDir}{greenThreshold}{unit}</Text>
            </View>
            <View style={styles.tyContainer}>
              <Text style={styles.tt}>YELLOW</Text>
              <Text style={styles.tv}>{yellowLowThreshold}-{yellowHighThreshold}{unit}</Text>
            </View>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>RED</Text>
              <Text style={styles.tv}>{redDir}{redThreshold}{unit}</Text>
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
    // borderColor: "blue",
    // borderWidth: 2,
    marginTop: 13,
  },
  chartContainer: {
    flex: 3,
    // borderColor: "red",
    // borderWidth: 2,
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
    paddingLeft: 4,
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
  marketTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Helvetica Neue',
  },
  category: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
  },
  kpi: {
    color: 'rgba(30,30,30,0.7)',
    fontSize: 16,
    fontFamily: 'Helvetica Neue',
  },
  dailyAverage: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dailyValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
  },
  unit: {
    color: 'white',
    fontSize: 16,
    paddingTop: 5,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
  },
  chart: {
    flex: 32,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    // borderColor: "green",
    // borderWidth: 2,
  },
  threshold: {
    flex: 11,
    flexDirection: "row",
    // borderColor: "white",
    // borderWidth: 2,
  },
  chartImage: {
    flex: 20,
    // borderColor: "blue",
    // borderWidth: 2,
  },
  hostView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    // height: 100,
    // width: 100,
    // borderColor: "red",
    // borderWidth: 2,
  },
  chartSideContainer: {
    flex: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  yMaxValue: {
    flex: 4,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: 'Helvetica Neue',
    color: "rgba(60,60,60,1.0)",
  },
  yMinValueContainer: {
    flex: 4,
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  yMinValue: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: 'Helvetica Neue',
    color: "rgba(60,60,60,1.0)",
  },
  threshArrowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  threshImage: {
    flex: 1,
    height: 12,
    // width: 6,
    marginRight: 1,
    // borderColor: "purple",
    // borderWidth: 1,
  },
  chartThresh: {
    flex: 3,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: 'Helvetica Neue',
    color: "rgba(60,60,60,1.0)",
    // height: 15,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  thresholdValue: {
    flexDirection: "row",
    flex: 11,
    justifyContent: "space-between",
    alignItems: "center",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  thresholdSpace: {
    flex: 2,
    // borderColor: "green",
    // borderWidth: 2,
  },
  ttContainer: {
    flex: 17,
    alignItems: "flex-start",
    // borderColor: "blue",
    // borderWidth: 1,
  },
  tyContainer: {
    flex: 20,
    alignItems: "flex-start",
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  tt: {
    color: "rgba(255,255,255, 0.7)",
    fontSize: 11,
    fontWeight: "400",
    fontFamily: 'Helvetica Neue',
  },
  tv: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Helvetica Neue',
  },
});

module.exports = PerformanceCell;

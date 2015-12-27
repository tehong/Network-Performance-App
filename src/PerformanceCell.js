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
var getImageViewFromParentKPI = require('./getImageViewFromParentKPI');
var SparklineView= require('./SparklineView');

var PerformanceCell = React.createClass({
  render: function() {
    var dailyAverage = this.getDailyAverage();
    var redThreshold = this.getThreshold(this.props.geoArea.thresholds, "red");
    var greenThreshold = this.getThreshold(this.props.geoArea.thresholds, "green");
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold);
    // backgroundImage = require("./assets/images/" + backgroundImage + ".png");  // can't use vairables
    // default to yellow
    return (
      <View>
        <TouchableElement style={styles.container}
            onPress={this.props.onSelect}
            onShowUnderlay={this.props.onHighlight}
            onHideUnderlay={this.props.onUnhighlight}>
            {this.contentView(backgroundImage)}
        </TouchableElement>
        {this.sectorCounterView(dailyAverage, redThreshold, greenThreshold)}
      </View>
    );
  },
  getDailyAverage() {
    /*
    if (this.props.geoArea.geoEntity === "area") {
      var dailyAverage = this.props.geoArea.dailyAverage;
    } else {
    */
      var dailyAverage = parseFloat(this.props.geoArea.dailyAverage);
      /*
    }
    */
    return dailyAverage;
  },
  getThreshold(thresholds: string, thresholdName: string) {
  //  if (this.props.geoArea.geoEntity === "area") {
      switch(thresholdName) {
        case "red":
          return this.props.geoArea.thresholds.red;
          break;
        case "green":
          return this.props.geoArea.thresholds.green;
          break;
      }
    /*
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
        if (this.props.geoArea.kpi.indexOf("Throughput") !== -1) {
          return redThreshold;
        }
        if (redDirection == ">") {
          return redThreshold + 1;
        } else {
          return redThreshold === 0?0:redThreshold-1;
        }
        break;
      case "green":
        if (this.props.geoArea.kpi.indexOf("Throughput") !== -1) {
          return greenThreshold;
        }
        if (redDirection == ">") {
          return greenThreshold === 0?0:greenThreshold-1;
        } else {
          return greenThreshold + 1;
        }
        break;
    }
    */
  },
  innerContentView: function() {
    return (
      <View style={styles.row}>
        {/* $FlowIssue #7363964 - There's a bug in Flow where you cannot
          * omit a property or set it to undefined if it's inside a shape,
          * even if it isn't required */}
        {this.kpiView()}
        {this.chartView()}
      </View>
    );
  },
  // Can't use variable in the "require()" statement for some reason so had to use this utility function
  contentView: function(backgroundImage) {
    switch(backgroundImage) {
      case "BG_Red_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("./assets/images/BG_Red_KPI_Item.png")}>
            {this.innerContentView()}
          </Image>
        );
      case "BG_Green_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("./assets/images/BG_Green_KPI_Item.png")}>
            {this.innerContentView()}
          </Image>
        );
      case "BG_Yellow_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("./assets/images/BG_Yellow_KPI_Item.png")}>
            {this.innerContentView()}
          </Image>
        );
    }
  },
  getData() {
    if (this.props.geoArea.geoEntity === "area") {
      return this.props.geoArea.data;
    }

    var dataArray = this.props.geoArea.data;
    var newDataArray = [];
    for (var i=0; i < dataArray.length; i++) {
      var array = [dataArray[i][0].toString(), parseFloat(dataArray[i][1])];
      newDataArray.push(array);
    }
    return newDataArray;
  },
  // find the Y location and Y length
  //   [0] => Y Location
  //   [1] => Y Length
  findYScale: function() {
    var yScale = [];
    var data = this.getData();
    if (this.props.geoArea.geoEntity !== "area") {
    }
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
      if (item === "") {
        continue;
      }
      if (item < minY) {
        minY = item;
      }
    }

    // This algorithm centers the redThreshold line horizontally on the chart by finding the right display location and length of y-axis

    /*``
    var greenThreshold = this.props.geoArea.thresholds.green;
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
    */
    yScale[0] = minY;
    yScale[1] = maxY - minY;
    return yScale;
  },
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  kpiView: function() {
    var kpiImage = getImageViewFromParentKPI(this.props.geoArea.category, this.props.geoArea.kpi);
    var dailyAverage = this.getDailyAverage()
    var unit = this.props.geoArea.unit;
    return(
      <View style={styles.kpiContainer}>
        <View style={styles.iconContainer}>
          {kpiImage}
          <View style={styles.kpiSpace}></View>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.geoAreaContainer}>
            <Text style={styles.geoAreaTitle}>
                {this.props.geoArea.name}
            </Text>
          </View>
          <View style={styles.kpiValueContainer}>
            <Text style={styles.category}>
              {this.props.geoArea.category}
            </Text>
            <Text style={styles.kpi}>
              {this.props.geoArea.kpi}
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
    var kpi = this.props.geoArea.kpi;

    var redThreshold = this.getThreshold(this.props.geoArea.thresholds, "red");
    var greenThreshold = this.getThreshold(this.props.geoArea.thresholds, "green");
    var dailyAverage = this.getDailyAverage();
    var redDir =  redThreshold > greenThreshold?"\u2265":"\u2264";
    var greenDir =  redThreshold > greenThreshold?"\u2264":"\u2265";
    var unit = this.props.geoArea.unit;
    var data = this.getData();
    var yellowLowThreshold = redThreshold;
    var yellowHighThreshold = greenThreshold;
    if (kpi.indexOf("Throughput") !== -1 || kpi.toLowerCase() == "throughput" || kpi.toLowerCase() == "fallback") {
      yellowLowThreshold = redThreshold;
    }
    var yScale = this.findYScale();
    var yMinValue = Math.floor(Math.round(yScale[0] * 10) / 10);
    var yMaxValue = Math.ceil(Math.round((yMinValue + yScale[1]) * 10) / 10) ;
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
            // removed the text and arrow on the left plane
            /*
            <View style={styles.threshArrowContainer}>
              <Image style={styles.threshImage} source={{uri: "Icon_Chart_Indicator", isStatic: true}}/>
              <Text style={styles.chartThresh}>{dailyAverage}{yUnit}</Text>
            </View>
            */
    return(
      <View style={styles.dataContainer}>
        <View style={styles.chartContainer}>
          <Image style={styles.chartBands} source={require("./assets/images/BG_Chart_Bands.png")}>
            <SparklineView
              style={styles.hostView}
              average={dailyAverage}
              yScale={yScale}
              dataArray={data}
            />
          </Image>
          <View style={styles.chartSideContainer}>
            <Text style={styles.yMaxValue}>{yMaxValue}{yUnit}</Text>
            <View style={styles.yMinValueContainer}>
              <Text style={styles.yMinValue}>{yMinValue}{yUnit}</Text>
            </View>
          </View>
        </View>
        <View style={styles.thresholdContainer}>
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
  },
  sectorCounterView: function(dailyAverage, redThreshold, greenThreshold) {
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold);
    var totalNumSectors = 9;  // default sectors per zone
    // don't show sector count for sector page
    if (this.props.geoEntity === "sector"){
      return;
    }
    if (this.props.geoEntity === "area") {
      totalNumSectors = 135;
    }
    if (this.props.geoEntity === "zone") {
      totalNumSectors = 45;
    }
    var sectorCounts = {
      "red": 0,
      "yellow": 0,
      "green": 0,
    }
    var highNum = this.getRandomInt(Math.floor(totalNumSectors/2) + 1, totalNumSectors/2 + 2);
    var mediumNum = this.getRandomInt(Math.floor((totalNumSectors - highNum)/2), totalNumSectors - highNum - 1);
    var lowNum = totalNumSectors - highNum - mediumNum;
    switch(backgroundImage) {
      case "BG_Red_KPI_Item":
        sectorCounts["red"] = highNum;
        sectorCounts["yellow"] = mediumNum;
        sectorCounts["green"] = lowNum;
        break;
      case "BG_Green_KPI_Item":
        sectorCounts["green"] = highNum;
        sectorCounts["yellow"] = mediumNum;
        sectorCounts["red"] = lowNum;
        break;
      case "BG_Yellow_KPI_Item":
        sectorCounts["yellow"] = highNum;
        sectorCounts["red"] = mediumNum;
        sectorCounts["green"] = lowNum;
        break;
    }
    return(
        <View style={styles.sectorContainer}>
          <Image style={styles.sectorBackgroundImage} source={require("./assets/images/BG_Sector_Count_Red.png")}>
            <Text style={styles.sectorCountText}>{sectorCounts["red"]}</Text>
            <Text style={styles.sectors}>Sectors</Text>
          </Image>
          <View style={styles.lineVertical}></View>
          <Image style={styles.sectorBackgroundImage} source={require("./assets/images/BG_Sector_Count_Yellow.png")}>
            <Text style={styles.sectorCountText}>{sectorCounts["yellow"]}</Text>
            <Text style={styles.sectors}>Sectors</Text>
          </Image>
          <View style={styles.lineVertical}></View>
          <Image style={styles.sectorBackgroundImage} source={require("./assets/images/BG_Sector_Count_Green.png")}>
            <Text style={styles.sectorCountText}>{sectorCounts["green"]}</Text>
            <Text style={styles.sectors}>Sectors</Text>
          </Image>
        </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
  },
  sectorContainer: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  backgroundImage: {
    width: null, // stretch to the max
    height: null, // stretch to the max
    // borderColor: "blue",
    // borderWidth: 2,
  },
  sectorBackgroundImage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 95,
    height: 100,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  sectorCountText: {
    fontSize: 39,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Helvetica Neue',
    // borderColor: "white",
    // borderWidth: 1,
  },
  sectors: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(30,30,30,0.7)',
    fontFamily: 'Helvetica Neue',
    // borderColor: "blue",
    // borderWidth: 1,
  },
  lineVertical: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  row: {
    alignItems: 'flex-start',
    alignItems: "stretch",
    flexDirection: 'row',
    height: 198,
    // borderColor: "yellow",
    // borderWidth: 2,
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
  dataContainer: {
    flex: 3,
    // borderColor: "white",
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
    height: 22,
    width: 36,
  },
  kpiSpace: {
    flex: 4,
    // borderColor: "white",
    // borderWidth: 1,
  },
  geoAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  geoAreaTitle: {
    fontSize: 13,
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
    fontSize: 31,
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
  chartContainer: {
    flex: 34,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    // borderColor: "white",
    // borderWidth: 2,
  },
  thresholdContainer: {
    flex: 10,
    flexDirection: "row",
    // borderColor: "pink",
    // borderWidth: 2,
  },
  chartBands: {
    flex: 23,
    height: null,
    alignItems: "stretch",
    // borderColor: "green",
    // borderWidth: 1,
  },
  hostView: {
    flex: 1,
    // borderColor: "red",
    // borderWidth: 2,
  },
  chartSideContainer: {
    flex: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  yMaxValue: {
    flex: 4,
    fontSize: 12,
    fontWeight: "900",
    fontFamily: 'Helvetica Neue',
    paddingTop: 2,
    paddingLeft: 2,
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
    paddingLeft: 2,
    paddingBottom: 2,
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
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingTop: 4,
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

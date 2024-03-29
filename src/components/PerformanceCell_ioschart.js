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
  TouchableOpacity,
  View
} = React;

import { CombinedChart } from 'react-native-ios-charts';

var getImageFromAverage = require('../utils/getImageFromAverage');
var getImageViewFromParentKPI = require('../utils/getImageViewFromParentKPI');
var getThreshold = require('../utils/getThreshold');
var SparklineView= require('./SparklineView');
var isDataEmpty = require('../utils/isDataEmpty');
var CommentBox = require('./CommentBox');
var mixpanelTrack = require('../utils/mixpanelTrack');
var getDailyAverage = require('../utils/getDailyAverage');
const NO_VALUE = -99999999999999999999;

var PerformanceCell = React.createClass({
  propTypes: {
    onToggleComment:   React.PropTypes.func,
  },
  getInitialState: function() {
    return {
      commentCount: 0,
      isShowComment: false,  // used for show comment extension
    };
  },
  componentDidMount: function() {
    this.goToComment();
    // this.isLoading();
  },
  componentWillUnmount: function() {
    if (this.props.onUnmount) {
      this.props.onUnmount(this.props.geoArea);
    }
    // this.isLoading();
  },
  goToComment: function() {
    // ||
      if (global.navCommentProps && global.navCommentProps.entityType === this.props.entityType) {
      var navCommentProps = global.navCommentProps;
      var kpi = this.props.geoArea.category.toLowerCase() + "_" + this.props.geoArea.kpi.toLowerCase().replace(/ /g, "_");
      var hit = false;
      switch(this.props.entityType) {
        case "network":
          if (navCommentProps.kpi === kpi) {
            if (this.props.entityName) { // if at montly_target screen
              hit = (navCommentProps.entityName === this.props.entityName)?true:false;
            } else { // at the network daily screen
              entityName = this.props.geoArea.areaName.toLowerCase().replace(/ /g, "_");
              hit = (navCommentProps.entityName === entityName)?true:false;
            }
          }
          if (hit) {
            // this.props.setScrollIndex();
          }
          break;
        case "site":
          var entityName = this.props.siteName.toLowerCase();
          if (navCommentProps.entityName === entityName) {
            hit = true;
          }
          break;
        case "sector":
          var entityName = this.props.sectorName.toLowerCase();
          if (navCommentProps.entityName === entityName) {
            hit = true;
          }
          break;
      }
      if (hit) {
        this.setState({isShowComment: true});
        this.props.geoArea.isCommentOn = true;
        // if already scrolled, clear out
        if (global.navCommentProps.scrolled) {
          global.navCommentProps = undefined;
        } else {
          global.navCommentProps.commentOpened = true;
        }
        // No need to scroll when the parent pre-scoll
        // this.props.triggerScroll(navCommentProps);   // trigger scroll to timer
      }
    }
  },
  mpCommentBox: function() {
    var kpi = "#" + this.props.geoArea.category.toLowerCase() + "_" + this.props.geoArea.kpi.replace(/ /g, "_").toLowerCase();
    var entityType = "#" + this.props.entityType;
    var entityName = "#" + this.props.entityName;
    mixpanelTrack("Show Comment",
    {
      "Entity": entityType,
      "Name": entityName,
      "KPI": kpi,
    }, global.currentUser);
  },
  toggleComment: function() {
    if (typeof this.props.onToggleComment === 'function') {
      var isShowComment = !this.state.isShowComment;
      this.props.onToggleComment(isShowComment); // scroll correctly
      if (isShowComment) {
        this.mpCommentBox();
      }
      this.setState({isShowComment: isShowComment});
    }
  },
  render: function() {
    var kpi = this.props.geoArea.kpi;
    var kpiName = this.props.geoArea.category.toLowerCase() + "_" + kpi.replace(/ /g, "_").toLowerCase();
    var dailyAverage = this.getDailyAverage(false);
    var redThreshold = getThreshold(this.props.geoArea.thresholds, "red", kpi);
    var greenThreshold = getThreshold(this.props.geoArea.thresholds, "green", kpi);
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold, this.props.geoArea.statusColor);
    var commentContent =
        this.state.isShowComment?
        <CommentBox
          style={styles.commentExtensionContainer}
          entityType={this.props.entityType}
          entityName={this.props.entityName}
          kpi={kpiName}
          geoArea={this.props.geoArea}
          areaName={this.props.areaName}
          siteName={this.props.siteName}
          sectorName={this.props.sectorName}
        />
        :
        null;
    // backgroundImage = require("../assets/images/" + backgroundImage + ".png");  // can't use vairables
    // default to yellow
    return (
      <View style={styles.topContainer}>
        {this.contentView(backgroundImage)}
        {this.sectorCounterView(dailyAverage, redThreshold, greenThreshold)}
        {commentContent}
      </View>
    );
  },
  getDailyAverage: function(zeroFill) {
    var dataArray = this.props.geoArea.data;
    // might be invalid data when length < 2, i.e. 1

    var dailyAverage = this.props.geoArea.dailyAverage;
    var newDailyAverage = getDailyAverage(this.props.geoArea.kpi, dailyAverage, this.props.geoArea.kpiDecimalPrecision);
    if (isDataEmpty(dataArray) && zeroFill === false) {
      newDailyAverage = "No Data";
    }
    return newDailyAverage.toString();
  },

  innerContentView: function() {
    return (
      <View style={styles.row}>
        {this.kpiView()}
        {this.chartView()}
      </View>
    );
  },
  // Can't use variable in the "require()" statement for some reason so had to use this utility function
  contentView: function(backgroundImage) {
    var TouchableElement = TouchableOpacity;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    var entityName = this.props.entityName ? this.props.entityName : "";
    var touchContent =
      entityName !== "monthly_target"
      ?
      <TouchableElement style={styles.container}
          onPress={this.props.onSelect}
          onShowUnderlay={this.props.onHighlight}
          activeOpacity={0.5}
          onHideUnderlay={this.props.onUnhighlight}>
          {this.innerContentView()}
      </TouchableElement>
      :
      this.innerContentView();

    switch(backgroundImage) {
      case "BG_Red_KPI_Item":
        // red color = e21f26
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Red_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Green_KPI_Item":
        // green color = 629d34
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Green_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Yellow_KPI_Item":
        // yellow color = fdbe0e
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Yellow_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Grey_KPI_Item":
        // grey color = d5d6d8
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Grey_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
    }
  },
  /*
  getHighlightValues(dataArray) {
    var newHighlightArray = [];
    for (var i=0; i < dataArray.length; i++) {
      if (dataArray[i] === NO_VALUE) {
        newHighlightArray.push(i);
      }
    }
    if (newHighlightArray.length > 0) {
      return newHighlightArray;
    }
    return undefined;
  },
  */
  getLabel() {
    var dataArray = this.props.geoArea.data;
    var newLabelArray = [];
    for (var i=0; i < dataArray.length; i++) {
      var value = i.toString();
      newLabelArray.push(value);
    }
    return newLabelArray;
  },
  getData() {
    var dataArray = this.props.geoArea.data;
    var newDataArray = [];
    for (var i=0; i < dataArray.length; i++) {
      // the second element in the dataArray[i] could be empty due to no data, check it
      if (dataArray[i].length > 1) {
        // var array = [dataArray[i][0].toString(), parseFloat(dataArray[i][1])];
        // newDataArray.push(array);
        var value = parseFloat(dataArray[i][1]);
      } else {
        var value = NO_VALUE;
      }
      newDataArray.push(value);
      /* Skip the array element if no data on the second element!
      else {
        var array = [dataArray[i][0].toString(), null];
      }
      */
    }
    return newDataArray;
  },
  // find the Y location and Y length
  //   [0] => Y Location
  //   [1] => Y Length
  findYScale: function(target) {
    var yScale = [];
    var data = this.getData();
    if (parseFloat(this.props.geoArea.dailyAverage) < 0) {
      var maxY = -9999.99;
    } else {
      var maxY = 0.0;
    }
    yScale[0] = 0.0;
    yScale[1] = 0.0;
    for (var i in data) {
      // var item = data[i][1];
      var item = data[i];
      if (item > maxY) {
        maxY = item;
      }
    }
    var minY = maxY;

    // find minY
    for (var i in data) {
      // var item = data[i][1];
      var item = data[i];
      if (item === "" || item === NO_VALUE) {
        continue;
      }
      if (item < minY) {
        minY = item;
      }
    }
    var minY = Math.floor(Math.round(minY * 10) / 10);
    var maxY = Math.ceil(Math.round((maxY) * 10) / 10) ;
    if (maxY > 0 && minY < 0) {
      minY = 0;
    }
    // show at least scale of 10
    if (minY === maxY) {
      if (maxY === 0.0) {
        maxY = 10.0;
      } else if (maxY === 100.0) {
        minY = 90.0
      } else {
        maxY = (minY * 110);
        if (minY < 100.0 && maxY > 100.0) {
          maxY = 100.0
          minY = 90.0
        }
      }
    }
    if (target > maxY) {
      maxY = Math.ceil(Math.round(target * 10) / 10) ;
    } else if (target < minY) {
      minY = Math.floor(Math.round(target * 10) / 10);
    }
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
  switchSign: function(sign, switchDirection = false) {
    /*
    map the yellow sign by these rules when determing the yellow signs
    (">") -> "\u2264" (<=)
    ("<") -> "\u2265" (>=)
    ("\u2264") ->  ">"
    ("\u2265") -> "<"
    */
    switch (sign) {
      case ">":
        if (switchDirection) {
          return "\u2265";
        }
        return "\u2264";
      case "<":
        if (switchDirection) {
          return "\u2264";
        }
        return "\u2265";
      case "\u2264":
        if (switchDirection) {
          return "<";
        }
        return ">";
      case "\u2265":
        if (switchDirection) {
          return ">";
        }
        return "<";
    }
  },
  getYellowThresholdText: function(redSign, greenSign, redThreshold, greenThreshold) {

    var yellowGreenSign = this.switchSign(greenSign);
    var yellowRedSign = this.switchSign(redSign);
    if (greenThreshold > redThreshold) {
      var yellowRedSign = this.switchSign(redSign, true);
      var yellowThresholdText = redThreshold + yellowRedSign + "&" + yellowGreenSign + greenThreshold;
    } else {
      var yellowGreenSign = this.switchSign(greenSign, true);
      var yellowThresholdText = greenThreshold + yellowGreenSign + "&" + yellowRedSign + redThreshold ;
    }
    yellowThresholdText = yellowThresholdText.toString().replace("99.9999", "Six9s");
    return yellowThresholdText;
  },
  kpiView: function() {
    var kpiImage = getImageViewFromParentKPI(this.props.geoArea.category, this.props.geoArea.kpi);
    var dailyAverage = this.getDailyAverage(false)
    var dailyAverageInteger = dailyAverage.indexOf(".") > -1 ?
        dailyAverage.substring(0, dailyAverage.indexOf(".")) :
        dailyAverage;
    var dailyAverageDecimal = dailyAverage.indexOf(".") > -1 ?
        dailyAverage.substring(dailyAverage.indexOf("."), dailyAverage.length) :
        "";
    var unit = this.props.geoArea.unit;
    var kpi = this.props.geoArea.kpi;
    var category = this.props.geoArea.category;
    // readjust the category and kpi names to even out the length of the two lines
    if ((kpi.match(/ /g) || []).length >= 2) {
      var firstSpaceIndex = kpi.indexOf(" ");
      var categoryDisplayed = category + " " + kpi.substring(0,firstSpaceIndex);
      var kpiDisplayed = kpi.substring(firstSpaceIndex+1, kpi.length);
    } else {
      var categoryDisplayed = category;
      var kpiDisplayed = kpi;
    }
    if (dailyAverage === "No Data") {
      unit = "";
    }
      /* KPI icons - deativated
        <View style={styles.iconContainer}>
          {kpiImage}
          <View style={styles.kpiSpace}></View>
        </View>
        */
    return(
      <View style={styles.kpiContainer}>
        <View style={styles.textContainer}>
          <View style={styles.geoAreaContainer}>
            <Text style={styles.geoAreaTitle}>
                {this.props.geoArea.name}
            </Text>
          </View>
          <View style={styles.kpiValueContainer}>
            <Text style={styles.category}>
              {categoryDisplayed}
            </Text>
            <Text style={styles.kpi}>
              {kpiDisplayed}
            </Text>
            <View style={styles.dailyAverageContainer}>
              <Text style={styles.dailyAveargeInteger}>
                {dailyAverageInteger}
              </Text>
              <Text style={styles.dailyAveargeDecimal}>
                {dailyAverageDecimal}
              </Text>
              <Text style={styles.unit}>
                {unit}
              </Text>
            </View>
            <View style={styles.kpiTextContainer}>
              <Text style={styles.kpiText}>Daily Average</Text>
              <Text style={[styles.kpiText, {fontWeight: '900',}]}> 5am - 11pm</Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
  chartView: function() {
    var TouchableElement = TouchableOpacity;
    var kpi = this.props.geoArea.kpi;
    var redThreshold = getThreshold(this.props.geoArea.thresholds, "red", kpi);
    var greenThreshold = getThreshold(this.props.geoArea.thresholds, "green", kpi);
    var dailyAverage = this.getDailyAverage(true);
    // var redDir =  redThreshold > greenThreshold?"\u2265":"\u2264";
    // var greenDir =  redThreshold > greenThreshold?"\u2264":"\u2265";
    var redThresholdSign = this.props.geoArea.thresholds.redSign;
    var greenThresholdSign = this.props.geoArea.thresholds.greenSign;
    /*
    var redDir =  redThreshold > greenThreshold?">":"<";
    var greenDir =  redThreshold > greenThreshold?"\u2264":"\u2265";
    */
    // change the 99.9999 to 6 9s
    var redThresholdText = redThreshold.toString().replace("99.9999", "Six9s");
    var greenThresholdText = greenThreshold.toString().replace("99.9999", "Six9s");
    var unit = this.props.geoArea.unit;
    var data = this.getData();
    var labels = this.getLabel();
    // var highlightValues = this.getHighlightValues(data);
    var yellowLowThreshold = redThresholdText;
    var yellowHighThreshold = greenThresholdText;
    // get the yellow threshold signs
    var yellowThresholdText = this.getYellowThresholdText(redThresholdSign, greenThresholdSign, redThreshold, greenThreshold);
    /*
    if (kpi.indexOf("Throughput") !== -1 || kpi.toLowerCase() == "throughput" || kpi.toLowerCase() == "fallback") {
      yellowLowThreshold = redThreshold;
    }
    */
    var yScale = this.findYScale(greenThreshold);
    var yMinValue = yScale[0];
    var yMaxValue = yMinValue + yScale[1];
    // get limitLabelOffset based on the where the greenThreshold vs yMin and yMax
    const TOP_LIMIT_LABEL = -0.4;
    const BOTTOM_LIMIT_LABEL = -10.0;
    if (greenThreshold <= yMinValue) {
      var limitLabelOffset = TOP_LIMIT_LABEL;
    } else if (greenThreshold >= yMaxValue) {
      var limitLabelOffset = BOTTOM_LIMIT_LABEL;
    } else if (greenThreshold > yMinValue && greenThreshold < yMaxValue) {
      var limitLabelOffset = greenThreshold >= yMaxValue  - Math.abs(yMaxValue * 0.1)
      ? BOTTOM_LIMIT_LABEL : TOP_LIMIT_LABEL;
    }
    var yUnit = "";

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
    var commentCount = this.state.commentCount;
    if (commentCount === 0) {
      commentCount = "";
    }
    const config = {
      /*
      barData: {
        dataSets: [{
          values: data,
          drawValues: false,
          highlightEnabled: false,
          colors: ['white'],
          axisDependency: 'left'
        }]
      },
          // drawHighlightArrowEnabled: true,
          // drawValueAboveBarEnabled: false,
          // drawBarShadowEnabled: false,
          // autoScaleMinMax: true,
          // dragEnabled: false,
          // highlightPerDragEnabled: false,
      */

      lineData: {
        dataSets: [{
          values: data,
          drawValues: false,
          // highlightEnabled: true,
          // highlightColor: 'transparent',
          colors: ['white'],
          drawCubic: false, // wavy chart vs shart angle chart
          drawCircles: false,
          // lineDashLengths: 3.0,
          // lineDashPhase: 0.7,
          lineWidth: 1,
          axisDependency: 'left'
        }],
      },
      // highlightValues: highlightValues,
      autoScaleMinMax: false,
      pinchZoomEnable: true,
      doubleTapToZoomEnabled: false,
      drawBarShadowEnabled: false,
      backgroundColor: 'transparent',
      labels: labels,
      showLegend: false,
      xAxis: {
        enabled: false,
        drawAxisLine: false,
        drawGridLines: false,
        position: 'bottom'
      },
      leftAxis: {
        // axisMaximum: 50,
        // axisMinimum: 0,
        enabled: false,
        drawGridLines: false,
        drawAxisLine: false,
        spaceTop: 0.0,
        spaceBottom: 0.0,
        axisMaximum: yMaxValue,
        axisMinimum: yMinValue,
        limitLines: [
          {
            limit: greenThreshold,
            label: "GREEN",
            lineColor: "black",
            lineWidth: 0.8,
            lineDashLengths: 3.7,
            valueTextColor: "rgba(40,40,40,0.7)",
            textFontName: 'Helvetica Neue',
            textSize: 8.0,
            xOffset: -3.0,
            // yOffset Position should shift based on whether the line is on top or below
            // On top: -10.0, Below: 0.0
            yOffset: limitLabelOffset,
          }
        ]
      },
      rightAxis: {
        enabled: false,
      },
      valueFormatter: {
        type: 'regular',
        maximumDecimalPlaces: 0
      }
    };
    /*
            <SparklineView
              style={styles.hostView}
              average={greenThreshold}
              yScale={yScale}
              dataArray={data}
            />
            */
    return(
      <View style={styles.dataContainer}>
        <View style={styles.chartContainer}>
          <Image style={styles.chartBands} source={require("../assets/images/BG_Chart_Bands.png")}>
            <CombinedChart config={config} style={styles.hostView}/>
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
            <View style={styles.trContainer}>
              <Text style={[styles.tt, {}]}>RED</Text>
              <Text style={[styles.tv, {}]}>{redThresholdSign}{redThresholdText}</Text>
            </View>
            <View style={styles.tyContainer}>
              <Text style={styles.tt}>YELLOW</Text>
              <Text style={styles.tv}>{yellowThresholdText}</Text>
            </View>
            <View style={styles.tgContainer}>
              <Text style={styles.tt}>GREEN</Text>
              <Text style={styles.tv}>{greenThresholdSign}{greenThresholdText}</Text>
            </View>
          </View>
          <TouchableElement style={styles.commentContainer}
              onPress={this.toggleComment}
              activeOpacity={0.5}
              >
            <Image style={styles.commentIcon} source={require("../assets/icons/icon_comment.png")}/>
            <Text style={styles.commentCount}>{commentCount}</Text>
          </TouchableElement>
        </View>
      </View>
    );
  },
  sectorCounterView: function(dailyAverage, redThreshold, greenThreshold) {
    var totalNumSectors = 9;  // default sectors per zone
    var entityName = this.props.entityName ? this.props.entityName : "";
    // don't show sector count for sector page
    if (this.props.entityType.toLowerCase() === "sector" ||
        this.props.entityType.toLowerCase() === "site" ||
        entityName === 'monthly_target') {
      return;
    }
    if (this.props.entityType.toLowerCase() === "zone") {
      totalNumSectors = 45;
    }
    var dataArray = this.props.geoArea.data;
    var redCount = this.props.geoArea.sectorStatusCount.red;
    var greenCount = this.props.geoArea.sectorStatusCount.green;
    var yellowCount = this.props.geoArea.sectorStatusCount.yellow;
    var greyCount = this.props.geoArea.sectorStatusCount.grey;
    /*
    if (isDataEmpty(dataArray)) {
      // set yellowCount to the total count when data is empty
      if (redCount !== 0) {
        yellowCount = redCount;
        redCount = 0;
      } else if (greenCount !== 0) {
        yellowCount = greenCount;
        greenCount = 0;
      }
    }
    */
    var TouchableElement = TouchableOpacity;
    if (Platform.OS === 'android') {
      TouchableElement = TouchableNativeFeedback;
    }
    return(
        <View style={styles.sectorContainer}>
          <Image style={styles.sectorBackgroundImage} source={require("../assets/images/BG_Sector_Count_Red.png")}>
            <TouchableElement style={styles.countContainer}
              onPress={this.props.onSelectRed}
              activeOpacity={0.5}
              >
              <Text style={styles.sectorCountText}>{redCount}</Text>
              <Text style={styles.sectors}>Sectors</Text>
            </TouchableElement>
          </Image>
          <View style={styles.lineVertical}></View>
          <Image style={styles.sectorBackgroundImage} source={require("../assets/images/BG_Sector_Count_Yellow.png")}>
            <TouchableElement style={styles.countContainer}
              onPress={this.props.onSelectYellow}
              activeOpacity={0.5}
              >
              <Text style={styles.sectorCountText}>{yellowCount}</Text>
              <Text style={styles.sectors}>Sectors</Text>
            </TouchableElement>
          </Image>
          <View style={styles.lineVertical}></View>
          <Image style={styles.sectorBackgroundImage} source={require("../assets/images/BG_Sector_Count_Green.png")}>
            <TouchableElement style={styles.countContainer}
              onPress={this.props.onSelectGreen}
              activeOpacity={0.5}
              >
              <Text style={styles.sectorCountText}>{greenCount}</Text>
              <Text style={styles.sectors}>Sectors</Text>
            </TouchableElement>
          </Image>
          <View style={styles.lineVertical}></View>
          <Image style={styles.sectorBackgroundImage} source={require("../assets/images/BG_Sector_Count_Grey.png")}>
            <TouchableElement style={styles.countContainer}
              onPress={this.props.onSelectGrey}
              activeOpacity={0.5}
              >
              <Text style={styles.sectorCountText}>{greyCount}</Text>
              <Text style={styles.sectors}>Sectors</Text>
            </TouchableElement>
          </Image>
        </View>
    );
  },
});

// To show component outlines for layout
// var StyleSheet = require('react-native-debug-stylesheet');

var styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'column',
  },
  container: {
    flex: 2,
    alignItems: "stretch",
  },
  sectorContainer: {
    flexDirection: "row",
    alignSelf: 'stretch',
    alignItems: "stretch",
    justifyContent: "space-between",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  commentExtensionContainer: {
    flex: 3,
    backgroundColor: 'white',
  },
  backgroundImage: {
    width: null, // stretch to the max
    height: null, // stretch to the max
    flexDirection: 'column',
    // borderColor: "blue",
    // borderWidth: 2,
  },
  sectorBackgroundImage: {
    justifyContent: "center",
    alignItems: "stretch",
    flex: 95,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  countContainer: {
    flex: 1,  // this stretches the height with single element
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // height: null,  // enable full height stretch in "column" order
    // borderColor: "white",
    // borderWidth: 2,
  },
  sectorCountText: {
    fontSize: 38,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "white",
    // borderWidth: 1,
  },
  sectors: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(30,30,30,0.7)',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
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
    paddingTop: 13,
    paddingLeft: 13,
    // borderColor: "blue",
    // borderWidth: 2,
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
    paddingLeft: 10,
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
    backgroundColor: 'transparent',
  },
  category: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
  },
  kpi: {
    color: 'rgba(30,30,30,0.7)',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
  },
  dailyAverageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: 'transparent',
  },
  dailyAveargeInteger: {
    textAlign: "right",
    color: 'white',
    fontSize: 35,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: 'white',
    // borderWidth: 1,
  },
  dailyAveargeDecimal: {
    textAlign: "right",
    marginBottom: 4,
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: 'white',
    // borderWidth: 1,
  },
  unit: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
    paddingBottom: 4,
    backgroundColor: 'transparent',
    // borderColor: 'pink',
    // borderWidth: 1,
  },
  kpiTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  kpiText: {
    color: 'rgba(60,60,60,0.6)',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: 'pink',
    // borderWidth: 1,
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
    marginLeft: -10,
    marginRight: -10,
    marginTop: -6,
    marginBottom: -6,
    /*
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 4,
    marginBottom: 4,
    */
    // borderColor: "red",
    // borderWidth: 1,
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
    // height: 15,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  thresholdValue: {
    flexDirection: "row",
    flex: 9,
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingTop: 4,
    backgroundColor: 'transparent',
    // borderColor: "red",
    // borderWidth: 1,
  },
  commentContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderColor: "white",
    // borderWidth: 1,
  },
  commentIcon: {
    flex: 2,
    height: 15,
    backgroundColor: 'transparent',
    marginLeft: 2,
    marginRight: 3,
    marginBottom: 5,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  commentCount: {
    flex: 3,
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 10,
    fontWeight: "600",
    fontFamily: 'Helvetica Neue',
    marginBottom: 9,
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  trContainer: {
    flex: 10,
    alignItems: "flex-start",
    // borderColor: "blue",
    // borderWidth: 1,
  },
  tyContainer: {
    flex: 26,
    alignItems: "flex-start",
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  tgContainer: {
    flex: 13,
    alignItems: "flex-start",
    // borderColor: "blue",
    // borderWidth: 1,
  },
  tt: {
    alignSelf: 'center',
    color: "rgba(255,255,255, 0.7)",
    fontSize: 11,
    fontWeight: "400",
    fontFamily: 'Helvetica Neue',
  },
  tv: {
    alignSelf: 'center',
    color: "white",
    fontSize: 12,
    fontWeight: "800",
    fontFamily: 'Helvetica Neue',
  },
});

module.exports = PerformanceCell;

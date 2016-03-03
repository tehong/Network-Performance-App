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

var getImageFromAverage = require('../utils/getImageFromAverage');
var getImageViewFromParentKPI = require('../utils/getImageViewFromParentKPI');
var getThreshold = require('../utils/getThreshold');
var SparklineView= require('./SparklineView');
var isDataEmpty = require('../utils/isDataEmpty');
var CommentBox = require('./CommentBox');

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
  componentDidMount() {
    this.goToComment();
    // this.isLoading();
  },
  /*
  isLoading: function() {
    if (this.props.isLoading) {
      console.log('PerfCell - closing comment box');
      this.setState({
        isShowComment: false,
      });
    }
  },
  */
  goToComment: function() {
    // if((this.props && this.props.navCommentProps && this.props.navCommentProps.entityType === this.props.entityType)) {
    // ||
      if (global.navCommentProps && global.navCommentProps.entityType === this.props.entityType) {
        /*
        if (this.props.siteName.toLowerCase() === "930030_brown_city") {
          debugger;
        }
        */
      /*
      if (global.scrollToEntity) {
        global.navCommentProps = global.scrollToEntity;
      }
      */
      var navCommentProps = global.navCommentProps;
      var kpi = this.props.geoArea.category.toLowerCase() + "_" + this.props.geoArea.kpi.toLowerCase().replace(/ /g, "_");
      var hit = false;
      switch(this.props.entityType) {
        case "monthly_target":
        case "network":
          if (navCommentProps.kpi === kpi) {
            this.props.setScrollIndex();
            hit = true;
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
        // now trigger scrolling when the component is mounted
        this.props.triggerScroll(navCommentProps);   // trigger scroll to timer
      }
    }
  },
  toggleComment: function() {
    global.refreshFeedCount();
    if (typeof this.props.onToggleComment === 'function') {
      this.props.onToggleComment(!this.state.isShowComment); // scroll correctly
    }
    this.setState({isShowComment: !this.state.isShowComment});
  },
  render: function() {
    var kpi = this.props.geoArea.kpi;
    var kpiName = this.props.geoArea.category.toLowerCase() + "_" + kpi.replace(/ /g, "_").toLowerCase();
    var dailyAverage = this.getDailyAverage(false);
    var redThreshold = getThreshold(this.props.geoArea.thresholds, "red", kpi);
    var greenThreshold = getThreshold(this.props.geoArea.thresholds, "green", kpi);
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold);
    var commentContent =
        this.state.isShowComment?
        <CommentBox
          style={styles.commentExtensionContainer}
          entityType={this.props.entityType}
          entityName={this.props.geoArea.name.toLowerCase()}
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
  getDailyAverage(zeroFill) {
    var dataArray = this.props.geoArea.data;
    // might be invalid data when length < 2, i.e. 1

    var dailyAverage = this.props.geoArea.dailyAverage;
    if (dailyAverage !== null) {
      dailyAverage = this.props.geoArea.dailyAverage.toString();
    } else {
      dailyAverage = "No Data";
      return dailyAverage;
    }
    if (isDataEmpty(dataArray) && zeroFill === false) {
      dailyAverage = "No Data";
    } else {
      // Limit the number of total digits to 3 non-leading-zero digits
      var indexDecimal = dailyAverage.indexOf('.');
      if (indexDecimal >= 0) {
        var decimal_digits = dailyAverage.length - indexDecimal - 1;
        var integer_digits = dailyAverage.length - decimal_digits - 1;
        // default the numDecimalDigit to 1 unless decimal_digits is 0;
        var numDecimalDigit = 1 < decimal_digits ? 1 : decimal_digits;
        // show max three non-zero digits or at least one decimal if more than three digits
        if (integer_digits === 1) {
          if (dailyAverage.charAt(0) === "0") {
            numDecimalDigit = 3 < decimal_digits?3:decimal_digits;
          } else {
            numDecimalDigit = 2 < decimal_digits?2:decimal_digits;
          }
        }
        dailyAverage = dailyAverage.substring(0, indexDecimal + numDecimalDigit + 1)
      }
      dailyAverage = parseFloat(dailyAverage);
    }
    return dailyAverage;
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
    var touchContent =
      this.props.entityType !== "monthly_target"
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
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Red_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Green_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Green_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Yellow_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Yellow_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
      case "BG_Grey_KPI_Item":
        return(
          <Image style={styles.backgroundImage} source={require("../assets/images/BG_Grey_KPI_Item.png")}>
            {touchContent}
          </Image>
        );
    }
  },
  getData() {
    var dataArray = this.props.geoArea.data;
    var newDataArray = [];
    for (var i=0; i < dataArray.length; i++) {
      // the second element in the dataArray[i] could be empty due to no data, check it
      if (dataArray[i].length > 1) {
        var array = [dataArray[i][0].toString(), parseFloat(dataArray[i][1])];
        newDataArray.push(array);
      }
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
    var minY = Math.floor(Math.round(minY * 10) / 10);
    var maxY = Math.ceil(Math.round((maxY) * 10) / 10) ;
    if (minY < 0) {
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
  kpiView: function() {
    var kpiImage = getImageViewFromParentKPI(this.props.geoArea.category, this.props.geoArea.kpi);
    var dailyAverage = this.getDailyAverage(false)
    var unit = this.props.geoArea.unit;
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
    var TouchableElement = TouchableOpacity;
    var kpi = this.props.geoArea.kpi;
    var redThreshold = getThreshold(this.props.geoArea.thresholds, "red", kpi);
    var greenThreshold = getThreshold(this.props.geoArea.thresholds, "green", kpi);
    var dailyAverage = this.getDailyAverage(true);
    // var redDir =  redThreshold > greenThreshold?"\u2265":"\u2264";
    // var greenDir =  redThreshold > greenThreshold?"\u2264":"\u2265";
    var redDir =  redThreshold > greenThreshold?">":"<";
    var greenDir =  redThreshold > greenThreshold?"\u2264":"\u2265";
    var unit = this.props.geoArea.unit;
    var data = this.getData();
    var yellowLowThreshold = redThreshold;
    var yellowHighThreshold = greenThreshold;
    /*
    if (kpi.indexOf("Throughput") !== -1 || kpi.toLowerCase() == "throughput" || kpi.toLowerCase() == "fallback") {
      yellowLowThreshold = redThreshold;
    }
    */
    var yScale = this.findYScale(greenThreshold);
    var yMinValue = yScale[0]
    var yMaxValue = yMinValue + yScale[1];
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
    return(
      <View style={styles.dataContainer}>
        <View style={styles.chartContainer}>
          <Image style={styles.chartBands} source={require("../assets/images/BG_Chart_Bands.png")}>
            <SparklineView
              style={styles.hostView}
              average={greenThreshold}
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
              <Text style={styles.tt}>RED</Text>
              <Text style={styles.tv}>{redDir}{redThreshold}{unit}</Text>
            </View>
            <View style={styles.tyContainer}>
              <Text style={styles.tt}>YELLOW</Text>
              <Text style={styles.tv}>{yellowLowThreshold}-{yellowHighThreshold}{unit}</Text>
            </View>
            <View style={styles.ttContainer}>
              <Text style={styles.tt}>GREEN</Text>
              <Text style={styles.tv}>{greenDir}{greenThreshold}{unit}</Text>
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
    var backgroundImage = getImageFromAverage(dailyAverage, redThreshold, greenThreshold);
    var totalNumSectors = 9;  // default sectors per zone
    // don't show sector count for sector page
    if (this.props.entityType.toLowerCase() === "sector" ||
        this.props.entityType.toLowerCase() === "site" ||
        this.props.entityType.toLowerCase() === 'monthly_target') {
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
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
  },
  kpi: {
    color: 'rgba(30,30,30,0.7)',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
  },
  dailyAverage: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    backgroundColor: 'transparent',
  },
  dailyValue: {
    textAlign: "right",
    color: 'white',
    fontSize: 39,
    fontWeight: '700',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: 'white',
    // borderWidth: 1,
  },
  unit: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
    paddingLeft: 2,
    paddingBottom: 7,
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
    paddingTop: 1,
    paddingBottom: 1,
    marginTop: 4,
    marginBottom: 4,
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
    fontSize: 12,
    fontWeight: "700",
    fontFamily: 'Helvetica Neue',
  },
});

module.exports = PerformanceCell;

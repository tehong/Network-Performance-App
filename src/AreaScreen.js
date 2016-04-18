'use strict';

var ENTITY_TYPE = "network";

var React = require('react-native');
var {
  AppStateIOS,
  ActivityIndicatorIOS,
  ListView,
  Platform,
  // ProgressBarAndroid,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} = React;

var Actions = require('react-native-router-flux').Actions;
var cachedAreas = undefined;
var ROW_HEIGHT = 285;
// var prepareCommentBox = require('./utils/prepareCommentBox');
var scrollToByTimeout = require('./utils/scrollToByTimeout');
var TimerMixin = require('react-timer-mixin');
var RefreshableListView = require('react-native-refreshable-listview');

var PerformanceCell = require('./components/PerformanceCell');
var SearchBar = require('./components/SearchBar');
var Parse = require('parse/react-native');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var DailyAverageScreen = require('./DailyAverageScreen');
var MonthlyTargetScreen = require('./MonthlyTargetScreen');
var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var mixpanelTrack = require('./utils/mixpanelTrack');
var AreaScreen = React.createClass({

  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      statusCode: 408,  // default to request timeout
      statusMessage: "",  // show any result status message if present
      isMonthlyTarget: global.isMonthlyTarget,
    };
  },
  componentWillMount: function() {
    this.navigateToComment();
    this._getAppBadgeValue();
    if (!global.navCommentProps) {
      this.mpAppState('active');
    }
  },
  componentDidMount: function() {
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);
  },
  componentWillUnmount: function() {
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    AppStateIOS.removeEventListener('memoryWarning', this._handleMemoryWarning);
  },
  navigateToComment: function() {
    if (global.navCommentProps) {
      switch (global.navCommentProps.entityName.toLowerCase()) {
        case "monthly_target":
          global.isMonthlyTarget = true;
          break;
        default:
          global.isMonthlyTarget = false;
          break;
      }
      this.setState({
        isMonthlyTarget: global.isMonthlyTarget,
      });
    }
  },
  _handleAppStateChange: function(currentAppState) {
    // setState doesn't set the state immediately until the render runs again so this.state.currentAppState is not updated now
    if (this.state.previousAppStates) {
      var previousAppStates = this.state.previousAppStates.slice();
    } else {
      var previousAppStates = [];
    }
    previousAppStates.push(this.state.appState);
    this.setState({
      appState: currentAppState,
      previousAppStates: previousAppStates,
    });
    if (!global.navCommentProps) {
      this.mpAppState(currentAppState);
    }
  },
  _handleMemoryWarning: function() {
    this.setState({memoryWarnings: this.state.memoryWarnings + 1})
    this.mpAppMemoryWarning(this.state.memoryWarnings + 1);
  },
  mpAppState: function(currentAppState) {
    if (currentAppState === 'active') {
      // save the last app state
      Mixpanel.timeEvent("App Inactive");
      Mixpanel.timeEvent("App Background");
      mixpanelTrack("App Active", null, global.currentUser);
    } else if (currentAppState === 'background') {
      // save the last app state
      this.setState({lastSaveAppState: currentAppState});
      mixpanelTrack("App Background", null, global.currentUser);
    } else if (currentAppState === 'inactive') {
      // save the last app state
      this.setState({lastSaveAppState: currentAppState});
      mixpanelTrack("App Inactive", null, global.currentUser);
    }
  },
  mpAppMemoryWarning: function() {
    mixpanelTrack("App Memory Warning", null, this.state.currentUser);
  },
  _getAppBadgeValue: async function() {
    try {
      var badgeValue = await ParseInitIOS.getBadgeValue();
      if (badgeValue > 0) {
        ParseInitIOS.clearBadge();
        Actions.feed();
      }
    } catch(e) {
      console.error(e);
    }
  },
  mpSelectFeed: function() {
    mixpanelTrack("Show Feed", null, global.currentUser);
  },
  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getAreas(filter), 100);
  },
  mpSelectKpi: function(kpi) {
    mixpanelTrack("Network KPI", {"KPI": kpi}, global.currentUser);
  },
  mpSelectSectorColor: function(kpi, color) {
    mixpanelTrack("Sector Count", {"KPI": kpi, "Color": color}, global.currentUser);
  },
  onPressDailyAverage: function() {
    if (global.isMonthlyTarget) {
      global.isMonthlyTarget = false;
      this.setState({
          isMonthlyTarget: global.isMonthlyTarget,
      });
    }
  },
  onPressMonthlyTarget: function() {
    if (!global.isMonthlyTarget) {
      global.isMonthlyTarget = true;
      this.setState({
          isMonthlyTarget: global.isMonthlyTarget,
      });
    }
  },
  render: function() {
    var header =
      <Header
        style={styles.header}
        isMonthlyTarget={this.state.isMonthlyTarget}
        onPressDailyAverage={this.onPressDailyAverage}
        onPressMonthlyTarget={this.onPressMonthlyTarget}
      >
      </Header>;
    if (this.state.isMonthlyTarget) {
      console.log("monthlyList");
      var content = <MonthlyTargetScreen
        style={styles.listView}
        entityType={this.props.entityType}
        entityName={"monthly_target"}
      />;
    } else {
      console.log("dailyAverageList");
      var content = <DailyAverageScreen
        entityType={this.props.entityType}
        entityName={"daily_average"}
      />;
    }
    return (
      <View style={styles.container}>
        {header}
        {content}
      </View>
    );
  },
});

var Header = React.createClass({
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var betweenMargin = 3;
    var dailyAverageStyle = this.props.isMonthlyTarget?
      styles.headerText
      :
      [styles.headerText, {color: "#00BBF0", backgroundColor: "white", marginRight: betweenMargin,}];
    var monthlyTargetStyle = this.props.isMonthlyTarget?
      [styles.headerText, {color: "#00BBF0", backgroundColor: "white", marginLeft: betweenMargin,}]
      :
      styles.headerText;
    var dailyAverageUnderlineStyle = this.props.isMonthlyTarget?
      styles.underline
      :
      [styles.underline, {backgroundColor: "#00BBF0", marginRight: betweenMargin,}];
    var monthlyTargetUnderlineStyle = this.props.isMonthlyTarget?
      [styles.underline, {backgroundColor: "#00BBF0", marginLeft: betweenMargin,}]
      :
      styles.underline;

    return (
      <View style={styles.listHeader}>
        <TouchableElement
          style={styles.iconTouch}
          onPress={this.props.onPressDailyAverage}
          underlayColor={"#1faae1"}>
          <Text style={dailyAverageStyle}>Daily Average</Text>
          <View style={dailyAverageUnderlineStyle}></View>
        </TouchableElement>
        <TouchableElement
          style={styles.iconTouch}
          onPress={this.props.onPressMonthlyTarget}
          underlayColor={"#1faae1"}>
          <Text style={monthlyTargetStyle}>Monthly Target</Text>
          <View style={monthlyTargetUnderlineStyle}></View>
        </TouchableElement>
      </View>
    );
  }
});

var styles = getAreaScreenStyles();

module.exports = AreaScreen;

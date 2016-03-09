'use strict';

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

var cachedAreas = undefined;
var ROW_HEIGHT = 198;
var prepareCommentBox = require('./utils/prepareCommentBox');
var scrollToByTimeout = require('./utils/scrollToByTimeout');
var RefreshableListView = require('react-native-refreshable-listview');

var PerformanceCell = require('./components/PerformanceCell');
var TimerMixin = require('react-timer-mixin');
var SiteScreen = require('./SiteScreen');
var SearchBar = require('./components/SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var Parse = require('parse/react-native');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var ShowModalMessage = require('./components/ShowModalMessage');
var saveEntityTypeInCloud = require('./utils/saveEntityTypeInCloud');

var SiteNavTitle = require('./components/icons/sites/SiteNavTitle');

var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./utils/getSortedAreaDataArray');
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var AreaScreen = require('./AreaScreen');

// Dev DB access: 54.165.24.76
// var MONTHLY_TARGET_URL = 'http://54.165.24.76:3010/kpis/v1/monthly/target/kpi/all';
var MONTHLY_TARGET_URL = 'http://52.20.201.145:3010/kpis/v1/monthly/target/kpi/all';
// var MONTHLY_TARGET_URL = 'http://localhost:3010/kpis/v1/monthly/target/kpi/all';

var resultsCache = {
  dataForQuery: {},
  // nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};

var MonthlyTargetScreen = React.createClass({
  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      statusCode: 408,  // default to request timeout
      statusMessage: "",  // show any result status message if present
      isLoading: true,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      // isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      contentInset: {bottom: 25},
    };
  },
  getRestEndPoint: function() {
    if (!(global.restService && global.restService.monthlyTargetUrl)) {
      // periodic check if the service URL is retrieved
      var interval = this.setInterval(
        () => {
          if (global.restService && global.restService.monthlyTargetUrl) {
            MONTHLY_TARGET_URL = global.restService.monthlyTargetUrl;
            this.clearInterval(interval);
            // now we can get data
            this.getAreas('area');
          }
        },
        50, // checking every 50 ms
      );
    } else {
      MONTHLY_TARGET_URL = global.restService.monthlyTargetUrl;
      this.getAreas('area');
    }
  },
  componentWillMount: function() {
    this.getRestEndPoint();
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
    global.refreshFeedCount();
  },
  componentDidMount: function() {
    saveEntityTypeInCloud(this.props.entityType);
  },
  componentWillUnmount: function() {
  },
  reloadData: function() {
    global.refreshFeedCount();
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
    this.getAreas('area');
  },
  refreshData: function() {
    // need to make sure we ended up at the right network screen index
    this.props.setScrollIndex();
    this.setState({
      isRefreshing: true,
    });

    this.reloadData();
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
      return (
        MONTHLY_TARGET_URL
      );
  },
  fetchData: function(query, queryString) {
    console.log("monthly target queryString = " + queryString);
    var _this = this;  // ready for promise processing
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
    .then((response) => response.json())
    .then((responseData) => {
      // var goToNetwork = !_this.state.isRefreshing;
      if(responseData.statusCode && responseData.statusCode !== 200) {
        _this.setState({
          isLoading: false,
          isRefreshing: false,
          statusCode: responseData.statusCode,
          statusMessage: responseData.statusMessage,
        });
      } else {
        var areas = responseData;
        if (areas) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = areas.length;
            resultsCache.dataForQuery[query] = areas;
            // resultsCache.nextPageNumberForQuery[query] = 2;
            _this.setState({
              isLoading: false,
              isRefreshing: false,
              // dataSource: this.getDataSource(responseData.movies),
              dataSource: this.getDataSource(areas),
            });
        } else {
            LOADING[query] = false;
            resultsCache.dataForQuery[query] = undefined;

            _this.setState({
              dataSource: this.getDataSource([]),
              isLoading: false,
              isRefreshing: false,
            });
        }
      }
    })
    .catch((ex) => {
      console.log('response failed', ex)
      // var goToNetwork = !_this.state.isRefreshing;
      _this.setState({
        isLoading: false,
        isRefreshing: false,
      });
    })
  },
  getAreas: function(query: string) {

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.setState({
          dataSource: this.getDataSource(cachedResultsForQuery),
          isLoading: false
        });
      } else {
        this.setState({
          isLoading: true,
        });
      }
      cachedAreas = cachedResultsForQuery;
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      isLoading: true,
      // isLoadingTail: false,
    });

    var queryString = this._urlForQueryAndPage(query, 1);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },
  // save the KPI names in cloud
  updateKpiNameInCloud: function(areas: Array<any>) {
    var KPI = Parse.Object.extend("Kpi");
    var kpiArray = [];
    var kpiSaveArray = [];
    var numKpiProcessed = 0;
    // first find all KPIs in the KPI table
    var query = new Parse.Query(KPI);
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          var kpiObj = results[i]
          kpiArray.push(kpiObj.get('kpiName'));
        }
        // now construct kpiSaveArray
        for (var i = 0; i < areas.length; i++) {
          var kpiName = areas[i].category.toLowercase()+ "_" + areas[i].kpi.replace(/ /g, "_").toLowerCase();
          var kpiSave = true;
          for (var j = 0; j < kpiArray.length; j++) {
            if (kpiArray[j].indexOf(kpiName) > -1) {
              kpiSave = false;
            }
          }
          if (kpiSave) {
            var kpi = new KPI();
            kpi.set('kpiName', kpiName)
            kpiSaveArray.push(kpi);
          }
        }
        // now save the kpiSaveArray
        Parse.Object.saveAll(kpiSaveArray, {
          success: function(objs) {
            console.log("parse - saving all kpi - ", kpiSaveArray);
          },
          error: function(error) {
            console.log("parse - kpi saving failed, error code = " + error.message);
          }
        });
      },
      error: function(error) {
        // error is an instance of Parse.Error.
      }
    });
  },
  addUtilData: function(areas) {
    var getThreshold = require('./utils/getThreshold');
    for (var i=0;i<areas.length; i++) {
      // FIXME: temporary patches to make the feed navigation work correctly with the old monthly target service API
      if (!areas[i].name) {
        areas[i].name = "Monthly Target";
        areas[i].areaName = "Thumb";
        areas[i].parentEntityName = "Thumb";
      }
      // populate the last array element [x,y] with fake end of month data that's equal to green target so it is not visible
      if (areas[i].data.length < 30) {
        areas[i].data.push([31,areas[i].thresholds.green]);
      }
      // reset the isCommentOn flag
      areas[i].isCommentOn = false;
    }
    return areas;
  },
  getDataSource: function(areas: Array<any>): ListView.DataSource {
    // Sort by red then yellow then green backgroundImage
    var sortedAreas = getSortedDataArray(areas);
    // save the KPI name in cloud
    // need to be after it is sorted and category is populated!
    // this.updateKpiNameInCloud(sortedAreas);  // populate the category name
    var sortedMonthlyAreas = this.addUtilData(sortedAreas);
    return this.state.dataSource.cloneWithRows(sortedMonthlyAreas);
  },
  renderFooter: function() {
    // if (!this.hasMore() || !this.state.isLoadingTail) {
      return <View style={styles.scrollSpinner} />;
    // }
    /*
    if (Platform.OS === 'ios') {
      return <ActivityIndicatorIOS style={styles.scrollSpinner} />;
    } else {
      return (
        <View  style={{alignItems: 'center'}}>
          <ProgressBarAndroid styleAttr="Large"/>
        </View>
      );
    }
    */
  },

  renderSeparator: function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },

  renderRow: function(
    area: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    /*
        onSelect={() => this.selectKpi(area)}
        onSelectRed={() => this.selectKpiRed(area)}
        onSelectYellow={() => this.selectKpiYellow(area)}
        onSelectGreen={() => this.selectKpiGreen(area)}
        onSelectGrey={() => this.selectKpiGrey(area)}
        */
    return (
      <PerformanceCell
        key={area.id}
        onSelect={() => {}}
        onSelectRed={() => {}}
        onSelectYellow={() => {}}
        onSelectGreen={() => {}}
        onSelectGrey={() => {}}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={area}
        areaName={area.areaName}
        entityType={this.props.entityType}
        entityName={this.props.entityName}
        scrollIndex={this.props.scrollIndex}
        setScrollIndex={this.props.setScrollIndex}
        onToggleComment={(showComment) => {
          this.props.setScrollIndex();  // always need to the correct index
          area["isCommentOn"] = showComment;
          var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, area, showComment, ROW_HEIGHT, true);
          this.setState({
            contentInset: contentInset,
          });
        }}
        navCommentProps={global.navCommentProps}
        triggerScroll={() => scrollToByTimeout(this, this.props.entityType, ROW_HEIGHT)}
      />
    );
  },

  render: function() {
    // initial loading => show the activity indicator.  Subsequent refreshing of the ListView => do not unload the ListView
    if ((this.state.isLoading && !this.state.isRefreshing) || (!global.restService)) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 100}]}
        color={"#00A9E9"}
        size="large"
      />;
    } else {
      var content = this.state.dataSource.getRowCount() === 0 ?
        <ActivityIndicatorIOS
          animating={true}
          style={[styles.centering, {height: 100}]}
          color={"#00A9E9"}
          size="large"
        />
        :
        <RefreshableListView
          ref="listview"
          style={styles.listView}
          dataSource={this.state.dataSource}
          renderFooter={this.renderFooter}
          renderRow={this.renderRow}
          onEndReached={this.onEndReached}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={true}
          loadData={this.refreshData}
          refreshDescription="Refreshing Data ..."
          contentInset={this.state.contentInset}
        />
    }
    /*renderSeparator={this.renderSeparator}*/
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  },
});

var styles = getAreaScreenStyles();

module.exports = MonthlyTargetScreen;

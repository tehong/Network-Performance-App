'use strict';

var React = require('react-native');
var {
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

const NO_VALUE = -99999.99;

var cachedAreas = undefined;
var ROW_HEIGHT = 198;
var prepareCommentBox = require('./utils/prepareCommentBox');
var scrollToByTimeout = require('./utils/scrollToByTimeout');
var RefreshableListView = require('react-native-refreshable-listview');

var MonthlyTargetCell = require('./components/MonthlyTargetCell');
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
      contentInset: global.contentInset,
    };
  },
  getRestEndPoint: function() {
    // if (!(global.restService && global.restService.monthlyTargetUrl)) {
    if (!(global.restService && global.restService.networkPerfUrl)) {
      // periodic check if the service URL is retrieved
      var interval = this.setInterval(
        () => {
          // if (global.restService && global.restService.networkPerfUrl) {
            // MONTHLY_TARGET_URL = global.restService.networkPerfUrl;
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
      // MONTHLY_TARGET_URL = global.restService.networkPerfUrl;
      this.getAreas('area');
    }
  },
  componentWillMount: function() {
    this.getRestEndPoint();
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
  },
  componentDidMount: function() {
    if (!global.navCommentProps) {
    // need to get data again to make sure we have scroll responder set
      if (this.props.entityType) {
        saveEntityTypeInCloud(this.props.entityType);
      }
    }
    this.scrollToRightListItem();
  },
  componentWillUnmount: function() {
  },
  scrollToRightListItem: function() {
    // see if we need to auto scroll to the right site first
    // We need pre-scroll to the right item for comment auto-nav
    //  because some list item are dynamically loaded when too long
    scrollToByTimeout(this, this.props.entityType, ROW_HEIGHT);
  },
  reloadData: function() {
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
    this.getAreas('area');
  },
  refreshData: function() {
    // need to make sure we ended up at the right network screen index
    // this.props.setScrollIndex();
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
  addUtilData: function(areas) {
    var getThreshold = require('./utils/getThreshold');
    for (var i=0;i<areas.length; i++) {
      // FIXME: temporary patches to make the feed navigation work correctly with the old monthly target service API
      if (!areas[i].name) {
        areas[i].name = "Monthly Target";
        areas[i].areaName = "Thumb";
        areas[i].parentEntityName = "Thumb";
      }
      // reset the isCommentOn flag
      areas[i].isCommentOn = false;
      if (areas[i].dataexp) {
        var dataexp = areas[i].dataexp;
        var newData = [];
        // use the dataexp to fill in the data array if needed
        // starting with index 0
        var k = 0;
        // fill up to 31 days of a month
        for (var j=0; j<31; j++) {
          // once the k is used, do not use it again
          if(k<dataexp.length) {
            if (parseInt(dataexp[k][0].substring(8,10)) === j+1) {
              newData[j] = [j, dataexp[k][1]];
              k++;
            } else {
              newData[j] = [j, ];
            }
          } else {
            // override the data withe the new data array
            areas[i].data = newData;
            break; // ran out of dataexp entry, stop filling the newData
          }
        }
      }
    }
    return areas;
  },
  getDataSource: function(areas: Array<any>): ListView.DataSource {
    // Sort by red then yellow then green backgroundImage
    var sortedAreas = getSortedDataArray(areas, this.props.entityName);
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
      <MonthlyTargetCell
        key={area.id}
        onSelect={() => {}}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={area}
        areaName={area.areaName}
        entityType={this.props.entityType}
        entityName={this.props.entityName}
        onToggleComment={(showComment) => {
          // this.props.setScrollIndex();  // always need to the correct index
          area["isCommentOn"] = showComment;
          var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, area, ROW_HEIGHT, true);
          this.setState({
            contentInset: contentInset,
          });
        }}
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
    } else if (this.state.dataSource.getRowCount() === 0) {
        var content = <ShowModalMessage
          filter={this.state.filter}
          statusCode={this.state.statusCode}
          statusMessage={this.state.statusMessage}
          isLoading={this.state.isLoading}
          onPressRefresh={this.reloadData}
          buttonText={'Try Again'}
        />;
    } else {
      var content = <RefreshableListView
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
      <View style={styles.subScreenContainer}>
        {content}
      </View>
    );
  },
});

var styles = getAreaScreenStyles();

module.exports = MonthlyTargetScreen;

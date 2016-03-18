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
var prepareCommentBox = require('./utils/prepareCommentBox');
var scrollToByTimeout = require('./utils/scrollToByTimeout');
var TimerMixin = require('react-timer-mixin');
var RefreshableListView = require('react-native-refreshable-listview');

var PerformanceCell = require('./components/PerformanceCell');
var RefreshScreen = require('./RefreshScreen');
var ZoneScreen = require('./ZoneScreen');
var SiteScreen = require('./SiteScreen');
var SearchBar = require('./components/SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var Parse = require('parse/react-native');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var ShowModalMessage = require('./components/ShowModalMessage');
var saveEntityTypeInCloud = require('./utils/saveEntityTypeInCloud');

// title for the next scene
/* zone */
/*
var AccNavTitle = require('./components/icons/zones/AccNavTitle');
var CSFBNavTitle = require('./components/icons/zones/CSFBNavTitle');
var VOLTEAccNavTitle = require('./components/icons/zones/VOLTEAccNavTitle');
var RetNavTitle = require('./components/icons/zones/RetNavTitle');
var VOLTERetNavTitle = require('./components/icons/zones/VOLTERetNavTitle');
var DltNavTitle = require('./components/icons/zones/DltNavTitle');
var UltNavTitle = require('./components/icons/zones/UltNavTitle');
var TNOLNavTitle = require('./components/icons/zones/TNOLNavTitle');
*/
/* sites */
var SiteNavTitle = require('./components/icons/sites/SiteNavTitle');
/*
var AccNavTitle = require('./components/icons/sites/AccNavTitle');
var CSFBNavTitle = require('./components/icons/sites/CSFBNavTitle');
var VOLTEAccNavTitle = require('./components/icons/sites/VOLTEAccNavTitle');
var RetNavTitle = require('./components/icons/sites/RetNavTitle');
var VOLTERetNavTitle = require('./components/icons/sites/VOLTERetNavTitle');
var DltNavTitle = require('./components/icons/sites/DltNavTitle');
var UltNavTitle = require('./components/icons/sites/UltNavTitle');
var TNOLNavTitle = require('./components/icons/sites/TNOLNavTitle');
*/

var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./utils/getSortedAreaDataArray');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var mixpanelTrack = require('./utils/mixpanelTrack');

/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
var NETWORK_URL = 'http://52.20.201.145:3010/kpis/v1/network/all/kpi/all';
// var NETWORK_URL = 'http://localhost:3010/kpis/v1/network/all/kpi/all';
// Dev DB access: 54.165.24.76
// var NETWORK_URL = 'http://54.165.24.76:3010/kpis/v1/network/all/kpi/all';

// Results should be cached keyed by the query
// with values of null meaning "being fetched"
// and anything besides null and undefined
// as the result of a valid query
var resultsCache = {
  dataForQuery: {},
  // nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};

var AreaScreen = React.createClass({

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
        rowHasChanged: (row1, row2) => {
          row1 !== row2;
        }
      }),
      filter: '',
      queryNumber: 0,
      closeAllCommentBoxes: false,
      contentInset: global.contentInset,  // leave room for the tab bar
    };
  },
  getRestEndPoint: function() {
    // periodic check if the URL is retrieved
    if (!(global.restService && global.restService.networkPerfUrl)) {
      var interval = this.setInterval(
        () => {
          if (global.restService && global.restService.networkPerfUrl) {
            NETWORK_URL = global.restService.networkPerfUrl;
            this.clearInterval(interval);
            // now we can get data
            this.getAreas('area');
          }
        },
        50, // checking every 50 ms
      );
    } else {
      NETWORK_URL = global.restService.networkPerfUrl;
      this.getAreas('area');
    }
  },
  componentWillMount: function() {
    this.getRestEndPoint();
    this._getAppBadgeValue();
    if (!global.navCommentProps) {
      this.mpAppState('active');
    }
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
  },
  componentDidMount: function() {
    // if not auto-nav to comment box, then do all of these
    if (!global.navCommentProps) {
    // need to get data again to make sure we have scroll responder set
      if (this.props.entityType) {
        saveEntityTypeInCloud(this.props.entityType);
      }
    }
    // see we need to auto nav to the next page to get to the comment item
    this.checkNavToComment(cachedAreas);
    AppStateIOS.addEventListener('change', this._handleAppStateChange);
    AppStateIOS.addEventListener('memoryWarning', this._handleMemoryWarning);
  },
  componentWillUnmount: function() {
    AppStateIOS.removeEventListener('change', this._handleAppStateChange);
    AppStateIOS.removeEventListener('memoryWarning', this._handleMemoryWarning);
  },
  _handleAppStateChange: function(currentAppState) {
    // setState doesn't set the state immediately until the render runs again so this.state.currentAppState is not updated now
    var previousAppStates = this.state.previousAppStates.slice();
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
      mixpanelTrack("App Active", {"App Version": global.BeeperVersion}, global.currentUser);
    } else if (currentAppState === 'background') {
      // save the last app state
      this.setState({lastSaveAppState: currentAppState});
      mixpanelTrack("App Background", {"App Version": global.BeeperVersion}, global.currentUser);
    } else if (currentAppState === 'inactive') {
      // save the last app state
      this.setState({lastSaveAppState: currentAppState});
      mixpanelTrack("App Inactive", {"App Version": global.BeeperVersion}, global.currentUser);
    }
  },
  mpAppMemoryWarning: function() {
    mixpanelTrack("App Memory Warning", {"App Version": global.BeeperVersion}, this.state.currentUser);
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
  reloadData: function() {
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
    this.getAreas('area');
  },
  refreshData: function() {
    // need to make sure we ended up at the right network screen index
    // FIXME: this.props.setScrollIndex();
    this.setState({
      isRefreshing: true,
    });

    this.reloadData();
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
      return (
        NETWORK_URL
      );
  },
  fetchData: function(query, queryString) {
    console.log("queryString = " + queryString);
    var _this = this;  // ready for promise processing
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
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
              // Sort by red then yellow then green backgroundImage
              LOADING[query] = false;
              resultsCache.totalForQuery[query] = areas.length;
              resultsCache.dataForQuery[query] = areas;
              // resultsCache.nextPageNumberForQuery[query] = 2;
              if (this.state.filter !== query) {
                // do not update state if the query is stale
                return;
              }
              _this.setState({
                isLoading: false,
                isRefreshing: false,
                // dataSource: this.getDataSource(responseData.movies),
                dataSource: this.getDataSource(areas),
              });
              this.checkNavToComment(areas);
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
        this.setState({
          isLoading: false,
          isRefreshing: false,
        });
      })

      /*`
    var areas = require('../simulatedData/Areas.json');
    if (areas) {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = areas.result.length;
        resultsCache.dataForQuery[query] = areas.result;
        // resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          // dataSource: this.getDataSource(responseData.movies),
          dataSource: this.getDataSource(areas.result),
        });
    } else {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
    }
    */
  },
  checkNavToComment: function(areas: object) {
    // see we need to auto nav to the next page to get to the comment item
    // we need to make sure that this page loaded and routing is done before navigate to the next page
    // do periodic checking
    if (!areas || global.networkRouting) {
      var interval = this.setInterval(
        () => {
          if (areas && !global.networkRouting) {
            this.clearInterval(interval);
            // now we can get data
            this.navigateToComment(areas);
          }
        },
        25, // checking every 25 ms
      );
    } else {
      this.navigateToComment(areas);
    }
  },
  navigateToComment: function(areas: object) {
    if (global.navCommentProps &&
      (global.navCommentProps.entityType.toLowerCase() === "site" ||
      global.navCommentProps.entityType.toLowerCase() === "sector")) {
      // need to run the sorted data array because it modifies the record slightly
      var kpi = global.navCommentProps.kpi;
      var sortedAreas = getSortedDataArray(areas);
      for (var i=0; i<sortedAreas.length; i++) {
        var kpiName = sortedAreas[i].category.toLowerCase()+ "_" + sortedAreas[i].kpi.replace(/ /g, "_").toLowerCase();
if (!global.navCommentProps.siteName) debugger;
        var siteName = global.navCommentProps.siteName;
        if (kpi === kpiName) {
          /*
          if (siteName === "red" || siteName === "grey" || siteName === "green" || siteName === "yellow") {
            this.selectSectorKpi(sortedAreas[i], siteName);
          } else {
          */
            this.selectKpi(sortedAreas[i], false);
          // }
        }
      }
    }
  },
  getAreas: function(query: string) {
    this.timeoutID = null;

    this.setState({filter: query});

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
      queryNumber: this.state.queryNumber + 1,
      // isLoadingTail: false,
    });

    var queryString = this._urlForQueryAndPage(query, 1);
    // now fetch data
    this.fetchData(query, queryString);
  },

  /*
  hasMore: function(): boolean {
    var query = this.state.filter;
    if (!resultsCache.dataForQuery[query]) {
      return true;
    }
    return (
      resultsCache.totalForQuery[query] !==
      resultsCache.dataForQuery[query].length
    );
  },
  */

  onEndReached: function() {
  /*
    var query = this.state.filter;
    if (!this.hasMore() || this.state.isLoadingTail) {
      // We're already fetching or have all the elements so noop
      return;
    }

    if (LOADING[query]) {
      return;
    }

    LOADING[query] = true;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: true,
    });

    var page = resultsCache.nextPageNumberForQuery[query];
    invariant(page != null, 'Next page number for "%s" is missing', query);
    fetch(this._urlForQueryAndPage(query, page))
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        LOADING[query] = false;
        this.setState({
          isLoadingTail: false,
        });
      })
      .then((responseData) => {
        var areasForQuery = resultsCache.dataForQuery[query].slice();

        LOADING[query] = false;
        // We reached the end of the list before the expected number of results
        if (!responseData.areas) {
          resultsCache.totalForQuery[query] = areasForQuery.length;
        } else {
          for (var i in responseData.areas) {
            areasForQuery.push(responseData.areas[i]);
          }
          resultsCache.dataForQuery[query] = areasForQuery;
          resultsCache.nextPageNumberForQuery[query] += 1;
        }

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoadingTail: false,
          dataSource: this.getDataSource(resultsCache.dataForQuery[query]),
        });
      })
      .done();
  */
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
    for (var i=0;i<areas.length; i++) {
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
    this.updateKpiNameInCloud(sortedAreas);  // populate the category name
    var sortedNetworkAreas = this.addUtilData(sortedAreas);
    return this.state.dataSource.cloneWithRows(sortedNetworkAreas);
  },
  selectKpi: function(area: Object, isMixpanel: bool) {
    if (isMixpanel) this.mpSelectKpi(area.category + " " + area.kpi);
    var titleComponent = SiteNavTitle;
    if (Platform.OS === 'ios') {
      Actions.site(
        {
          // dispatch: this.props.dispatch,   // need this to re-route to comments
          category: area.category,
          kpi: area.kpi,
          areaName: area.areaName,
          // setScrollIndex: this.props.setScrollIndex,
        }
      );
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: area.title,
        name: 'area',
        area: area,
      });
    }
  },
  selectKpiRed: function(area: Object) {
    this.mpSelectSectorColor(area.category + " " + area.kpi, "red");
    this.selectSectorKpi(area, "red");
  },
  selectKpiYellow: function(area: Object) {
    this.mpSelectSectorColor(area.category + " " + area.kpi, "yellow");
    this.selectSectorKpi(area, "yellow");
  },
  selectKpiGreen: function(area: Object) {
    this.mpSelectSectorColor(area.category + " " + area.kpi, "green");
    this.selectSectorKpi(area, "green");
  },
  selectKpiGrey: function(area: Object) {
    this.mpSelectSectorColor(area.category + " " + area.kpi, "grey");
    this.selectSectorKpi(area, "grey");
  },
  selectSectorKpi(area: Object, color: string) {
    // use lazy loading, this prevent possible loop require collision
    var SectorScreen = require('./SectorScreen');
    var SectorNavTitle = require('./components/icons/sectors/SectorNavTitle');
    var titleComponent = SectorNavTitle;
    if (Platform.OS === 'ios') {
      Actions.sector (
        {
          // dispatch: this.props.dispatch,   // need this to re-route to comments
          category: area.category,
          kpi: area.kpi,
          areaName: area.areaName,
          color: color,
          siteName: color,
          // setScrollIndex: this.props.setScrollIndex,
        }
      );
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: area.title,
        name: 'area',
        area: area,
      });
    }
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
    var isLoading = (this.state.isLoading || this.state.isRefreshing);
        // FIXME: setScrollIndex={this.props.setScrollIndex}
    return (
      <PerformanceCell
        key={area.id}
        onSelect={() => this.selectKpi(area, true)}
        onSelectRed={() => this.selectKpiRed(area)}
        onSelectYellow={() => this.selectKpiYellow(area)}
        onSelectGreen={() => this.selectKpiGreen(area)}
        onSelectGrey={() => this.selectKpiGrey(area)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={area}
        areaName={area.areaName}
        entityType={this.props.entityType}
        scrollIndex={this.props.scrollIndex}
        onToggleComment={(showComment) => {
          /* this.props.setScrollIndex(); */ // always need to the correct index
          area["isCommentOn"] = showComment;
          var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, area, ROW_HEIGHT, true);
          this.setState({
            contentInset: contentInset,
          });
        }}
        triggerScroll={() => scrollToByTimeout(this, ENTITY_TYPE, ROW_HEIGHT)}
      />
    );
  },

  render: function() {
    // initial loading => show the activity indicator.  Subsequent refreshing of the ListView => do not unload the ListView
    if ((this.state.isLoading && !this.state.isRefreshing) || !global.restService ) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 100}]}
        color={"#00A9E9"}
        size="large"
      />;
    } else {
      var content = this.state.dataSource.getRowCount() === 0 ?
        <ShowModalMessage
          filter={this.state.filter}
          statusCode={this.state.statusCode}
          statusMessage={this.state.statusMessage}
          isLoading={this.state.isLoading}
          onPressRefresh={this.reloadData}
          buttonText={'Try Again'}
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
      // ref={(c) => this._listview = c}
      // ref={view => this._scrollView = view}
    }
    /*renderSeparator={this.renderSeparator}*/
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  },
});

var NoAreas = React.createClass({
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var text = '';
    if (this.props.statusMessage && this.props.statusMessage !== "") {
      text = this.props.statusMessage + "\n(Status code: " + this.props.statusCode + ")";
    } else {
      // If we're looking at the latest areas, aren't currently loading, and
      // still have no results, show a message
      text = 'We have detected a problem with our system, we are working on it so please come back soon.';
    }
    /*
        <TouchableElement
          style={styles.iconTouch}
          onPress={this.props.onPressRefresh}
          underlayColor={"#105D95"}>
          <Text style={[styles.noResultText, {color: white}]}>Refresh Data</Text>
        </TouchableElement>
        */
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noResultText}>{text}</Text>
        <TouchableElement
          style={styles.iconTouch}
          onPress={this.props.onPressRefresh}
          underlayColor={"#105D95"}>
          <Text style={[styles.pressRefreshText, {color: "white"}]}>Refresh Data</Text>
        </TouchableElement>
      </View>
    );
  }
});
var styles = getAreaScreenStyles();

module.exports = AreaScreen;
//

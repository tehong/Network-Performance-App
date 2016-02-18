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

var TimerMixin = require('react-timer-mixin');
var RefreshableListView = require('react-native-refreshable-listview');

var PerformanceCell = require('./PerformanceCell');
var ZoneScreen = require('./ZoneScreen');
var SiteScreen = require('./SiteScreen');
var SearchBar = require('SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var ShowModalMessage = require('./components/ShowModalMessage');

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
var getSortedDataArray = require('./components/getSortedAreaDataArray');
var mixpanelTrack = require('./components/mixpanelTrack');

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
      appState: AppStateIOS.currentState,
      previousAppStates: [],
      statusCode: 408,  // default to request timeout
      statusMessage: "",  // show any result status message if present
      isLoading: false,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      // isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: '',
      queryNumber: 0,
    };
  },

  componentWillMount: function() {
  },
  componentDidMount: function() {
    // never hit, why?
    this.mpAppState('active');
    this.setState({appState: 'active'});
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
    //
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
    this.mpAppState(currentAppState);
  },
  _handleMemoryWarning: function() {
    this.setState({memoryWarnings: this.state.memoryWarnings + 1})
    this.mpAppMemoryWarning(this.state.memoryWarnings + 1);
  },
  componentWillMount: function() {
    this.getAreas('area');
  },

  reloadData: function() {
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
    this.getAreas('area');
  },
  refreshData: function() {
    this.setState({isRefreshing: true});
    this.reloadData();
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
      return (
        NETWORK_URL
      );
  },
  fetchData: function(query, queryString) {
    console.log("queryString = " + queryString);
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        if(responseData.statusCode && responseData.statusCode !== 200) {
          this.setState({
            isLoading: false,
            isRefreshing: false,
            statusCode: responseData.statusCode,
            statusMessage: responseData.statusMessage,
          });
        } else {
          var areas = responseData;
          if (areas) {
  // Test Data for missing data points
  /*
  areas[0].dailyAverage = 98.2;
  areas[0].data = [
  [0, "96.0"],
  [1, "97.5"],
  [2],
  [3, "98.0"],
  [4, "97.9"],
  [5, "97.0"],
  [6],
  [7, "99.8"],
  [8],
  [9, "99.7"],
  [10, "99.7"],
  [11, "99.7"],
  [12, "99.0"],
  [13, "99.7"],
  [14, "98.6"],
  [15],
  [16],
  [17],
  [18, "99.7"],
  [19, "98.9"],
  [20],
  [21],
  [22, "98.9"],
  [23]];
  */
              LOADING[query] = false;
              resultsCache.totalForQuery[query] = areas.length;
              resultsCache.dataForQuery[query] = areas;
              // resultsCache.nextPageNumberForQuery[query] = 2;
              if (this.state.filter !== query) {
                // do not update state if the query is stale
                return;
              }
              this.setState({
                isLoading: false,
                isRefreshing: false,
                // dataSource: this.getDataSource(responseData.movies),
                dataSource: this.getDataSource(areas),
              });
          } else {
              LOADING[query] = false;
              resultsCache.dataForQuery[query] = undefined;

              this.setState({
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
        this.setState({isLoading: true});
      }
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

  getDataSource: function(areas: Array<any>): ListView.DataSource {
    // Sort by red then yellow then green backgroundImage
    var sortedAreas = getSortedDataArray(areas);
    return this.state.dataSource.cloneWithRows(sortedAreas );
  },

  selectKpi: function(area: Object) {
    this.mpSelectKpi(area.category + " " + area.kpi);
    var titleComponent = SiteNavTitle;
    /*  no more special title for each KPI, changed to general title
    var cat = area.category.toLowerCase();
    var kpi = area.kpi;
    switch(kpi.toLowerCase()) {
      case "accessibility":
        if (cat === "data") {
          var titleComponent = AccNavTitle;
        } else {
          var titleComponent = VOLTEAccNavTitle;
        }
        break;
      case "retainability":
        if (cat === "data") {
          var titleComponent = RetNavTitle;
        } else {
          var titleComponent = VOLTERetNavTitle;
        }
        break;
      case "throughput":
        if (cat === "downlink") {
          var titleComponent = DltNavTitle;
        } else {
          var titleComponent = UltNavTitle;
        }
        break;
      case "tnol":
        var titleComponent = TNOLNavTitle;
        break;
      case "fallback":
        var titleComponent = CSFBNavTitle;
        break;
    }
    */
    // var newTitleComponent = React.render(<titleComponent area={"Zone"}/>);

    if (Platform.OS === 'ios') {
      ParseInitIOS.clearBadge();  // clear badge number on the app icon
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        // component: ZoneScreen,
        component: SiteScreen,
        headerStyle: styles.header,
        passProps: {
          category: area.category,
          kpi: area.kpi,
          areaName: area.name,
        }
      });
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
    this.mpSelectSectorColor(area.kpi, "red");
    this.selectSectorKpi(area, "red");
  },
  selectKpiYellow: function(area: Object) {
    this.mpSelectSectorColor(area.kpi, "yellow");
    this.selectSectorKpi(area, "yellow");
  },
  selectKpiGreen: function(area: Object) {
    this.mpSelectSectorColor(area.kpi, "green");
    this.selectSectorKpi(area, "green");
  },
  selectSectorKpi(area: Object, color: string) {
    // this.mpSelectKpi(area.category + " " + area.kpi);
    // use lazy loading, this prevent possible loop require collision
    var SectorScreen = require('./SectorScreen');
    var SectorNavTitle = require('./components/icons/sectors/SectorNavTitle');
    var titleComponent = SectorNavTitle;
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        // component: ZoneScreen,
        component: SectorScreen,
        headerStyle: styles.header,
        passProps: {
          category: area.category,
          kpi: area.kpi,
          areaName: area.name,
          color: color,
        }
      });
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
  mpAppState: function(currentAppState) {
    if (currentAppState === 'active') {
      mixpanelTrack("App Active", {"App Version": global.BeeperVersion}, global.currentUser);
      ParseInitIOS.clearBadge();  // clear badge number on the app icon
      Mixpanel.timeEvent("App Inactive");
      Mixpanel.timeEvent("App Background");
    } else if (currentAppState === 'background') {
      mixpanelTrack("App Background", {"App Version": global.BeeperVersion}, global.currentUser);
    } else if (currentAppState === 'inactive') {
      mixpanelTrack("App Inactive", {"App Version": global.BeeperVersion}, global.currentUser);
    }
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
    return (
      <PerformanceCell
        key={area.id}
        onSelect={() => this.selectKpi(area)}
        onSelectRed={() => this.selectKpiRed(area)}
        onSelectYellow={() => this.selectKpiYellow(area)}
        onSelectGreen={() => this.selectKpiGreen(area)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={area}
        geoEntity="area"
      />
    );
  },

  render: function() {
    // initial loading => show the activity indicator.  Subsequent refreshing of the ListView => do not unload the ListView
    if (this.state.isLoading && !this.state.isRefreshing) {
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
          showsVerticalScrollIndicator={false}
          loadData={this.refreshData}
          refreshDescription="Refreshing Data ..."
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

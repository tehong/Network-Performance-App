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
} = React;

// memory releasing list view
var SGListView = require('react-native-sglistview');

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./PerformanceCell');
var SectorScreen = require('./SectorScreen');
var SearchBar = require('SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
// title for the next scene
/* no special KPI-based title for site performace
var AccNavTitle = require('./components/icons/sectors/AccNavTitle');
var CSFBNavTitle = require('./components/icons/sectors/CSFBNavTitle');
var VOLTEAccNavTitle = require('./components/icons/sectors/VOLTEAccNavTitle');
var RetNavTitle = require('./components/icons/sectors/RetNavTitle');
var VOLTERetNavTitle = require('./components/icons/sectors/VOLTERetNavTitle');
var DltNavTitle = require('./components/icons/sectors/DltNavTitle');
var UltNavTitle = require('./components/icons/sectors/UltNavTitle');
var TNOLNavTitle = require('./components/icons/sectors/TNOLNavTitle');
*/
var SectorNavTitle = require('./components/icons/sectors/SectorNavTitle');
var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./components/getSortedDataArray');
var mixpanelTrack = require('./components/mixpanelTrack');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;


/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
 var SITE_URL = 'http://52.20.201.145:3010/kpis/v1/site/all/';
 /*
var API_KEYS = [
  '7waqfqbprs7pajbz28mqf6vz',
  // 'y4vwv8m33hed9ety83jmv52f', Fallback api_key
];
*/

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

var SiteScreen = React.createClass({

  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: '',
      queryNumber: 0,
    };
  },

  componentWillMount: function() {
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
  },

  componentDidMount: function() {
    var uncorrectedKpi = this.props.kpi;
    var kpi = uncorrectedKpi.replace("Data ", "");
    kpi = kpi.replace("Uplink ", "");
    kpi = kpi.replace("Downlink ", "");
    var cat = this.props.category.toLowerCase();
    switch(kpi.toLowerCase()) {
      case "accessibility":
        if (cat === "data") {
          var query = "Data Accessibility";
        } else {
          var query = "VoLTE Accessibility";
        }
        break;
      case "retainability":
        if (cat === "data") {
          var query = "Data Retainability";
        } else {
          var query = "VoLTE Retainability";
        }
        break;
      case "throughput":
        if (cat === "downlink") {
          var query = "Downlink Throughput";
        } else {
          var query = "Uplink Throughput";
        }
        break;
      case "tnol":
        var query = "Data TNOL";
        break;
      case "fallback":
        var query = "CS Fallback";
        break;
    }
    if (query.indexOf("Throughput") > -1) {
      var category = "Data";
      var kpi = query;
    } else {
      var category = query.substring(0, query.indexOf(" "));
      var kpi = query.substring(query.indexOf(" ") + 1, query.length);
    }

    // inlcude query name with zoneName
    query = "category/" + category + "/kpi/" + kpi + "/";
    this.getSites(query);
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    // var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    if (query) {
      var queryString = SITE_URL + query;
    } else {
      var queryString = SITE_URL + 'category/' + this.props.category + '/kpi/' + this.props.kpi + '/'
    }
    return queryString;
  },
  fetchData: function(query, queryString) {
    // var queryString = 'https://52.20.201.145:55555/kpis/v1/site/930018_Watrousville_1/daily/kpi';
    // var queryString = 'http://52.20.201.145:3010/kpis/v1/site/930018_Watrousville_1/daily/kpi';
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
    // fetch(queryString)
      .then((response) => response.json())
      .then((responseData) => {
        var sites = responseData;
        if (sites) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = sites.length;
            resultsCache.dataForQuery[query] = sites;
            // resultsCache.nextPageNumberForQuery[query] = 2;

            if (this.state.filter !== query) {
              // do not update state if the query is stale
              return;
            }
            this.setState({
              isLoading: false,
              // dataSource: this.getDataSource(responseData.movies),
              dataSource: this.getDataSource(sites),
            });
        } else {
            LOADING[query] = false;
            resultsCache.dataForQuery[query] = undefined;

            this.setState({
              dataSource: this.getDataSource([]),
              isLoading: false,
            });
        }
      })
      .catch((ex) => {
        console.log('response failed', ex)
        this.setState({isLoading: false});
      })
  },
  getSites: function(query: string) {
    this.timeoutID = null;

    // NOTE: Since we are not really query via HTTP but directly via simulatedData files
    //       and there is no UI refresh, we update the state.filter directly for now
    //       THIS IS AN ABNORMAL USAGE!
    this.state.filter = query;
    // this.setState({filter: query});

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
      isLoadingTail: false,
    });

    var queryString = this._urlForQueryAndPage(query, 1);
    // console.log("SiteScreen queryString = " + queryString);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },

  getDataSource: function(sites: Array<any>): ListView.DataSource {
    var sortedMarkets = getSortedDataArray(sites);
    /*
    var filteredSet = [];
    for (var i in sortedMarkets) {
      if (sortedMarkets[i].parentEntityId == this.props.parentEntityId) {
        filteredSet.push(sortedMarkets[i]);  // save the right ones to the filtered set
      }
    }
    return this.state.dataSource.cloneWithRows(filteredSet);
    */
    return this.state.dataSource.cloneWithRows(sortedMarkets);
  },

  selectSite: function(site: Object) {
    this.mpSelectSite(site.name);
    var uncorrectedKpi = site.kpi;
    var kpi = uncorrectedKpi.replace("Data ", "");
    kpi = kpi.replace("Uplink ", "");
    kpi = kpi.replace("Downlink ", "");
    var titleComponent = SectorNavTitle;
    /* no special KPI-based title for the sector screen
    var cat = site.category.toLowerCase();
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
    if (Platform.OS === 'ios') {
      ParseInitIOS.clearBadge();  // clear badge number on the app icon
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        component: SectorScreen,
        headerStyle: styles.header,
        passProps: {
          category: site.category,
          kpi: site.kpi,
          areaName: this.props.areaName,
          currentUser: this.props.currentUser,
          zoneName: site.name,
        }
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: site.title,
        name: 'site',
        site: site,
      });
    }
  },
  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getSites(filter), 100);
  },
  mpSelectSite: function(siteName) {
    mixpanelTrack("Site Selected", {"Site Name": siteName}, this.props.currentUser);
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
    site: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PerformanceCell
        key={site.id}
        onSelect={() => this.selectSite(site)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={site}
        geoEntity="site"
      />
    );
  },

  render: function() {
    if (this.state.isLoading) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 100}]}
        color={"#00A9E9"}
        size="large"
      />;
    } else {
      var content = this.state.dataSource.getRowCount() === 0 ?
        <NoSites
          filter={this.state.filter}
          isLoading={this.state.isLoading}
        /> :
        <SGListView
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
        />;
        /*renderSeparator={this.renderSeparator}*/
    }

    return (
      <View style={styles.container}>
        {/*
        <SearchBar
          onSearchChange={this.onSearchChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo(0, 0)}
        />
        <View style={styles.separator} />
        */}
        {content}
      </View>
    );
  },
});

var NoSites = React.createClass({
  render: function() {
    var text = '';
    if (this.props.filter) {
      text = 'No sites found';
    } else if (!this.props.isLoading) {
      // If we're looking at the latest sites, aren't currently loading, and
      // still have no results, show a message
      text = 'No sites found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noResultText}>{text}</Text>
      </View>
    );
  }
});
var styles = getAreaScreenStyles();

module.exports = SiteScreen;
//

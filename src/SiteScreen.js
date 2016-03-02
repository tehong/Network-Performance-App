'use strict';

var React = require('react-native');
var {
  ActivityIndicatorIOS,
  ListView,
  Platform,
  // ProgressBarAndroid,
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} = React;

var cachedSites = undefined;
var ROW_HEIGHT = 198;
var prepareCommentBox = require('./utils/prepareCommentBox');

// memory releasing list view
// list view with less memory usage
var SGListView = require('react-native-sglistview');

var RefreshableListView = require('react-native-refreshable-listview');

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./components/PerformanceCell');
var SectorScreen = require('./SectorScreen');
var SearchBar = require('./components/SearchBar');
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
var getSortedDataArray = require('./utils/getSortedDataArray');
var mixpanelTrack = require('./utils/mixpanelTrack');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var ShowModalMessage = require('./components/ShowModalMessage');
var saveEntityTypeInCloud = require('./utils/saveEntityTypeInCloud');


/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
//  var SITE_URL = 'http://52.20.201.145:3010/kpis/v1/site/all/'; // v1
var SITE_URL = 'http://52.20.201.145:3010/kpis/v2/site/all/kpi/'; // v2
// var SITE_URL = 'http://54.165.24.76:3010/kpis/v2/site/all/kpi/'; // v2
// var SITE_URL = 'http://localhost:3010/kpis/v2/site/all/kpi/';  // localhost
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
      statusCode: 200,  // default to OK
      statusMessage: "",  // show any result status message if present
      isLoading: false,
      isRefreshing: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: '',
      queryNumber: 0,
    };
  },

  componentWillMount: function() {
    this.setScrollToTimeout();
    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
    this.loadData();
  },
  loadData: function() {
    global.refreshFeedCount();
    var query =  this.props.category + " " + this.props.kpi;
    this.getSites(query);
  },
  reloadData: function() {
    resultsCache.totalForQuery = {};
    resultsCache.dataForQuery = {};
    this.loadData();
  },
  refreshData: function() {
    this.setState({isRefreshing: true});
    this.reloadData();
  },
  componentDidMount: function() {
    if (this.props.entityType) {
      saveEntityTypeInCloud(this.props.entityType);
    }
    // see we need to auto nav to the next page to get to the comment item
    this.navigateToComment(cachedSites);
  },
  // scroll to entity if needed
  scrollToEntity: function(entity) {
    if (entity) {
      var findScrollItem = require('./utils/findScrollItem');
      var item = findScrollItem(this.state.dataSource, entity);
      if (item) {
        var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, item, true, ROW_HEIGHT);
        this.setState({
          contentInset: contentInset,
        });
      }
    }
  },
  setScrollToTimeout: function() {
    if (global.navCommentProps && global.navCommentProps.entityType.toLowerCase() === "site") {
      var navCommentProps = global.navCommentProps;
      global.navCommentProps = undefined;
      // this.reloadData();
      // var refValidation = 0;
      var interval = this.setInterval(
        () => {
          // refValidation++;
          if(this.refs.listview) {
            // if(refValidation > 1) {
              this.scrollToEntity(this.state.navCommentProps);
              this.clearInterval(interval);
              /*
              global.navCommentProps = undefined;
              this.setState({
                navCommentProps: undefined,
              })
              */
            // }
          }
        },
        100, // trigger scrolling 500 ms later
      );
    }
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
    var _this = this;  // saved for promise processing
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
    // fetch(queryString)
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
        var sites = responseData;
        if (sites) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = sites.length;
            resultsCache.dataForQuery[query] = sites;
            // resultsCache.nextPageNumberForQuery[query] = 2;

            if (_this.state.filter !== query) {
              // do not update state if the query is stale
              return;
            }
            _this.setState({
              isLoading: false,
              isRefreshing: false,
              // dataSource: _this.getDataSource(responseData.movies),
              dataSource: _this.getDataSource(sites),
            });
            _this.navigateToComment(sites);
        } else {
            LOADING[query] = false;
            resultsCache.dataForQuery[query] = undefined;

            _this.setState({
              dataSource: _this.getDataSource([]),
              isLoading: false,
              isRefreshing: false,
            });
        }
      }
    })
    .catch((ex) => {
      console.log('response failed', ex)
      _this.setState({
        isLoading: false,
        isRefreshing: false,
      });
    })
  },
  navigateToComment: function(sites: object) {
    if (!sites) return;
    // see if we need to auto nav to the next page to get to the comment item
    if (global.navCommentProps && global.navCommentProps.entityType.toLowerCase() === "sector") {
      // need to run the sorted data array because it modifies the record slightly
      var kpi = global.navCommentProps.kpi;
      var site = global.navCommentProps.siteName;
      var sortedSites = getSortedDataArray(sites);
      for (var i=0; i<sortedSites.length; i++) {
        var kpiName = sortedSites[i].category.toLowerCase()+ "_" + sortedSites[i].kpi.replace(/ /g, "_").toLowerCase();
        var siteName = sortedSites[i].name.toLowerCase();
        if (site === siteName && kpi === kpiName) {
          this.selectSite(sortedSites[i]);
        }
      }
    }
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
        this.setState({
          isLoading: true,
        });
      }
      // see we need to auto nav to the next page to get to the comment item
      // this.navigateToComment(cachedResultsForQuery);
      cachedSites = cachedResultsForQuery;
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
    console.log("SiteScreen queryString = " + queryString);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },

  getDataSource: function(sites: Array<any>): ListView.DataSource {
    var sortedSites = getSortedDataArray(sites);
    /*
    var filteredSet = [];
    for (var i in sortedSites) {
      if (sortedSites[i].parentEntityId == this.props.parentEntityId) {
        filteredSet.push(sortedSites[i]);  // save the right ones to the filtered set
      }
    }
    return this.state.dataSource.cloneWithRows(filteredSet);
    */
    return this.state.dataSource.cloneWithRows(sortedSites);
  },

  selectSite: function(site: Object) {
    this.mpSelectSite(site.name);
    /*
    var uncorrectedKpi = site.kpi;
    var kpi = uncorrectedKpi.replace("Data ", "");
    kpi = kpi.replace("Uplink ", "");
    kpi = kpi.replace("Downlink ", "");
    */
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
      console.log("props: " + this.props);
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        component: SectorScreen,
        headerStyle: styles.header,
        passProps: {
          entityType: 'sector',
          category: site.category,
          kpi: site.kpi,
          areaName: this.props.areaName,
          siteName: site.name,
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
    mixpanelTrack("Site Selected", {"Site Name": siteName}, global.currentUser);
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
        areaName={this.props.areaName}
        siteName={site.name}
        entityType={this.props.entityType}
        onToggleComment={(showComment) => {
          area["isCommentOn"] = showComment;
          var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, site, showComment, ROW_HEIGHT);
          this.setState({
            contentInset: contentInset,
          });
        }}
        navCommentProps={this.state.navCommentProps}
        triggerScroll={this.setScrollToTimeout}
      />
    );
  },

  render: function() {
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
        /> :
        <RefreshableListView
          listViewComponent={SGListView}
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
        />;
        /*renderSeparator={this.renderSeparator}*/
    }

    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  },
});

var NoSites = React.createClass({
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var text = '';
    if (this.props.statusMessage && this.props.statusMessage !== "") {
      text = this.props.statusMessage;
    } else {
      // If we're looking at the latest sites, aren't currently loading, and
      // still have no results, show a message
      text = 'No sites found';
    }

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

module.exports = SiteScreen;
//

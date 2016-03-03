'use strict';

var ENTITY_TYPE = "sector";

var React = require('react-native');
var {
  ActivityIndicatorIOS,
  ListView,
  Platform,
  TouchableOpacity,
  // ProgressBarAndroid,
  StyleSheet,
  Text,
  View,
} = React;

var ROW_HEIGHT = 198;
var prepareCommentBox = require('./utils/prepareCommentBox');
var scrollToByTimeout = require('./utils/scrollToByTimeout');
// list view with less memory usage
var SGListView = require('react-native-sglistview');

var RefreshableListView = require('react-native-refreshable-listview');

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./components/PerformanceCell');
var SectorDetailScreen = require('./SectorDetailScreen');
var SearchBar = require('./components/SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var SectorDetailTitle = require('./components/icons/sectors/SectorDetailTitle');
/*
var AccNavTitle = require('./components/icons/sectors/AccNavTitle');
var AvaNavTitle = require('./components/icons/sectors/AvaNavTitle');
var RetNavTitle = require('./components/icons/sectors/RetNavTitle');
var DltNavTitle = require('./components/icons/sectors/DltNavTitle');
var UltNavTitle = require('./components/icons/sectors/UltNavTitle');
var MobNavTitle = require('./components/icons/sectors/MobNavTitle');
*/
var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./utils/getSortedDataArray');
var mixpanelTrack = require('./utils/mixpanelTrack');
var ShowModalMessage = require('./components/ShowModalMessage');
var saveEntityTypeInCloud = require('./utils/saveEntityTypeInCloud');

 /* with syringa */
 // var SECTOR_URL = 'http://52.20.201.145:3000/kpis/v1/sectors/zone/name/';
 /* with Thumb without the zone, just site */
 // var SECTOR_URL = 'http://52.20.201.145:3010/kpis/v1/sectors/site/';
 // DEV below
 var SECTOR_URL = 'http://52.20.201.145:3010/kpis/v2/sectors/site/';
 // var SECTOR_URL = 'http://54.165.24.76:3010/kpis/v2/sectors/site/';
 // var SECTOR_URL = 'http://localhost:3010/kpis/v2/sectors/site/';

 var SECTOR_COLOR_URL = 'http://52.20.201.145:3010/kpis/v2/sector/all/';
 // var SECTOR_COLOR_URL = 'http://54.165.24.76:3010/kpis/v2/sector/all/';
 // var SECTOR_COLOR_URL = 'http://localhost:3010/kpis/v2/sector/all/';
 // var SECTOR_COLOR_URL = 'http://52.20.201.145:3010/kpis/v1/sector/all/';
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

var SectorScreen = React.createClass({

  mixins: [TimerMixin],

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      statusCode: "",  // default to OK
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
    // this.setScrollToTimeout();

    // now every time the page is visited a new result is retrieved so basically the cache is usless
    // TODO  => we might have to take the cache out unless it is for paging
    // resultsCache.totalForQuery = {};
    // resultsCache.dataForQuery = {};
    if (this.props.entityType) {
      saveEntityTypeInCloud(this.props.entityType);
    }
    this.loadData();
  },
  loadData: function() {
    global.refreshFeedCount();
    /*
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
    // query = this.props.zoneName + "/category/" + category + "/kpi/" + kpi + "/";
    if (this.props.color) {
      query = "color/" + this.props.color+ "/category/" + category + "/kpi/" + kpi + "/";
    } else {
      query = this.props.zoneName + "/category/" + category + "/kpi/" + kpi + "/";
    }
    */
    if (this.props.color) {
      var query = "color/" + this.props.color + "/kpi/" + this.props.category + " " + this.props.kpi;
    } else {
      var query =  this.props.siteName + "/kpi/" + this.props.category + " " + this.props.kpi;
    }
    this.getSectors(query);
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
  },
  // scroll to entity if needed
  scrollToEntity: function(entity) {
    if (entity) {
      var findScrollItem = require('./utils/findScrollItem');
      var item = findScrollItem(this.state.dataSource, entity);
      if (item) {
        console.log("item found");
        var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, item, true, ROW_HEIGHT);
        this.setState({
          contentInset: contentInset,
        });
      }
    }
  },
  setScrollToTimeout: function() {
    if (global.navCommentProps && global.navCommentProps.entityType.toLowerCase() === "sector") {
      var navCommentProps = global.navCommentProps;
      global.navCommentProps = undefined;
      /*
      var refValidation = 0;
      this.setState({
        navCommentProps: navCommentProps,
      });
      */
      var interval = this.setInterval(
        () => {
          // refValidation++;
          if(this.refs.listview) {
            this.scrollToEntity(this.state.navCommentProps);
            this.clearInterval(interval);
          }
        },
        100, // trigger scrolling x ms later
      );
    }
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    // var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    if (query) {
      if (this.props.color) {
        var queryString = SECTOR_COLOR_URL + query;
      } else {
        var queryString = SECTOR_URL + query;
      }
    } else {
      if (this.props.color) {
        var queryString = SECTOR_COLOR_URL + 'color/' + this.props.color + '/category/' + this.props.category + '/kpi/' + this.props.kpi + '/'
      } else {
        var queryString = SECTOR_URL + this.props.siteName + '/category/' + this.props.category + '/kpi/' + this.props.kpi + '/'
      }
    }
    return queryString;
  },
  fetchData: function(query, queryString) {
    /*
    switch(query.toLowerCase()) {
      case "accessibility":
        var sectors = require('../simulatedData/SectorsAccessibility.json');
        break;
      case "retainability":
        var sectors = require('../simulatedData/SectorsRetainability.json');
        break;
      case "dlthroughput":
        var sectors = require('../simulatedData/SectorsDlThroughput.json');
        break;
      case "ulthroughput":
        var sectors = require('../simulatedData/SectorsUlThroughput.json');
        break;
      case "tnol":
        var sectors = require('../simulatedData/SectorsTNOL.json');
        break;
      case "volteaccessiblity":
        var sectors = require('../simulatedData/SectorsVOLTEAccessibility.json');
        break;
      case "volteretainability":
        var sectors = require('../simulatedData/SectorsVOLTERetainability.json');
        break;
      case "fallback":
        var sectors = require('../simulatedData/SectorsCSFB.json');
        break;
    }
    */
    // var queryString = 'https://52.20.201.145:55555/kpis/v1/sector/930018_Watrousville_1/daily/kpi';
    var _this = this;  // saved for the procmise processing
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
    // fetch(queryString)
      .then((response) => response.json())
      .then((responseData) => {
        if(responseData.message || (responseData.statusCode && responseData.statusCode !== 200)) {
          var message = responseData.statusMessage ? responseData.statusMessage : responseData.message;
          _this.setState({
            isLoading: false,
            isRefreshing: false,
            statusCode: responseData.statusCode,
            statusMessage: message,
          });
        } else {
          var sectors = responseData;
          if (sectors) {
              LOADING[query] = false;
              resultsCache.totalForQuery[query] = sectors.length;
              resultsCache.dataForQuery[query] = sectors;
              // resultsCache.nextPageNumberForQuery[query] = 2;

              if (_this.state.filter !== query) {
                // do not update state if the query is stale
                return;
              }
              _this.setState({
                isLoading: false,
                isRefreshing: false,
                // dataSource: _this.getDataSource(responseData.movies),
                dataSource: _this.getDataSource(sectors),
              });
              _this.navigateToComment(sectors);
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
  getSectors: function(query: string) {
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
    console.log("SectorScreen queryString = " + queryString);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },

  getDataSource: function(sectors: Array<any>): ListView.DataSource {
    var sortedSites = getSortedDataArray(sectors);
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

  selectSector: function(sector: Object) {
    this.mpSelectSector(sector.name);
    var titleComponent = SectorDetailTitle;
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        component: SectorDetailScreen,
        headerStyle: styles.header,
        passProps: {
          entityType: 'sector_detail',
          title: sector.title,
          sector: sector,
          areaName: this.props.areaName,
          siteName: this.props.siteName,
        }
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: sector.title,
        name: 'sector',
        sector: sector,
      });
    }
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getSectors(filter), 100);
  },
  mpSelectSector: function(sectorName) {
    mixpanelTrack("Sector Selected", {"Sector Name": sectorName}, global.currentUser);
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
    sector: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PerformanceCell
        key={sector.id}
        onSelect={() => this.selectSector(sector)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={sector}
        areaName={this.props.areaName}
        siteName={sector.parentEntityName}
        sectorName={sector.name}
        color={this.props.color}
        entityType={this.props.entityType}
        onToggleComment={(showComment) => {
          this.props.setScrollIndex();
          sector["isCommentOn"] = showComment;
          var contentInset = prepareCommentBox(this.refs.listview, this.state.dataSource, sector, showComment, ROW_HEIGHT, true);
          this.setState({
            contentInset: contentInset,
          });
        }}
        navCommentProps={this.state.navCommentProps}
        triggerScroll={() => scrollToByTimeout(this, ENTITY_TYPE, ROW_HEIGHT)}
      />
    );
  },

  render: function() {
    // don't show activitt indicator when refreshing
    if (this.state.isLoading && !this.state.isRefreshing) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 100}]}
        color={"#00A9E9"}
        size="large"
      />;
    } else {
      var message =
        <NoSectors
          filter={this.state.filter}
          statusCode={this.state.statusCode}
          statusMessage={this.state.statusMessage}
          isLoading={this.state.isLoading}
        />;
      if (this.state.statusCode && this.state.statusCode !== "") {
        message =
        <ShowModalMessage
          filter={this.state.filter}
          statusCode={this.state.statusCode}
          statusMessage={this.state.statusMessage}
          isLoading={this.state.isLoading}
          onPressRefresh={this.reloadData}
          buttonText={'Try Again'}
        />;
      }
      var content = this.state.dataSource.getRowCount() === 0 ?
        message
        :
        <RefreshableListView
          ref="listview"
          listViewComponent={SGListView}
          style={styles.listView}
          removeClippedSubviews={true}
          scrollRenderAheadDistance={500}
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

var NoSectors = React.createClass({
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var text = '';
    if (this.props.statusMessage && this.props.statusMessage !== "") {
      text = this.props.statusMessage;
    } else {
      // If we're looking at the latest sectors, aren't currently loading, and
      // still have no results, show a message
      text = 'No sectors found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noResultText}>{text}</Text>
      </View>
    );
  }
});
var styles = getAreaScreenStyles();

module.exports = SectorScreen;

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
  ActivityIndicatorIOS,
} = React;

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./PerformanceCell');
var SectorScreen = require('./SectorScreen');
var SearchBar = require('SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var AccNavTitle = require('./components/icons/sectors/AccNavTitle');
var CSFBNavTitle = require('./components/icons/sectors/CSFBNavTitle');
var VOLTEAccNavTitle = require('./components/icons/sectors/VOLTEAccNavTitle');
var RetNavTitle = require('./components/icons/sectors/RetNavTitle');
var VOLTERetNavTitle = require('./components/icons/sectors/VOLTERetNavTitle');
var DltNavTitle = require('./components/icons/sectors/DltNavTitle');
var UltNavTitle = require('./components/icons/sectors/UltNavTitle');
var TNOLNavTitle = require('./components/icons/sectors/TNOLNavTitle');
var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./getSortedDataArray');


/**
 *  REST URL for zones and sectors
 */
var ZONE_URL = 'http://52.20.201.145:3000/kpis/v1/zone/all/kpi/';
var SECTOR_URL = 'http://52.20.201.145:3000/kpis/v1/sectors/zone/name/';

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

var ZoneScreen = React.createClass({

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
  },

  componentDidMount: function() {
    var kpi = this.props.kpi;
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
        var query = "Fallback";
        break;
    }
    this.getZoneKPI(query);
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    if (query) {
      return (
        ZONE_URL + query + '/'
        /*
        ZONE_URL + 'movies.json?apikey=' + '&q=' +
        encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber
        */
      );
    } else {
      // With no query, load latest zones
      var queryString = ZONE_URL + 'lists/movies/in_theaters.json?apikey=' + apiKey +
        '&page_limit=20&page=' + pageNumber
      return queryString;
    }
  },
  fetchData: function(query, queryString) {
    /*
    switch(query.toLowerCase()) {
      case "accessibility":
        var zones = require('../simulatedData/ZonesAccessibility.json');
        break;
      case "retainability":
        var zones = require('../simulatedData/ZonesRetainability.json');
        break;
      case "dlthroughput":
        var zones = require('../simulatedData/ZonesDlThroughput.json');
        break;
      case "ulthroughput":
        var zones = require('../simulatedData/ZonesUlThroughput.json');
        break;
      case "volteaccessibility":
        var zones = require('../simulatedData/ZonesVOLTEAccessibility.json');
        break;
      case "volteretainability":
        var zones = require('../simulatedData/ZonesVOLTERetainability.json');
        break;
      case "tnol":
        var zones = require('../simulatedData/ZonesTNOL.json');
        break;
      case "fallback":
        var zones = require('../simulatedData/ZonesCSFB.json');
        break;
    }
    */

    console.log("ZoneScreen queryString = " + queryString);
    fetch(queryString)
      .then((response) => response.json())
      .then((responseData) => {
        var zones = responseData;
        if (zones) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = zones.length;
            resultsCache.dataForQuery[query] = zones;
            // resultsCache.nextPageNumberForQuery[query] = 2;
            if (this.state.filter !== query) {
              // do not update state if the query is stale
              return;
            }
            this.setState({
              isLoading: false,
              // dataSource: this.getDataSource(responseData.movies),
              dataSource: this.getDataSource(zones),
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
  getZoneKPI: function(query: string) {
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
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {

  },

  getDataSource: function(zones: Array<any>): ListView.DataSource {
    var sortedZones = getSortedDataArray(zones);
    return this.state.dataSource.cloneWithRows(sortedZones);
  },

  selectSector: function(zone: Object) {
    var uncorrectedKpi = zone.kpi;
    var kpi = uncorrectedKpi.replace("Data ", "");
    kpi = kpi.replace("Uplink ", "");
    kpi = kpi.replace("Downlink ", "");
    var cat = zone.category.toLowerCase();
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
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: titleComponent,
        backButtonComponent: BackButton,
        rightCorner: LogoRight,
        component: SectorScreen,
        headerStyle: styles.header,
        passProps: {
          category: zone.category,
          kpi: zone.kpi,
          areaName: this.props.areaName,
          zoneName: zone.name,
        }
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: zone.title,
        name: 'zone',
        zone: zone,
      });
    }
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getZoneKPI(filter), 100);
  },

  renderFooter: function() {
    // if (!this.hasMore() || !this.state.isLoadingTail) {
      return <View style={styles.scrollSpinner} />;
    // }
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
    zone: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PerformanceCell
        key={zone.id}
        onSelect={() => this.selectSector(zone)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={zone}
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
        <NoZones
          filter={this.state.filter}
          isLoading={this.state.isLoading}
        /> :
        <ListView
          ref="listview"
          dataSource={this.state.dataSource}
          renderFooter={this.renderFooter}
          renderRow={this.renderRow}
          onEndReached={this.onEndReached}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false}
        />;
    }
        /*renderSeparator={this.renderSeparator}*/

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

var NoZones = React.createClass({
  render: function() {
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      // If we're looking at the latest zones, aren't currently loading, and
      // still have no results, show a message
      text = 'No zones found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noMoviesText}>{text}</Text>
      </View>
    );
  }
});

var styles = getAreaScreenStyles();
module.exports = ZoneScreen;
//

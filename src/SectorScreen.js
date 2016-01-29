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

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./PerformanceCell');
var SectorDetailScreen = require('./SectorDetailScreen');
var SearchBar = require('SearchBar');
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
var getSortedDataArray = require('./components/getSortedDataArray');
var mixpanelTrack = require('./components/mixpanelTrack');

 /* with syringa */
 // var SECTOR_URL = 'http://52.20.201.145:3000/kpis/v1/sectors/zone/name/';
 /* with Thumb without the zone, just site */
 var SECTOR_URL = 'http://52.20.201.145:3010/kpis/v1/sectors/site/';
 // var SECTOR_COLOR_URL = 'http://54.165.24.76:3010/kpis/v1/sector/all/';
 var SECTOR_COLOR_URL = 'http://52.20.201.145:3010/kpis/v1/sector/all/';
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
    // query = this.props.zoneName + "/category/" + category + "/kpi/" + kpi + "/";
    if (this.props.color) {
      query = "color/" + this.props.color+ "/category/" + category + "/kpi/" + kpi + "/";
    } else {
      query = this.props.zoneName + "/category/" + category + "/kpi/" + kpi + "/";
    }
    this.getSectors(query);
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
        var queryString = SECTOR_URL + this.props.zoneName + '/category/' + this.props.category + '/kpi/' + this.props.kpi + '/'
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
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
    // fetch(queryString)
      .then((response) => response.json())
      .then((responseData) => {
        var sectors = responseData;
        if (sectors) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = sectors.length;
            resultsCache.dataForQuery[query] = sectors;
            // resultsCache.nextPageNumberForQuery[query] = 2;

            if (this.state.filter !== query) {
              // do not update state if the query is stale
              return;
            }
            this.setState({
              isLoading: false,
              // dataSource: this.getDataSource(responseData.movies),
              dataSource: this.getDataSource(sectors),
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
    console.log("SectorScreen queryString = " + queryString);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },

  getDataSource: function(sectors: Array<any>): ListView.DataSource {
    var sortedMarkets = getSortedDataArray(sectors);
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
          title: sector.title,
          sector: sector,
          areaName: this.props.areaName,
          currentUser: this.props.currentUser,
          zoneName: this.props.zoneName,
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
    mixpanelTrack("Sector Selected", {"Sector Name": sectorName}, this.props.currentUser);
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
        color={this.props.color}
        geoEntity="sector"
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
        <NoSectors
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
    var text = '';
    if (this.props.filter) {
      text = 'No sectors found';
    } else if (!this.props.isLoading) {
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
//

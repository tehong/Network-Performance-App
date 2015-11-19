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
var LogoATT = require('./components/icons/LogoATT');
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
var getSortedDataArray = require('./getSortedDataArray');

/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/';
var API_KEYS = [
  '7waqfqbprs7pajbz28mqf6vz',
  // 'y4vwv8m33hed9ety83jmv52f', Fallback api_key
];

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
  },

  componentDidMount: function() {
    var parentKpi = this.props.parentKpi;
    var cat = this.props.category.toLowerCase();
    switch(parentKpi.toLowerCase()) {
      case "accessibility":
        if (cat === "data") {
          var query = "accessibility";
        } else {
          var query = "volteaccessiblity";
        }
        break;
      case "retainability":
        if (cat === "data") {
          var query = "retainability";
        } else {
          var query = "volteretainability";
        }
        break;
      case "throughput":
        if (cat === "downlink") {
          var query = "dlthroughput";
        } else {
          var query = "ulthroughput";
        }
        break;
      case "tnol":
        var query = "dlthroughput";
        break;
    }
    this.getMarkets(query);
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    if (query) {
      return (
        API_URL + 'movies.json?apikey=' + apiKey + '&q=' +
        encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber
      );
    } else {
      // With no query, load latest markets
      var queryString = API_URL + 'lists/movies/in_theaters.json?apikey=' + apiKey +
        '&page_limit=20&page=' + pageNumber
      return queryString;
    }
  },
  fetchData: function(query, queryString) {
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
        var Sectors = require('../simulatedData/SectorsTNOL.json');
        break;
      case "volteaccessiblity":
        var sectors = require('../simulatedData/SectorsVolteAccessibility.json');
        break;
      case "volteretainability":
        var sectors = require('../simulatedData/SectorsVolteRetainability.json');
        break;
    }
    if (sectors) {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = sectors.result.length;
        resultsCache.dataForQuery[query] = sectors.result;
        // resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          // dataSource: this.getDataSource(responseData.movies),
          dataSource: this.getDataSource(sectors.result),
        });
    } else {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
    }
  },
  getMarkets: function(query: string) {
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

  getDataSource: function(markets: Array<any>): ListView.DataSource {
    var sortedMarkets = getSortedDataArray(markets);
    var filteredSet = [];
    for (var i in sortedMarkets) {
      if (sortedMarkets[i].parentEntityId == this.props.parentEntityId) {
        filteredSet.push(sortedMarkets[i]);  // save the right ones to the filtered set
      }
    }
    return this.state.dataSource.cloneWithRows(filteredSet);
  },

  selectMarket: function(market: Object) {
    var titleComponent = SectorDetailTitle;
    if (Platform.OS === 'ios') {
      this.props.toRoute({
        titleComponent: titleComponent,
        leftCorner: BackButton,
        rightCorner: LogoATT,
        component: SectorDetailScreen,
        headerStyle: styles.header,
        passProps: {
          title: market.title,
          market: market,
          areaName: this.props.areaName,
        }
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: market.title,
        name: 'market',
        market: market,
      });
    }
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getMarkets(filter), 100);
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
    market: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <PerformanceCell
        key={market.id}
        onSelect={() => this.selectMarket(market)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        market={market}
      />
    );
  },

  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <NoMarkets
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

var NoMarkets = React.createClass({
  render: function() {
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      // If we're looking at the latest markets, aren't currently loading, and
      // still have no results, show a message
      text = 'No markets found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.noMoviesText}>{text}</Text>
      </View>
    );
  }
});
var styles = getAreaScreenStyles();

module.exports = SectorScreen;
//

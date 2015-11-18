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
var ZoneScreen = require('./ZoneScreen');
var SearchBar = require('SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoATT = require('./components/icons/LogoATT');
var AccNavTitle = require('./components/icons/zones/AccNavTitle');
var AvaNavTitle = require('./components/icons/zones/AvaNavTitle');
var RetNavTitle = require('./components/icons/zones/RetNavTitle');
var DltNavTitle = require('./components/icons/zones/DltNavTitle');
var UltNavTitle = require('./components/icons/zones/UltNavTitle');
var MobNavTitle = require('./components/icons/zones/MobNavTitle');
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

var AreaScreen = React.createClass({

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
    this.getMarkets('');
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
    var markets = require('../simulatedData/Areas.json');
    if (markets) {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = markets.result.length;
        resultsCache.dataForQuery[query] = markets.result;
        // resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          // dataSource: this.getDataSource(responseData.movies),
          dataSource: this.getDataSource(markets.result),
        });
    } else {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
    }
    /*
    fetch(queryString)
      .then((response) => response.json())
      .catch((error) => {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
      })
      .then((responseData) => {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = responseData.total;
        resultsCache.dataForQuery[query] = responseData.movies;
        resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }
        console.log(responseData);

        this.setState({
          isLoading: false,
          dataSource: this.getDataSource(responseData.movies),
        });
      })
      .done();
      */
  },
  getMarkets: function(query: string) {
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
      isLoadingTail: false,
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
        var marketsForQuery = resultsCache.dataForQuery[query].slice();

        LOADING[query] = false;
        // We reached the end of the list before the expected number of results
        if (!responseData.markets) {
          resultsCache.totalForQuery[query] = marketsForQuery.length;
        } else {
          for (var i in responseData.markets) {
            marketsForQuery.push(responseData.markets[i]);
          }
          resultsCache.dataForQuery[query] = marketsForQuery;
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

  getDataSource: function(markets: Array<any>): ListView.DataSource {
    // Sort by red then yellow then green backgroundImage
    var sortedMarkets = getSortedDataArray(markets);
    return this.state.dataSource.cloneWithRows(sortedMarkets);
  },

  selectMarket: function(market: Object) {
    var parentKpi = market.parentKpi;
    switch(parentKpi) {
      case "Accessibility":
        var titleComponent = AccNavTitle;
        break;
      case "Availability":
        var titleComponent = AvaNavTitle;
        break;
      case "Retainability":
        var titleComponent = RetNavTitle;
        break;
      case "Throughput":
        if (market.category === "Downlink") {
          var titleComponent = DltNavTitle;
        } else {
          var titleComponent = UltNavTitle;
        }
        break;
      case "Mobility":
        var titleComponent = MobNavTitle;
        break;
    }
    // var newTitleComponent = React.render(<titleComponent area={"Zone"}/>);

    if (Platform.OS === 'ios') {

      this.props.toRoute({
        titleComponent: titleComponent,
        leftCorner: BackButton,
        rightCorner: LogoATT,
        component: ZoneScreen,
        headerStyle: styles.header,
        passProps: {
          category: market.category,
          parentKpi: market.parentKpi,
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

module.exports = AreaScreen;
//

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
  Image,
} = React;

var TimerMixin = require('react-timer-mixin');

var PerformanceCell = require('./PerformanceCell');
var ZoneScreen = require('./ZoneScreen');
var SiteScreen = require('./SiteScreen');
var SearchBar = require('SearchBar');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
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
var AccNavTitle = require('./components/icons/sites/AccNavTitle');
var CSFBNavTitle = require('./components/icons/sites/CSFBNavTitle');
var VOLTEAccNavTitle = require('./components/icons/sites/VOLTEAccNavTitle');
var RetNavTitle = require('./components/icons/sites/RetNavTitle');
var VOLTERetNavTitle = require('./components/icons/sites/VOLTERetNavTitle');
var DltNavTitle = require('./components/icons/sites/DltNavTitle');
var UltNavTitle = require('./components/icons/sites/UltNavTitle');
var TNOLNavTitle = require('./components/icons/sites/TNOLNavTitle');

var getAreaScreenStyles = require('./styles/getAreaScreenStyles');
var getSortedDataArray = require('./components/getSortedAreaDataArray');

/**
 * This is for demo purposes only, and rate limited.
 * In case you want to use the Rotten Tomatoes' API on a real app you should
 * create an account at http://developer.rottentomatoes.com/
 */
// var NETWORK_URL = 'http://52.20.201.145:3000/kpis/v1/area/all/kpi/all';
// Thumb network URL
var NETWORK_URL = 'http://52.20.201.145:3010/kpis/v1/network/all/kpi/all';

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
    this.getAreas('area');
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
      return (
        NETWORK_URL
      );
  },
  fetchData: function(query, queryString) {
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        var areas = responseData;
        if (areas) {
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
              // dataSource: this.getDataSource(responseData.movies),
              dataSource: this.getDataSource(areas),
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

  selectArea: function(area: Object) {
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
    // var newTitleComponent = React.render(<titleComponent area={"Zone"}/>);

    if (Platform.OS === 'ios') {

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

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.getAreas(filter), 100);
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
        onSelect={() => this.selectArea(area)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        geoArea={area}
        geoEntity="area"
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
        <NoMarkets
          filter={this.state.filter}
          isLoading={this.state.isLoading}
        />
        :
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

var NoMarkets = React.createClass({
  render: function() {
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      // If we're looking at the latest areas, aren't currently loading, and
      // still have no results, show a message
      text = 'No area found';
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

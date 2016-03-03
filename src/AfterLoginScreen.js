/**
*  After login program entry
*/
'use strict';

var React = require('react-native');
// var Parse = require('parse/react-native');
var Router = require('gb-native-router');

var {
  TabBarIOS,
  StyleSheet,
  Text,
} = React;

var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var MonthlyNavTitle = require('./components/icons/areas/MonthlyNavTitle');
var FeedNavTitle = require('./components/icons/feeds/FeedNavTitle');
var AreaScreen = require('./AreaScreen');
var MonthlyTargetScreen = require('./MonthlyTargetScreen');
var FeedScreen = require('./FeedScreen');
// var ForwardButton = require('./components/icons/ForwardButton');
// var MonthlyTargetButton = require('./components/icons/MonthlyTargetButton');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var ParseInitIOS = require('react-native').NativeModules.ParseInit;
var Parse = require('parse/react-native');
var PerformanceSwipeScreen = require('./PerformanceSwipeScreen');


var firstPerfRoute = {
  // titleComponent: MonthlyNavTitle,
  titleComponent: PerfNavTitle,
  rightCorner: LogoRight,
  // component: MonthlyTargetScreen,
  // component: AreaScreen,
  component: PerformanceSwipeScreen,
  hideNavigationBar: false,
  trans: false,
  passProps: {
    // entityType: 'monthly',
    entityType: 'network',
  }
};

var firstFeedRoute = {
  titleComponent: FeedNavTitle,
  component: FeedScreen,
  rightCorner: LogoRight,
  hideNavigationBar: false,
  trans: false,
  passProps: {
    entityType: 'feed',
  }
};

module.exports = React.createClass({
  getInitialState: function() {
    return {
      feedViewDate: undefined,
      selectedTab: 'performance',
      notifCount: 0,
    }
  },
  componentDidMount: function() {
  },
  componentWillMount: function() {
    global.refreshFeedCount = this._getFeedCount;
    this._loadFeedInfoFromStorage();
    this._getAppBadgeValue();
  },
  componentWillUnmount: function() {
    global.refreshFeedCount = undefined;  // we are unmounting this, so better set this global to undefined
  },
  _getFeedCount: function() {
    if (!this.state.feedViewDate) {
        this.setState({notifCount: 0});
        return;
    }
    var Feed = Parse.Object.extend("Feed");
    // first find all Feeds in the Feed table
    var _this = this;  // always use this to get to the root component
    var query = new Parse.Query(Feed);
    query.greaterThan("createdAt", this.state.feedViewDate);
    query.count({
      success: function(count) {
        _this.setState({notifCount: count});
      },
      error: function(error) {
        _this.setState({notifCount: 0});
      }
    });
  },
  _getAppBadgeValue: async function() {
    try {
      var badgeValue = await ParseInitIOS.getBadgeValue();
      if (badgeValue > 0) {
        ParseInitIOS.clearBadge();
        this.setState({selectedTab: 'feed'});
      }
    } catch(e) {
      console.error(e);
    }
  },
  _loadFeedInfoFromStorage: function() {
    global.storage.load({
      key: global.FEED_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
      // autoSync(default true) means if data not found or expired,
      // then invoke the corresponding sync method
      autoSync: true,
      // syncInBackground(default true) means if data expired,
      // return the outdated data first while invoke the sync method.
      // It can be set to false to always return data provided by sync method when expired.(Of course it's slower)
      syncInBackground: true
    }).then( ret => {
      this.setState({
        feedViewDate: ret.feedViewDate,
      });
      this._getFeedCount();
    }).catch( err => {
      // save today's date
      this._saveFeedInfoToStorage(new Date());
    });
  },
  _saveFeedInfoToStorage: function(feedViewDate) {
    this.setState({
      feedViewDate: feedViewDate,
      notifCount: 0,
    });
    global.storage.save({
      key: global.FEED_STORAGE_TOKEN,   // Note: Do not use underscore("_") in key!
      rawData: {
        feedViewDate: feedViewDate,
      },

      // if not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expires.
      // set to 24 hours
      expires: null,
    });
  },
  renderPerfView: function() {
    return (
      // <Text>This is performance </Text>
      <Router
        firstRoute={firstPerfRoute}
        headerStyle={styles.header}
        backButtonComponent={BackButton}
      />
    );
  },
  renderFeedView: function() {
    return (
      // <Text>This is feed</Text>
      <Router
        firstRoute={firstFeedRoute}
        headerStyle={styles.header}
        backButtonComponent={BackButton}
      />
    );
  },
  render: function() {
          // icon={require('./assets/icons/Toolbar_Performance.png')}
          // icon={require('./assets/icons/Toolbar_Feed.png')}
    return (
      <TabBarIOS
        style={styles.container}
        tintColor="white"
        translucent={true}
        barTintColor="#414042"
        >
        <TabBarIOS.Item
          style={styles.tabItem}
          icon={require('./assets/icons/Toolbar_Performance.png')}
          selected={this.state.selectedTab === 'performance'}
          title=''
          onPress={() => {
            this._loadFeedInfoFromStorage();
            this.setState({
              selectedTab: 'performance',
            });
          }}>
          {this.renderPerfView()}
        </TabBarIOS.Item>
        <TabBarIOS.Item
          badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
          style={styles.tabItem}
          icon={require('./assets/icons/Toolbar_Feed.png')}
          title=''
          selected={this.state.selectedTab === 'feed'}
          onPress={() => {
            if (global.refreshFeed) {
              global.refreshFeed();
            }
            this._saveFeedInfoToStorage(new Date());
            ParseInitIOS.clearBadge();
            this.setState({
              selectedTab: 'feed',
            });
          }}>
          {this.renderFeedView()}
        </TabBarIOS.Item>
      </TabBarIOS>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabItem: {
    flex: 1,
    /*
    height: null,
    width: null,
    borderColor: 'red',
    borderWidth: 1,
    */
  },
  header: {
    backgroundColor: "#066D7E",
    // backgroundColor: "white",
  },
});

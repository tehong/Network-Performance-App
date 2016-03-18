/**
*  Main program entry
*/
'use strict';
// Program version number and customer visible release notes
var CustomerReleaseNotes = "\
(1) New Tab Bar.\n\
(2) New scene transition for User Profile Scene\n\
(3) Miscenllenous bug fixes.\
";

import Storage from 'react-native-storage';

var React = require('react-native');
var Moment = require('moment');
var Parse = require('parse/react-native');
// var Router = require('./Router');
var Router = require('gb-native-router');
var InfoPlist = require('react-native').NativeModules.InfoPlist;
var TimerMixin = require('react-timer-mixin');


var {
  View,
  Image,
  Text,
  StyleSheet,
  PushNotificationIOS,
  Navigator,
} = React;
var RNRF = require('react-native-router-flux');
var {Route, Schema, Animations, Actions, TabBar} = RNRF;

var LoginScreen = require('./LoginScreen');
var UserProfileScreen = require('./UserProfileScreen');
var RefreshScreen = require('./RefreshScreen');
var AfterLoginScreen = require('./AfterLoginScreen');
var FeedScreen = require('./FeedScreen');
var AreaScreen = require('./AreaScreen');
var SiteScreen = require('./SiteScreen');
var SectorScreen = require('./SectorScreen');
var SectorDetailScreen = require('./SectorDetailScreen');
var LogoRight = require('./components/icons/LogoRight');
var BackButton = require('./components/icons/BackButton');

var perfImageSrc_selected = require('./assets/icons/Toolbar_Performance_o.png');
var perfImageSrc_unselected = require('./assets/icons/Toolbar_Performance.png');
var feedImageSrc_selected = require('./assets/icons/Toolbar_Feed_o.png');
var feedImageSrc_unselected = require('./assets/icons/Toolbar_Feed.png');

import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'

function reducer(state = {}, action) {
    switch (action.type) {
        case Actions.BEFORE_ROUTE:
            console.log("BEFORE_ROUTE:", action);
            if (action.name === "network") {
              global.networkRouting = true;
            }
            if (action.name === "site") {
              global.siteRouting = true;
            }
            return state;
        case Actions.AFTER_ROUTE:
            console.log("AFTER_ROUTE:", action);
            var isRefreshScreen = false;
            switch(action.name) {
              case 'refreshScreen':
                global.isRefreshBadgeCount = false;
                break;
              case "network":
                global.networkRouting = undefined;
                isRefreshScreen = true;
                break;
              case "site":
                global.siteRouting = undefined;
                isRefreshScreen = true;
                break;
              case "sectorDetail":
              case "sector":
              case "tabbar":
                isRefreshScreen = true;
                break;
              case "feed":
                if (global.saveFeedInfo) {
                  global.saveFeedInfo(new Date());
                }
                break;
            }
            if (isRefreshScreen && !global.isRefreshBadgeCount && global.refreshFeedCount) {
              global.refreshFeedCount(); // refresh feed count
            }
            return state;
        case Actions.AFTER_POP:
            console.log("AFTER_POP:", action);
            if (!global.isRefreshBadgeCount && global.refreshFeedCount) {
              global.refreshFeedCount(); // refresh feed count
            }
            return state;
        case Actions.BEFORE_POP:
            console.log("BEFORE_POP:", action);
            return state;
        case Actions.AFTER_DISMISS:
            console.log("AFTER_DISMISS:", action);
            return state;
        case Actions.BEFORE_DISMISS:
            console.log("BEFORE_DISMISS:", action);
            return state;
        default:
            return state;
    }

}

let store = createStore(reducer);
const Router = connect()(RNRF.Router);
// const Router = RNRF.Router;

var storage = new Storage({
    // maximum capacity, default 1000
    size: 1000,

    // expire time, default 1 day(1000 * 3600 * 24 secs)
    defaultExpires: 1000 * 3600 * 24,

    // cache data in the memory. default is true.
    enableCache: true,

    // if data was not found in storage or expired,
    // the corresponding sync method will be invoked and return
    // the latest data.
    sync : {
        // we'll talk about the details later.
    }
});


/*
var firstRoute = {
  name: 'login',
  component: LoginScreen,
  hideNavigationBar: true,
  trans: true,
  passProps: {
  }
};
*/

// var tabContent = <Image style={styles.editIcon} source={require('./assets/icons/Toolbar_Performance.png')}/>;
// var tabContent = <Image style={styles.editIcon} source={require('./assets/icons/Toolbar_Feed.png')}/>;
var TabIcon = React.createClass({
  componentWillMount: function() {
  },
  render(){
    var imageSrc = this.props.selected ? this.props.selectedImageSrc : this.props.unselectedImageSrc;
    var style_line = this.props.selected ? styles.lineFilled : styles.emptyLine;
    if (this.props.selected && this.props.selectedImageSrc === perfImageSrc_selected) {
      global.isPerfTabOn = true;
    }
    if (this.props.selected && this.props.selectedImageSrc === feedImageSrc_selected) {
      global.isPerfTabOn = false;
    }
    // audit the global.isPerTabOn since these two tab routes are in "replace" mode
    if (global.isPerfTabOn && this.props.selected && this.props.selectedImageSrc === feedImageSrc_selected) {
      global.isPerfTabOn = false
    }
    if (!global.isPerfTabOn && this.props.selected && this.props.selectedImageSrc === perfImageSrc_selected) {
      global.isPerfTabOn = true
    }
    var badgeCount = global.feedBadgeCount > 99 ? 99 : global.feedBadgeCount;
    var icon = (badgeCount > 0 && this.props.name==="feed") ?
      <View style={styles.tabBadgeIconContainer}>
        <Image style={styles.tabIcon} source={imageSrc}/>
        <View style={styles.badgeCountContainer}>
          <Text style={styles.badgeCountText}>{badgeCount}</Text>
        </View>
      </View>
      :
      <Image style={styles.tabIcon} source={imageSrc}/>;
    return (
      <View style={styles.tabIconContainer}>
        {icon}
        <View style={style_line}></View>
      </View>
    );
  }
});

// var TimerMixin = require('react-timer-mixin');
// main class
module.exports = React.createClass({
  getInitialState: function() {
    return {
    };
  },
  componentDidMount: function() {
  },
  componentWillMount: function() {
    global.refreshFeedCount = this._getFeedCount;
    global.saveFeedInfo = this._saveFeedInfoToStorage;
    global.contentInset = {bottom: 45};  // global content inset for list view screen
    global.isPerfTabOn = true;
    global.storage = storage;
    global.CONTROL_KEYS_STORAGE_TOKEN = 'controlKeys';
    global.LOGIN_STORAGE_TOKEN = 'loginInfo';
    global.FEED_STORAGE_TOKEN = 'feedInfo';
    global.CONTROL_KEY_LENGTH = 10;
    global.CustomerReleaseNotes = CustomerReleaseNotes;
    // no event listener
    PushNotificationIOS.addEventListener('notification', this._onNotification);
    global.DEFAULT_PROFILE_IMAGE =  require('./assets/images/Profile_Icon_Large.png');
    this._getAppVersion();
    this._loadFeedInfoFromStorage();
    var mixpanelTrack = require('./utils/mixpanelTrack');
    mixpanelTrack("App Launch", {"App Version": global.BeeperVersion}, null);
  },
  componentWillUnmount: function() {
    global.refreshFeedCount = undefined;  // we are unmounting this, so better set this global to undefined
    PushNotificationIOS.removeEventListener('notification', this._onNotification);
  },
  _getFeedCount: function() {
    if (!this.state.feedViewDate) {
        global.feedBadgeCount = 0;
        return;
    }
    var Feed = Parse.Object.extend("Feed");
    // first find all Feeds in the Feed table
    var _this = this;  // always use this to get to the root component
    var query = new Parse.Query(Feed);
    query.greaterThan("createdAt", this.state.feedViewDate);
    query.count({
      success: function(count) {
        global.feedBadgeCount = count;
        Actions.refreshScreen();
      },
      error: function(error) {
        global.feedBadgeCount = 0;
      }
    });
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
      // this._getFeedCount();
    }).catch( err => {
      // save today's date
      this._saveFeedInfoToStorage(new Date());
    });
  },
  _saveFeedInfoToStorage: function(feedViewDate) {
// FIXME:  test only
// var date = feedViewDate.getDate() - 1;
// feedViewDate.setDate(date);
    global.feedBadgeCount = 0;
    this.setState({
      feedViewDate: feedViewDate,
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
    global.refreshFeedCount && global.refreshFeedCount();
  },
  _getAppVersion: async function() {
    try {
      global.BeeperVersion = await InfoPlist.bundleShortVersion();
    } catch(e) {
      console.error(e);
    }
  },
  _onNotification(notification) {
    // refresh the Feed badge count
    global.refreshFeedCount && global.refreshFeedCount();
    // refresh the Feed screen
    global.refreshFeed && global.refreshFeed();
  },
  renderRightButton: function() {
    return (
      <LogoRight/>
    );
  },
  renderBackButton: function() {
    return (
      <BackButton/>
    );
  },
  renderTitle: function(title) {
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{Moment().subtract(1, 'days').format("MM/DD/YYYY")}</Text>
      </View>
    );
  },
  render() {
      // Provider is optional (if you want to use redux)
      return (
        <Provider refreshBadgeCount={this.state.refreshBadgeCount} store={store}>
          <Router hideNavBar={true} name="root">
              <Schema name="modal" sceneConfig={Navigator.SceneConfigs.FloatFromBottom} />
              <Schema name="default" sceneConfig={Navigator.SceneConfigs.FloatFromRight}/>
              <Schema name="withoutAnimation"/>
              <Schema name="tab" type="switch" icon={TabIcon} />

              <Route type="reset" name="login" component={LoginScreen} initial={true}/>
              <Route name="refreshScreen" component={RefreshScreen} type="modal" />
              <Route name="userProfile" component={UserProfileScreen} type="modal" />
              <Route name="tabbar" type="reset" >
                <Router name="tabBarReouter" footer={TabBar} hideNavBar={true} tabBarStyle={styles.tabBar}>
                  <Route name="perf" schema="tab" initial={global.isPerfTabOn} defaultRoute="network"
                    selectedImageSrc={perfImageSrc_selected} unselectedImageSrc={perfImageSrc_unselected}
                    >
                    <Router name="perfRouter" hideNavBar={false}
                      navigationBarStyle={styles.header} titleStyle={styles.title}
                      renderRightButton={() => this.renderRightButton()} renderBackButton={() => this.renderBackButton()}
                      >
                      <Route type="reset" name="network" entityType='network' component={AreaScreen}
                        initial={true}
                        renderTitle={() => this.renderTitle("Network Performance")}
                        />
                      <Route name="site" entityType="site"
                        component={SiteScreen}
                        renderTitle={() => this.renderTitle("Site Performance")}
                        />
                      <Route name="sector" entityType="sector"
                        component={SectorScreen}
                        renderTitle={() => this.renderTitle("Sector Performance")}
                        />
                      <Route name="sectorDetail" entityType="sector_detail"
                        component={SectorDetailScreen}
                        renderTitle={() => this.renderTitle("Sector Details")}
                        />
                    </Router>
                  </Route>
                  <Route  name="feed" schema="tab" title="My Feed" initial={!global.isPerfTabOn} defaultRoute="feedScreen"
                    selectedImageSrc={feedImageSrc_selected} unselectedImageSrc={feedImageSrc_unselected}
                    navigationBarStyle={styles.header} titleStyle={styles.title}
                    renderRightButton={() => this.renderRightButton()} renderBackButton={() => this.renderBackButton()}
                    >
                    <Router name="feedRouter" hideNavBar={false} >
                      <Route type='reset' entityType='feed' name="feedScreen" component={FeedScreen} title="My Feed"/>
                    </Router>
                  </Route>
                </Router>
              </Route>
          </Router>
        </Provider>
      );
  }
});

// To show component outlines for layout
// var StyleSheet = require('react-native-debug-stylesheet');

var styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#414042",
    // backgroundColor: 'rgba(65, 64, 66, 0.95)',
  },
  tabIconContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  tabBadgeIconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'center',
    alignItems: 'stretch',
    alignSelf: 'center',
  },
  badgeCountContainer: {
    height: 20,
    width: 20,
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 5,
    marginLeft: -10,
    backgroundColor: 'red',
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 40,
  },
  badgeCountText: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'white',
    fontWeight: "600",
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
  },
  tabIcon: {
    height: 30,
    width: 40,
    alignSelf: 'center',
    backgroundColor: "transparent",
    marginTop: 11,
  },
  lineFilled: {
    height: 4,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 1,
  },
  emptyLine: {
    height: 4,
  },
  header: {
    backgroundColor: "#066D7E",
    // backgroundColor: "white",
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 13,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: 'white',
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    marginRight: 8,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "300",
    color: 'white',
    fontFamily: 'Helvetica Neue',
  },
});

'use strict';

var React = require('react-native');
var {
  AppStateIOS,
  ActivityIndicatorIOS,
  ListView,
  Platform,
  // ProgressBarAndroid,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} = React;

import InvertibleScrollView from 'react-native-invertible-scroll-view';

var RefreshableListView = require('react-native-refreshable-listview');

var FeedCell = require('./components/FeedCell');
var ZoneScreen = require('./ZoneScreen');
var SiteScreen = require('./SiteScreen');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var Parse = require('parse/react-native');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var mixpanelTrack = require('./utils/mixpanelTrack');

var LOADING = {};

var _this = null;

// var FeedScreen = React.createClass({
// IMPORTANT: we need to use InvertibleScrollView so we need to implement this way:
//   see https://github.com/exponentjs/react-native-invertible-scroll-view
class FeedScreen extends React.Component {
  constructor(props, context) {
    super(props, context);
    _this = this;
    _this.state = {
      isLoading: false,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  }
  componentWillMount() {
    _this.getComments();
    global.refreshFeed = _this.reloadData;
  }
  componentDidMount() {
  }
  componentWillUnmount() {
    global.refreshFeed = undefined; // we are unmounting this so better set the global to undefined;
  }
  getComments() {
    _this.setState({isLoading: true});
    var Feed = Parse.Object.extend("Feed");
    var feedArray = [];
    // first find all Feeds in the Feed table
    var query = new Parse.Query(Feed);
    query.limit(100);
    query.descending("createdAt");
    query.include('user');  // need to include user pointer relational data
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          var feedObj = results[i];
          feedArray.push({
            postDate: feedObj.get('createdAt'),
            user: feedObj.get('user'),
            entityType: feedObj.get('entityType'),
            entityName: feedObj.get('entityName'),
            networkName: feedObj.get('networkName'),
            siteName: feedObj.get('siteName'),
            sectorName: feedObj.get('sectorName'),
            kpi: feedObj.get('kpi'),
            commentText: feedObj.get('comment')
          });
        }
        var dataSource = _this.state.dataSource.cloneWithRows(feedArray);
        _this.setState({
          dataSource: dataSource,
          isLoading: false,
          isRefreshing: false,
        });
      },
      error: function(error) {
        console.log('get feed failure with error code: ' + error.message);
        _this.setState({
          isLoading: false,
          isRefreshing: false,
        });
      }
    });
  }
  reloadData() {
    _this.getComments();
  }
  refreshData() {
    _this.setState({isRefreshing: true});
    _this.reloadData();
  }

  render() {
    if (_this.state.isLoading && !_this.state.isRefreshing) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 100}]}
        color={"#00A9E9"}
        size="large"
      />;
    } else {
      var content =
        <ListView
          renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
          ref="listview"
          style={styles.listView}
          dataSource={_this.state.dataSource}
          renderFooter={_this.renderFooter}
          renderRow={_this.renderRow}
          onEndReached={_this.onEndReached}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={true}
          loadData={_this.refreshData}
          refreshDescription="Refreshing Data ..."
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
        />;
    }
    /*renderSeparator={_this.renderSeparator}*/
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

  renderFooter() {
      return <View style={styles.scrollSpinner} />;
  }

  renderSeparator(
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
  }

  renderRow(
    comment: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <FeedCell
        key={comment.id}
        onSelect={() => _this.selectComment(comment)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        comment={comment}
        entityType="Feed"
      />
    );
  }

  selectComment(comment: Object) {
    global.navCommentProps = {
      entityType: comment.entityType,
      entityName: comment.entityName,
      networkName: comment.networkName,
      siteName: comment.siteName,
      sectorName: comment.sectorName,
      kpi:  comment.kpi,
    };
    if (Platform.OS === 'ios') {
      // need lazy loading to get the global.currentUser
      var AfterLoginScreen = require('./AfterLoginScreen');
      global.resetToRoute({
        // titleComponent: PerfNavTitle,
        // rightCorner: LogoRight,
        component: AfterLoginScreen,
        // headerStyle: styles.header,
        // hideNavigationBar: true,
        hideNavigationBar: true,
        trans: true,
        // passprops to nevigate to the right entityType, entityName and kpi
        passProps: {
        }
      });
    } else {  // for android, no op for now
      dismissKeyboard();
    }
  }
  mpSelectKpi(kpi) {
    mixpanelTrack("Network KPI", {"KPI": kpi}, global.currentUser);
  }
  mpSelectSectorColor(kpi, color) {
    mixpanelTrack("Sector Count", {"KPI": kpi, "Color": color}, global.currentUser);
  }

}

var styles = StyleSheet.create({
  listView: {
    paddingTop: 50,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'stretch',
    // backgroundColor: 'rgba(10,10,10,0.8)',
    backgroundColor: 'white',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
  header: {
    // backgroundColor: "#1C75BC",
    backgroundColor: "#066D7E",
  },
  centering: {
    flex: 1,
    width: null,
    backgroundColor: '#f3f3f3',
  },
});

module.exports = FeedScreen;
//

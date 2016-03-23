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

var Actions = require('react-native-router-flux').Actions;
// import InvertibleScrollView from 'react-native-invertible-scroll-view';

var RefreshableListView = require('react-native-refreshable-listview');

var FeedCell = require('./components/FeedCell');
var ZoneScreen = require('./ZoneScreen');
var SiteScreen = require('./SiteScreen');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');
var Parse = require('parse/react-native');
var Mixpanel = require('react-native').NativeModules.RNMixpanel;
var mixpanelTrack = require('./utils/mixpanelTrack');
var TimerMixin = require('react-timer-mixin');

var LOADING = {};

// var FeedScreen = React.createClass({
// IMPORTANT: we need to use InvertibleScrollView so we need to implement the more foundamental
//   React component way:
//   see https://github.com/exponentjs/react-native-invertible-scroll-view
module.exports = React.createClass({
  mixins: [TimerMixin],

  getInitialState: function() {
    return {
      isLoading: false,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    }
  },
  componentWillMount: function() {
    this.getComments();
    global.refreshFeed = this.reloadData;
  },
  componentDidMount: function() {
  },
  componentWillUnmount: function() {
    global.refreshFeed = undefined; // we are unmounting this so better set the global to undefined;
  },
  componentDidUpdate: function() {
    // scroll to bottom automatically every time the list is rendered
    if(this.refs.listview) {
      this._scrollToBottom();
    }
  },
  _scrollToBottom: function() {
    // only scroll if footerY is moved beyond listHieght
    if(this.state.listHeight && this.state.footerY && this.state.footerY > this.state.listHeight){
      var scrollDistance = this.state.listHeight - this.state.footerY;
      // this.refs.listview.getScrollResponder().scrollTo(-scrollDistance);
      // scroll without animation, i.e. "false"
      // for some reason that this didn't scroll all the way to the bottom, thus added 50 below
      this.refs.listview.getScrollResponder().scrollResponderScrollTo({x: 0, y: -scrollDistance+50, animated: false});
    }
  },
  navToNetwork: function() {
    // periodic check if the network can be navigated to
    var interval = this.setInterval(
      () => {
        if (Actions.network) {
          this.clearInterval(interval);
          Actions.network();
        }
      },
      50, // checking every 50 ms
    );
    Actions.perf();  // first go to the perf tab
  },
  getComments: function() {
    this.setState({isLoading: true});
    var Feed = Parse.Object.extend("Feed");
    var feedArray = [];
    // first find all Feeds in the Feed table
    var query = new Parse.Query(Feed);
    query.limit(100);
    query.descending("createdAt");
    query.include('user');  // need to include user pointer relational data
    var _this = this;
    query.find({
      success: function(results) {
        for (var i = 0; i < results.length; i++) {
          var feedObj = results[i];
          // add each new one to the front of the array since we are doing inverted list view
          feedArray.unshift({
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
  },
  reloadData: function() {
    this.getComments();
  },
  refreshData: function() {
    this.setState({isRefreshing: true});
    this.reloadData();
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
          // renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
      var content =
        <ListView
          ref="listview"
          style={styles.listView}
          onLayout={(event) => {
            var layout = event.nativeEvent.layout;
            this.setState({
            listHeight : layout.height
            });
          }}
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
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
        />;
    }
    /*renderSeparator={_this.renderSeparator}*/
    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  },
  renderFooter: function() {
    // NOTE: see http://stackoverflow.com/questions/29829375/how-to-scroll-to-bottom-in-react-native-listview
    //  Tried various method to scroll to bottom, the extra footer is the best and more consistent way
    return (
      <View style={styles.footer}
        onLayout={(event)=>{
          var layout = event.nativeEvent.layout;
          this.setState({
            footerY : layout.y
          });
        }}>
      </View>
    );
    //   return <View style={styles.scrollSpinner} />;
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
    comment: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <FeedCell
        key={comment.id}
        onSelect={() => this.selectComment(comment)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        comment={comment}
        entityType="Feed"
      />
    );
  },
  selectComment: function(comment: Object) {
    // track which comment is selected
    // set up comment navigation properties
    // IMPORTANT: Need to be set first to signal nav to comment box is in progres
    global.navCommentProps = {
      entityType: comment.entityType,
      entityName: comment.entityName,
      networkName: comment.networkName,
      siteName: comment.siteName,
      sectorName: comment.sectorName,
      kpi:  comment.kpi,
    };
    mixpanelTrack("Touch Feed Comment",
    {
      "Entity": "#" + comment.entityType,
      "Name": "#" + comment.entityName,
      "KPI": "#" + comment.kpi,
      "Post Date": comment.postDate,
      "Poster": "@" + comment.user.get("friendlyName"),
      "Comment Text": comment.commentText,
    }, global.currentUser);
    if (Platform.OS === 'ios') {
      // need lazy loading to get the global.currentUser
      global.isPerfTabOn = true;
      this.navToNetwork();
    } else {  // for android, no op for now
      dismissKeyboard();
    }
  },
  mpSelectKpi: function(kpi) {
    mixpanelTrack("Network KPI", {"KPI": kpi}, global.currentUser);
  },
  mpSelectSectorColor: function(kpi, color) {
    mixpanelTrack("Sector Count", {"KPI": kpi, "Color": color}, global.currentUser);
  }
});

var styles = StyleSheet.create({
  listView: {
    marginTop: 13, // account for the header
    marginBottom: 49, // account for the tab bar
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
  footer: {
    height: 0,
  }
});

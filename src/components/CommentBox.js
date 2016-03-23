var React = require('react-native');
var {
  View,
  Text,
  TextInput,
  ListView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicatorIOS,
} = React;

// import InvertibleScrollView from 'react-native-invertible-scroll-view';

var RefreshableListView = require('react-native-refreshable-listview');
var Parse = require('parse/react-native');
var CommentCell = require('./CommentCell');
var mixpanelTrack = require('../utils/mixpanelTrack');
var TimerMixin = require('react-timer-mixin');

// IMPORTANT: we need to use InvertibleScrollView so we need to implement this way:
//   see https://github.com/exponentjs/react-native-invertible-scroll-view
module.exports = React.createClass({
  mixins: [TimerMixin],

  getInitialState: function() {
    return {
      isLoading: false,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      comment: "",
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  },
  componentWillMount: function() {
    this.getComments();
  },
  componentDidUpdate: function() {
    // scroll to bottom automatically every time the list is rendered
    if(this.refs.listview) {
      this._scrollToBottom();
    }
  },
  componentDidMount: function() {
  },
  componentWillUnmount: function() {
  },
  _scrollToBottom: function() {
    // only scroll if footerY is moved beyond listHieght
    if(this.state.listHeight && this.state.footerY && this.state.footerY > this.state.listHeight){
      var scrollDistance = this.state.listHeight - this.state.footerY;
      // this.refs.listview.getScrollResponder().scrollTo(-scrollDistance);
      // scroll without animation, i.e. "false"
      this.refs.listview.getScrollResponder().scrollResponderScrollTo({x: 0, y: -scrollDistance, animated: false});
    }
  },
  getComments: function() {
    var _this = this; // saved for promise processing
    this.setState({isLoading: true});
    var Feed = Parse.Object.extend("Feed");
    var feedArray = [];
    // first find all Feeds in the Feed table
    var query = new Parse.Query(Feed);
    query.limit(50);
    query.descending("createdAt");
    query.equalTo("entityType", this.props.entityType);
    query.equalTo("entityName", this.props.entityName);
    query.equalTo("kpi", this.props.kpi);
    query.include('user');  // need to include user pointer relational data
    query.find({
      success(results) {
        var Parse = require('parse/react-native');
        for (var i = 0; i < results.length; i++) {
          var feedObj = results[i];
          // use unshift to add to the front of the array since we are doing inveted list view
          feedArray.unshift({
            postDate: feedObj.get('createdAt'),
            user: feedObj.get('user'),
            entityType: feedObj.get('entityType'),
            entityName: feedObj.get('entityName'),
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
      error(error) {
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
  selectComment: function() {

  },
  onPressSubmit: function() {
    var _this = this; // saved for promise processing
    if (this.state.comment.length === 0) {
      return;
    }
    // trim spaces and remove new lines
    var comment = this.state.comment.trim();
    var Feed = Parse.Object.extend("Feed");
    var feed = new Feed();
    var networkName = ""
    if (this.props.areaName) {
      networkName = this.props.areaName.toLowerCase();
    }
    var siteName = ""
    if (this.props.siteName) {
      siteName = this.props.siteName.toLowerCase();
    }
    var sectorName = ""
    if (this.props.sectorName) {
      sectorName = this.props.sectorName.toLowerCase();
    }
    feed.set('user', global.currentUser);
    if (this.props.entityName === "monthly_target") {
      var entityType = "network";
    } else {
      var entityType = this.props.entityType;
    }
    feed.set('entityType', entityType);
    feed.set('entityName', this.props.entityName);
    feed.set('kpi', this.props.kpi);
    feed.set('networkName', networkName);
    feed.set('siteName', siteName);
    feed.set('sectorName', sectorName);
    feed.set('comment', comment);
    feed.save(null, {
      success(feed) {
        // Execute any logic that should take place after the object is saved.
        _this.setState({comment: ""});
        _this.reloadData();
        mixpanelTrack("Enter Comment",
        {
          "Entity": "#" + entityType,
          "Name": "#" + _this.props.entityName,
          "KPI": "#" + _this.props.kpi,
          "Comment Text": comment,
        }, global.currentUser);
        _this.setTimeout(
          () => {
            // refresh the Feed badge count
            global.refreshFeedCount && global.refreshFeedCount();
            // refresh the Feed screen
            global.refreshFeed && global.refreshFeed();
          },
          1000
        );
      },
      error(feed, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        console.log('post failure with error code: ' + error.message);
      }
    });
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
  },
  renderRow: function(
    comment: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <CommentCell
        key={comment.id}
        onSelect={() => this.selectComment(comment)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        comment={comment}
      />
    );
  },
  render: function() {
    var TouchableElement = TouchableOpacity;
    if (this.state.isLoading && !this.state.isRefreshing) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 50}]}
        color={"#00A9E9"}
        size="small"
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
          automaticallyAdjustContentInsets={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={true}
          loadData={this.refreshData}
          refreshDescription="Refreshing Data ..."
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
        />;
    }
    return (
        <View style={[this.props.style, styles.container]}>
          {content}
          <TextInput
            onChangeText={(text) => this.setState({comment: text})}
            value={this.state.comment}
            style={styles.commentInput}
            placeholder={"Type your comments here..."}
            placeholderTextColor='grey'
            autoFocus={false}
            autoCorrect={true}
            multiline={true}
            selectionColor={'white'}
            />
          <TouchableElement
            style={styles.submitButton}
            activeOpacity={0.5}
            onPress={this.onPressSubmit}>
            <Text style={styles.submitButtonText}>Send</Text>
          </TouchableElement>
        </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: 'white',
  },
  listView: {
    flex: 3,
    backgroundColor: 'white',
    height: 150,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    marginLeft: 20,
    marginRight: 20,
    // borderColor: 'red',
    // borderWidth: 1,
  },
  commentInput: {
    flex: 3,
    height: 50,
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
    paddingTop: 3,
    paddingLeft: 15,
    paddingRight: 15,
    color: 'black',
    textAlign: 'left',
    backgroundColor: '#d6e8f8',
    fontSize: 12,
    fontStyle: "italic",
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    // borderColor: 'blue',
    // borderWidth: 1,
  },
  submitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
    // borderColor: 'yellow',
    // borderWidth: 1,
  },
  submitButtonText: {
    backgroundColor: '#1faae1',
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingTop: 9,
    paddingBottom: 8,
    marginRight: 20,
    marginLeft: 20,
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    color: 'white',
    fontWeight: "500",
    // borderColor: 'pink',
    // borderWidth: 1,
  },
  centering: {
    flex: 1,
    width: null,
    backgroundColor: '#f3f3f3',
  },
  separator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    // color: 'grey',
    // backgroundColor: 'white',
    // height: 1 / PixelRatio.get(),
    height: 1,
    marginVertical: 0,
  },
  footer: {
    height: 0,
  }
});

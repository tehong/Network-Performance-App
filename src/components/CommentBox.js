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

import InvertibleScrollView from 'react-native-invertible-scroll-view';

var RefreshableListView = require('react-native-refreshable-listview');
var Parse = require('parse/react-native');
var CommentCell = require('./CommentCell');

// IMPORTANT: we need to use InvertibleScrollView so we need to implement this way:
//   see https://github.com/exponentjs/react-native-invertible-scroll-view
class CommentBox extends React.Component {
  constructor(props, context) {
    super(props, context);
    _this = this;  // need to save this for the promise processing
    _this.state = {
      isLoading: false,  // only used for initial load
      isRefreshing: false,  // used for subsequent refresh
      comment: "",
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  }
  componentWillMount() {
    global.refreshFeedCount();
    _this.getComments();
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  getComments() {
    _this.setState({isLoading: true});
    var Feed = Parse.Object.extend("Feed");
    var feedArray = [];
    // first find all Feeds in the Feed table
    var query = new Parse.Query(Feed);
    query.limit(50);
    query.descending("createdAt");
    query.equalTo("entityType", _this.props.entityType);
    query.equalTo("entityName", _this.props.entityName);
    query.equalTo("kpi", _this.props.kpi);
    query.include('user');  // need to include user pointer relational data
    query.find({
      success(results) {
        var Parse = require('parse/react-native');
        for (var i = 0; i < results.length; i++) {
          var feedObj = results[i];
          feedArray.push({
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
  }
  reloadData() {
    _this.getComments();
  }
  refreshData() {
    _this.setState({isRefreshing: true});
    _this.reloadData();
  }
  selectComment() {

  }
  onPressSubmit() {
    if (_this.state.comment.length === 0) {
      return;
    }
    // trim spaces and remove new lines
    var comment = _this.state.comment.trim();
    var Feed = Parse.Object.extend("Feed");
    var feed = new Feed();
    var networkName = ""
    if (_this.props.areaName) {
      networkName = _this.props.areaName.toLowerCase();
    }
    var siteName = ""
    if (_this.props.siteName) {
      siteName = _this.props.siteName.toLowerCase();
    }
    var sectorName = ""
    if (_this.props.sectorName) {
      sectorName = _this.props.sectorName.toLowerCase();
    }
    feed.set('user', global.currentUser);
    feed.set('entityType', _this.props.entityType);
    feed.set('entityName', _this.props.entityName);
    feed.set('networkName', networkName);
    feed.set('siteName', siteName);
    feed.set('sectorName', sectorName);
    feed.set('comment', comment);
    feed.save(null, {
      success(feed) {
        // Execute any logic that should take place after the object is saved.
        _this.setState({comment: ""});
        console.log('New object created with objectId: ' + feed.id);
        _this.reloadData();
        global.refreshFeedCount();
      },
      error(feed, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        console.log('post failure with error code: ' + error.message);
      }
    });
  }
  renderRow(
    comment: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <CommentCell
        key={comment.id}
        onSelect={() => _this.selectComment(comment)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        comment={comment}
      />
    );
  }
  render() {
    var TouchableElement = TouchableOpacity;
    if (_this.state.isLoading && !_this.state.isRefreshing) {
      var content =
      <ActivityIndicatorIOS
        animating={true}
        style={[styles.centering, {height: 50}]}
        color={"#00A9E9"}
        size="small"
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
          automaticallyAdjustContentInsets={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={true}
          loadData={_this.refreshData}
          refreshDescription="Refreshing Data ..."
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={styles.separator} />}
        />;
    }
    return (
        <View style={[_this.props.style, styles.container]}>
          {content}
          <TextInput
            onChangeText={(text) => _this.setState({comment: text})}
            value={_this.state.comment}
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
            onPress={_this.onPressSubmit}>
            <Text style={styles.submitButtonText}>Send</Text>
          </TouchableElement>
        </View>
    );
  }
}

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
    height: 100,
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
    paddingTop: 5,
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
});

module.exports = CommentBox ;

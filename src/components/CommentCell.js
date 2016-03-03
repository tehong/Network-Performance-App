/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */
'use strict';

var React = require('react-native');
var {
  Image,
  PixelRatio,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

var getDiffInDays = require('../utils/getDiffInDays');

var CommentCell = React.createClass({
  getInitialState: function() {
    return {
    };
  },
  render: function() {
    var parseUser = this.props.comment.user;
    var displayName = parseUser.get('friendlyName');
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var date = this.props.comment.postDate;
    var strAmPm = date.getHours() < 12 ? "am" : "pm";
    var hour = date.getHours() <= 12 ? date.getHours() : date.getHours() - 12;
    hour = hour < 10 ? ("0" + hour) : hour;
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? ("0" + minutes) : minutes;
    var diffDays = getDiffInDays(date, new Date());
    // var memontDateString = date.getYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes();
    if (diffDays >= 7 ) {
      var dateString = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " " + hour + ":" + minutes + strAmPm;
    } else {
      var dateString = days[date.getDay().toLocaleString()] + " " + hour + ":" + minutes + strAmPm;
    }
    return (
      <View style={styles.topContainer}>
        <View style={styles.heading}>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.dateText}>  - {dateString}</Text>
        </View>
        <View style={styles.comments}>
          <Text style={styles.commentText}>{this.props.comment.commentText}</Text>
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 2,
    alignItems: "stretch",
  },
  topContainer: {
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems:'stretch',
    backgroundColor: 'white',
  },
  heading: {
    flex: 1,
    flexDirection: 'row',
    justifyContent:'flex-start',
    marginTop: 2,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 3,
    alignItems:'stretch',
    // borderColor: "red",
    // borderWidth: 1,
  },
  comments: {
    flex: 1,
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems:'stretch',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 3,
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1faae1',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "black",
    // borderWidth: 1,
  },
  channelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1faae1',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "pink",
    // borderWidth: 1,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'grey',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "blue",
    // borderWidth: 1,
  },
  commentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "green",
    // borderWidth: 1,
  },
});

module.exports = CommentCell;

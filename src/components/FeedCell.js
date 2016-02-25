/**
 * ehong created 02/19/2016
 */
'use strict';

var React = require('react-native');
var {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} = React;

// var Parse = require('parse/react-native');

var moment = require('moment-timezone');

var getDiffInDays = require('../utils/getDiffInDays');

var FeedCell = React.createClass({
  render: function() {
    var parseUser = this.props.comment.user;
    var displayName = parseUser.get('friendlyName').toLowerCase();
    var parseFile = parseUser.get('profilePhoto');
    var avatarSource = require('../assets/images/Profile_Icon_Large.png');

    if (parseFile) {
      var imageUrl = parseFile.url();
      if (imageUrl) {
          avatarSource = {uri: imageUrl};
      }
    }
    var title = parseUser.get('title');
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
      var dateString = date.getMonth() + "/" + date.getDate() + "/" + date.getYear() + " " + hour + ":" + minutes + strAmPm;
    } else {
      var dateString = days[date.getDay().toLocaleString()] + " " + hour + ":" + minutes + strAmPm;
    }
    var channel = "#" + this.props.comment.entityType.toLowerCase() + ", #" + this.props.comment.entityName.toLowerCase() + ", #" + this.props.comment.kpi.toLowerCase();
    var TouchableElement = TouchableOpacity;
    return (
        <View style={styles.topContainer}>
          <View style={styles.heading}>
            <Image style={styles.profileImage} source={avatarSource}/>
            <View style={styles.nameTitleContainer}>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.titleText}>{title}</Text>
            </View>
            <Text style={styles.dateText}>  - {dateString}</Text>
          </View>
          <TouchableElement style={styles.container}
            onPress={this.props.onSelect}
            onShowUnderlay={this.props.onHighlight}
            activeOpacity={0.5}
            onHideUnderlay={this.props.onUnhighlight}>
              <View style={styles.comments}>
                <Text style={styles.channelText}>{channel}</Text>
                <Text style={styles.commentText}>{this.props.comment.commentText}</Text>
              </View>
          </TouchableElement>
        </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
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
    alignItems: 'center',
    marginTop: 2,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 3,
    alignItems:'stretch',
    // borderColor: "blue",
    // borderWidth: 1,
  },
  comments: {
    flex: 1,
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems:'stretch',
    backgroundColor: '#d0d2d3',
    padding: 8,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  nameTitleContainer: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginLeft: 5,
    // borderColor: "green",
    // borderWidth: 1,
  },
  nameText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1faae1',
    marginBottom: 1,
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "black",
    // borderWidth: 1,
  },
  titleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'grey',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "purple",
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
    flex: 1,
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    color: 'grey',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "violet",
    // borderWidth: 1,
  },
  commentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    // borderColor: "green",
    // borderWidth: 1,
  },
	profileImage: {
    height: 45,
    width: 45,
    // backgroundColor: 'transparent',
    borderColor: "#d0d2d3",
    borderWidth: 2,
    borderRadius: 23,
  },
});

module.exports = FeedCell;

// 'use strict';

var React = require('react-native');
// var Intercom = require('react-native-intercom');

var {
  StyleSheet,
  Image,
  TouchableOpacity
} = React;

var UserProfileTitle = require('./UserProfileTitle');
var BackButton = require('./BackButton');
var UserProfileScreen = require('../../UserProfileScreen');
var UserProfileLogoRight = require('./UserProfileLogoRight')
var getRightLogoStyles = require('../../styles/getRightLogoStyles');
var styles = getRightLogoStyles();

module.exports = React.createClass({
  onPressLogo: function() {
    this.props.toRoute({
      titleComponent: UserProfileTitle,
      backButtonComponent: BackButton,
      rightCorner: UserProfileLogoRight,
      component: UserProfileScreen,
      headerStyle: styles.header,
      passProps: {
      }
    });
    // Intercom.displayMessageComposer();
  },
  componentWillMount: function() {
    this.loadProfilePhoto();
  },
  componentDidMount: function() {
  },
  loadProfilePhoto: function() {
    this.setState({
      avatarSource: global.DEFAULT_PROFILE_IMAGE,
    });
    if (global.currentUser) {
      var parseFile = global.currentUser.get('profilePhoto');
      if (parseFile) {
        var imageUrl = parseFile.url();
        if (imageUrl) {
          this.setState({
            avatarSource: {uri: imageUrl}
          });
        }
      }
    }
  },
  render() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    return (
      // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
      <TouchableElement
        style={styles.container}
        activeOpacity={0.5}
        onPress={this.onPressLogo}>
        <Image
          style={[styles.icon, {borderColor: "white", borderWidth: 1, borderRadius: 14}]}
          underlayColor="transparent"
          source={this.state.avatarSource}
        />
      </TouchableElement>
    );
  }
});

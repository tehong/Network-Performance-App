// 'use strict';

var React = require('react-native');
var Intercom = require('react-native-intercom');

var {
  StyleSheet,
  Image,
  TouchableOpacity
} = React;

var getRightLogoStyles = require('../../styles/getRightLogoStyles');
var styles = getRightLogoStyles();
var Parse = require('parse/react-native');
var mixpanelTrack = require('../../utils/mixpanelTrack');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentUser: null,
    }
  },
  componentWillMount: function() {
    Parse.User.currentAsync()
    .then((user) => {this.setState({currentUser: user});});
  },
  onPressLogo: function() {
    this.mpIntercom();
    Intercom.displayMessageComposer();
  },
  mpIntercom: function() {
    mixpanelTrack("Intercom", null, this.state.currentUser);
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
          style={styles.icon}
          underlayColor="transparent"
          source={require("../../assets/icons/Icon_Intercom.png")}
        />
      </TouchableElement>
    );
  }
});

// 'use strict';

var React = require('react-native');
var getNavBarStyles = require('../../styles/getNavBarStyles');

var {
  Image,
  View,
  Text,
  StyleSheet,
} = React;

module.exports = React.createClass({
  render() {
    var styles = getNavBarStyles();
    return (
        // <Image style={styles.profileImage} source={require('../../assets/images/Profile_Icon_Large.png')}/>
        <View style={styles.container}>
          <Text style={styles.title}>User Profile</Text>
        </View>
    );
  },
});

/*
var styles = StyleSheet.create({
	container: {
    flex: 1,
    flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
    // borderColor: 'red',
    // borderWidth: 1,
	},
  left: {
    backgroundColor:

  },
  profileImage: {
    marginTop: 30,
    width: 80,
    backgroundColor: 'white',
    borderColor: 'yellow',
    borderWidth: 1,
  }
});
*/

// 'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Image,
} = React;

var LogoRight = React.createClass({

  render() {
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <Image
          style={styles.icon}
          underlayColor="transparent"
          source={require("../../assets/icons/Profile_Icon.png")}
        />
    );
  }
});

var styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    marginTop: 5,
    marginRight: 13
  }
});


module.exports = LogoRight ;

// 'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Image,
} = React;

var LogoATT = React.createClass({

  render() {
    return (
        // <Image underlayColor="transparent" source={{uri: 'Logo_ATT', isStatic: true}} />
        <Image
          style={styles.icon}
          underlayColor="transparent"
          source={{uri: "Logo_ATT", isStatic: true}}
        />
    );
  }
});

var styles = StyleSheet.create({
  icon: {
    width: 55,
    height: 25,
    marginTop: 5,
    marginRight: 13
  }
});


module.exports = LogoATT;

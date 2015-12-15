'use strict';

var React = require('react-native');
var {
  StyleSheet,
  // TouchableHighlight,
  View,
  Image,
} = React;

var BackButton = React.createClass({

/*
  backToPrevious: function() {
    this.props.customAction("onBack");
    // this.props.toRoute({
    //   name: "Login",
    //   component: this.props.goBackwards(),
    // });
  // },
*/

  render() {
    return (
      // <TouchableHighlight  underlayColor="transparent" onPress={this.backToPrevious}>
      <View style={styles.container}>
        <Image style={styles.icon} underlayColor="transparent" source={require("../../assets/icons/BTN_Back.png")} />
      </View>
      // </TouchableHighlight>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: 'flex-start',
    width: 50,
    height: 42,
    // borderColor: "red",
    // borderWidth: 1,
    paddingTop: 14,
    paddingLeft: 8,
  },
  icon: {
    width: 20,
    height: 20,
  }
});


module.exports = BackButton;

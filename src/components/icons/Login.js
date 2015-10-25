// 'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TouchableHighlight,
  Text,
} = React;

var Login = React.createClass({

  backToLogin: function() {
    this.props.customAction("onBack");
    /*
    this.props.toRoute({
      name: "Login",
      component: this.props.goBackwards(),
    });
    */
  },

  render() {
    return (
      <TouchableHighlight  underlayColor="transparent" onPress={this.backToLogin}>
        <Text style={styles.icon}>&lt;Login</Text>
      </TouchableHighlight>
    );
  }
});

var styles = StyleSheet.create({
  icon: {
    color: 'white',
    marginTop: 5,
    marginLeft: 8
  }
});


module.exports = Login;

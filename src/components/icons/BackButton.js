// 'use strict';

var React = require('react-native');
var {
  StyleSheet,
  TouchableHighlight,
  Image,
} = React;

var BackButton = React.createClass({

  backToPrevious: function() {
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
      <TouchableHighlight  underlayColor="transparent" onPress={this.backToPrevious}>
        <Image style={styles.icon} underlayColor="transparent"
          source={{uri: "BTN_Back", isStatic: true}}
        />
      </TouchableHighlight>
    );
  }
});

var styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    marginTop: 5,
    marginLeft: 10
  }
});


module.exports = BackButton;

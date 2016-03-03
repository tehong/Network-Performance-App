/**
*  After login program entry
*/
'use strict';

// ES6
import Swiper from 'react-native-swiper';
var React = require('react-native');
// var Parse = require('parse/react-native');
var Router = require('gb-native-router');

var {
  StyleSheet,
} = React;

var AreaScreen = require('./AreaScreen');
var MonthlyTargetScreen = require('./MonthlyTargetScreen');
var BackButton = require('./components/icons/BackButton');
var LogoRight = require('./components/icons/LogoRight');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentIndex: 1,
    }
  },
  componentDidMount: function() {
  },
  componentWillMount: function() {
    if (global.navCommentProps) {
      if (global.navCommentProps.entityType === "network") {
        this.setState({currentIndex: 1})
      } else if (global.navCommentProps.entityType === "monthly_target") {
        this.setState({currentIndex: 0})
      }
      console.log("currentIndex = " + this.state.currentIndex);
    }
  },
  componentWillUnmount: function() {
  },
  render: function() {
    // NOTE:  removeClippedSubviews needs to be set to false to not allow caching to happen between the two scoll items
    //        if set to true => commentBox content might get the cached content incorrectly
    return (
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        index={this.state.currentIndex}
        removeClippedSubviews={false}
        >
        <MonthlyTargetScreen
          style={styles.slide2}
          entityType={"monthly_target"}
          toRoute={this.props.toRoute}
          resetToRoute={this.props.resetToRoute}
          scrollIndex={0}
          setScrollIndex={() => this.setState({currentIndex: 0})}
          />
        <AreaScreen
          style={styles.slide1}
          entityType={"network"}
          toRoute={this.props.toRoute}
          resetToRoute={this.props.resetToRoute}
          scrollIndex={1}
          setScrollIndex={() => this.setState({currentIndex: 1})}
        />
      </Swiper>
    )
  }
});

var styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  buttonText: {
    backgroundColor: 'transparent',
    color: 'white'
  }
});

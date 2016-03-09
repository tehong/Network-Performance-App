/**
*  After login program entry
*/
'use strict';

// ES6
import Swiper from 'react-native-swiper';
// InViewPort doesn't work correctly for this listview
// import InViewPort from 'react-native-inviewport';

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
var PerfNavTitle = require('./components/icons/areas/PerfNavTitle');
var MonthlyNavTitle = require('./components/icons/areas/MonthlyNavTitle');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      currentIndex: 0,
    }
  },
  componentDidMount: function() {
  },
  componentWillMount: function() {
    // set up the current scroll index to the right one if we need to nav to comment box
    if (global.navCommentProps) {
      if (global.navCommentProps.entityName === "monthly_target") {
        this.setState({currentIndex: 0});
        console.log("currentIndex = 0");
      } else if (global.navCommentProps.entityType === "network") {
        this.setState({currentIndex: 1});
        console.log("currentIndex = 1");
      }
    }
  },
  componentWillUnmount: function() {
  },
  isMonthlyTargetVisible(isVisible){
    if (isVisible) {
      global.perfTitle = MonthlyNavTitle;
      console.log("Monthly Target visible");
    } else {
      console.log("Monthly Target not visible");
    }
  },
  /*
  isAreaPerfVisible(isVisible){
    if (isVisible) {
      global.perfTitle = PerfNavTitle;
      console.log("Area Perf visible");
    } else {
      console.log("Area Perf not visible");
    }
  },
  */
  render: function() {
    // NOTE:  removeClippedSubviews needs to be set to false to not allow caching to happen between the two scoll items
    //        if set to true => commentBox content might get the cached content incorrectly
        // <InViewPort onChange={this.isAreaPerfVisible}>
          // <InViewPort style={styles.inViewPort} onChange={this.isMonthlyTargetVisible}>
    return (
      /*
          <MonthlyTargetScreen
            style={styles.slide2}
            entityType={"network"}
            entityName={"monthly_target"}
            toRoute={this.props.toRoute}
            resetToRoute={this.props.resetToRoute}
            scrollIndex={0}
            setScrollIndex={() => {
              this.setState({currentIndex: 0});
              console.log("setScrollIndex: 0");
              }}
            />
            */
      <Swiper
        style={styles.wrapper}
        showsButtons={false}
        loop={false}
        index={this.state.currentIndex}
        removeClippedSubviews={false}
        >
          <AreaScreen
            style={styles.slide1}
            entityType={"network"}
            toRoute={this.props.toRoute}
            resetToRoute={this.props.resetToRoute}
            scrollIndex={1}
            setScrollIndex={() => {
              this.setState({currentIndex: 1});
              console.log("setScrollIndex: 1");
              }}
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
  inViewPort: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#97CAE5',
  },
  buttonText: {
    backgroundColor: 'transparent',
    color: 'white'
  }
});

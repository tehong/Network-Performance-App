/*
*  This ports the gb-native-router over and modifed the customAction() function
*    See https://github.com/MikaelCarpenter/gb-native-router
*   - Eric Hong
*/
'use strict';

var React = require('react-native');

var NavBarContainer = require('./components/NavBarContainer');

var {
  StyleSheet,
  Navigator,
  StatusBarIOS,
  View,
  Platform
} = React;


var Router = React.createClass({

  getInitialState: function() {
    return {
      route: {
        name: null,
        index: null
      },
      dragStartX: null,
      didSwitchView: null,
    }
  },

  /*
   * This changes the title in the navigation bar
   * It should preferrably be called for "onWillFocus" instad >
   * > but a recent update to React Native seems to break the animation
   */
  onDidFocus: function(route) {
    this.setState({ route: route });
  },

  onBack: function(navigator) {
    if (this.state.route.index > 0) {
      navigator.pop();
    }
  },

  onForward: function(route, navigator) {
    route.index = this.state.route.index + 1 || 1;
    navigator.push(route);
  },

  replaceRoute: function(route) {
    route.index = this.state.route.index + 0 || 0;
    this.refs.navigator.replace(route);
  },

  setRightProps: function(props) {
    this.setState({ rightProps: props });
  },

  setLeftProps: function(props) {
    this.setState({ leftProps: props });
  },

  customAction: function(opts) {
    switch(opts) {
      case "onBack":
        this.onBack(this.refs.navigator);
        break;
    }
    // this.props.customAction(opts);
  },

  renderScene: function(route, navigator) {

    var goForward = function(route) {
      route.index = this.state.route.index + 1 || 1;
      navigator.push(route);
    }.bind(this);

    var replaceRoute = function(route) {
      route.index = this.state.route.index || 0;
      navigator.replace(route);
    }.bind(this);

    var goBackwards = function() {
      this.onBack(navigator);
    }.bind(this);

    var goToFirstRoute = function() {
      navigator.popToTop()
    };

    var setRightProps = function(props) {
      this.setState({ rightProps: props });
    }.bind(this);

    var setLeftProps = function(props) {
      this.setState({ leftProps: props });
    }.bind(this);

    var customAction = function(opts) {
      this.customAction(opts);
    }.bind(this);

    var didStartDrag = function(evt) {
      var x = evt.nativeEvent.pageX;
      if (x < 28) {
        this.setState({
          dragStartX: x,
          didSwitchView: false
        });
        return true;
      }
    }.bind(this);

    // Recognize swipe back gesture for navigation
    var didMoveFinger = function(evt) {
      var draggedAway = ((evt.nativeEvent.pageX - this.state.dragStartX) > 30);
      if (!this.state.didSwitchView && draggedAway) {
        this.onBack(navigator);
        this.setState({ didSwitchView: true });
      }
    }.bind(this);

    // Set to false to prevent iOS from hijacking the responder
    var preventDefault = function(evt) {
      return true;
    };

    var Content = route.component;

    // Remove the margin of the navigation bar if not using navigation bar
    var extraStyling = {};
    if (this.props.hideNavigationBar) {
      extraStyling.marginTop = 0;
    }

    if(route.trans === true)
      var margin = 0
    else if (this.props.hideNavigationBar === true)
      var margin = this.props.noStatusBar ? 0 : 20
    else
      var margin = 64

    return (
      <View
        style={[styles.container, this.props.bgStyle, extraStyling, {marginTop: margin}]}
        onStartShouldSetResponder={didStartDrag}
        onResponderMove={didMoveFinger}
        onResponderTerminationRequest={preventDefault}>
        <Content
          name={route.name}
          index={route.index}
          data={route.data}
          toRoute={goForward}
          toBack={goBackwards}
          replaceRoute={replaceRoute}
          reset={goToFirstRoute}
          setRightProps={setRightProps}
          setLeftProps={setLeftProps}
          customAction={customAction}
          {...route.passProps}
        />
      </View>
    )

  },

  render: function() {

    // Status bar color
    if (Platform.OS === 'ios') {
      if (this.props.statusBarColor === "black") {
        StatusBarIOS.setStyle(0);
      } else {
        StatusBarIOS.setStyle(1);
      }
    } else if (Platform.OS === 'android') {
      // no android version yet
    }

    var navigationBar;

    if (!this.props.hideNavigationBar) {
      navigationBar =
      <NavBarContainer
        style={this.props.headerStyle}
        navigator={navigator}
        currentRoute={this.state.route}
        backButtonComponent={this.props.backButtonComponent}
        rightCorner={this.props.rightCorner}
        titleStyle={this.props.titleStyle}
        borderBottomWidth={this.props.borderBottomWidth}
        borderColor={this.props.borderColor}
        toRoute={this.onForward}
        toBack={this.onBack}
        leftProps={this.state.leftProps}
        rightProps={this.state.rightProps}
        customAction={this.customAction}
      />
    }

    return (
      <Navigator
        ref="navigator"
        initialRoute={this.props.firstRoute}
        navigationBar={navigationBar}
        renderScene={this.renderScene}
        onDidFocus={this.onDidFocus}
      />
    )
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
});


module.exports = Router;

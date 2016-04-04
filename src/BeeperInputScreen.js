/**
* created by ehong 03/29/2016
* a general input/alert screen for Beeper
*/
'use strict';

var React = require('react-native');
var DEFAULT_INPUT_BUTTON_TEXT= "OK";
var DEFAULT_INPUT= "ENTER YOUR INPUT HERE";

var {
  PixelRatio,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} = React;

var Actions = require('react-native-router-flux').Actions;
var Orientation = require('react-native-orientation');
var dismissKeyboard = require('dismissKeyboard');

var {
  height: deviceHeight
} = Dimensions.get('window');

/*********
  required props:
    inputDefault
    inputButtonLabel
    onPressEnter()
********************/

module.exports = React.createClass({

  // run by one time when a component is created
  getInitialState: function() {
    Orientation.lockToPortrait(); //this will lock the view to Portrait
    return {
      memoryWarnings: 0,
      input: '',
      inputDefault: null,
      isLoading: false,
      offset: new Animated.Value(deviceHeight),
    };
  },
  componentWillMount: function() {
    dismissKeyboard();
    if (this.props.inputDefault) {
      this.setState({inputDefault: this.props.inputDefault});
    }
  },
  componentDidMount: function() {
    Animated.timing(this.state.offset, {
        duration: 150,
        toValue: 0
    }).start();
  },
  onPress: function() {
    // pass the input back if there is a need
    Actions.dismiss();
    if (this.props.inputDefault) {
      this.props.onPressEnter(this.state.input);
    } else if (this.props.inputButtonLabel) {
      this.props.onPressEnter();
    }
  },
  onPressCancel: function() {
    Actions.dismiss();
  },
  render: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    var input = this.props.inputDefault ?
        <View style={styles.inputContainer}>
          <TextInput style={styles.inputText}
            onChangeText={(text) => this.setState({input: text})}
            value={this.state.input}
            placeholder={this.state.inputDefault}
            placeholderTextColor='#7AA5AD'
            autoCorrect={false}
            autoCapitalize={'none'}
            editable={!this.state.isLoading}
          />
        </View> :
        <View style={styles.inputContainer}>
        </View>;

    var cancel = this.props.cancelText?
        <View style={styles.cancelContainer}>
          <TouchableElement
            style={styles.link}
            onPress={this.onPressCancel}
            underlayColor={"#105D95"}>
            <Text style={styles.cancelButtonText}>{this.props.cancelText}</Text>
          </TouchableElement>
        </View>
        :
        <View style={styles.cancelContainer}>
        </View>;

    var enterButton = this.props.inputButtonLabel ?
          <View style={styles.inputButtonContainer}>
            <TouchableElement
              style={styles.button}
              onPress={this.onPress}
              underlayColor={"#105D95"}>
              <Text style={styles.loginButtonText}>{this.props.inputButtonLabel}</Text>
            </TouchableElement>
          </View>
        :
          <View style={styles.inputButtonContainer}/>;

    // NOTE: Can't use "require()" for background image to stretch it, need to use uri mothod!
    return (
      <Animated.View style={[styles.container, {transform: [{translateY: this.state.offset}]}]}>
        <Image style={styles.backgroundImage} source={require('./assets/images/BG_Login.png')}>
          <View style={styles.screenContainer}>
            <Image style={styles.logo} source={require('./assets/images/Logo_Beeper.png')}/>
            <View style={styles.inputGroupContainer}>
              <Text style={styles.outputText}>{this.props.outputText}</Text>
              {input}
              {enterButton}
            </View>
            {cancel}
          </View>
        </Image>
      </Animated.View>
    );
  },
});

// To show component outlines for layout
// var StyleSheet = require('react-native-debug-stylesheet');

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top:0,
    bottom:0,
    left:0,
    right:0,
    flex: 1,
    flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
    backgroundColor: 'white',
    // borderColor: "red",
    // borderWidth: 2,
	},
  backgroundImage: {
    // resizeMode: 'stretch',  // this allows the width to be stretched in "row" order
    flex: 1,  // this stretch the height to be stretched in "row" order
    justifyContent: 'flex-start',
    alignItems: 'center',
    // height: null,  // enable full height stretch in "column" order
    width: null,  // enable full width stretch in "row" order
    // borderWidth: 2,
    // borderColor: 'yellow',
  },
  screenContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 280,
    marginTop: 100,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    // borderWidth: 2,
    // borderColor: '#00BBF0',
  },
  logo: {
    // flex: 3,
    width: 157,
    height: 124,
    marginBottom: 30,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  inputGroupContainer: {
    width: 280,
    height: 140,
    flexDirection: "column",
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: 'violet',
  },
  inputContainer: {
    alignItems: 'stretch',
    width: 280,
    height: 33,
    // borderWidth: 1,
    // borderColor: '#00DD00',
  },
  cancelContainer: {
    width: 280,
    height: 30,
    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  cancelButtonText: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 40,
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    color: 'white',
    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  outputText: {
    textAlign: "center",
    width: 200,
    marginBottom: 10,
    fontSize: 12,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    color: "white",
    // borderWidth: 1,
    // borderColor: 'violet',
  },
  inputButtonContainer: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: 'purple',
  },
  inputText: {
    flex: 1,
    backgroundColor: '#0B858B',
    color: 'white',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: "500",
    paddingLeft: 20,
    borderWidth: 1,
    borderColor: '#91C6C2',
  },
  button: {
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
    width: 280,
    height: 28,
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  loginButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'white',
    color: 'gray',
  },
});

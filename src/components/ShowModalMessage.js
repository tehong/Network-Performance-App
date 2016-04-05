/*
* Created by EH 02/11/2016
*/

var React = require('react-native');

var {
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity
} = React;

module.exports = React.createClass({
  getInitialState: function() {
    return {
      animated: true,
      modalVisible: true,
      transparent: true,
    }
  },
  componentWillMount: function() {
    this._setModalVisible(true);
  },
  _setModalVisible(visible) {
    this.setState({modalVisible: visible});
  },

  _toggleAnimated() {
    this.setState({animated: !this.state.animated});
  },

  _toggleTransparent() {
    this.setState({transparent: !this.state.transparent});
  },
  _onPressRefresh() {
    this._setModalVisible(false);
    this.props.onPressRefresh();
  },
  render() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
    // default text and icon
    var text = this.props.statusMessage ? this.props.statusMessage : "We have noticed a problem with our system, we are working on it so please come back soon.";
    var imageIcon = <Image style={styles.imageIcon} source={require('../assets/icons/icon_oops.png')}/>;
    if (this.props.statusCode) {
      if (this.props.statusMessage) {
        text = this.props.statusMessage;
      }
      if (this.props.statusCode < 400) {
        imageIcon = <Image style={styles.imageIcon} source={require('../assets/icons/icon_maintenance.png')}/>;
      }
    }
    /*
              <View style={styles.loginButtonContainer}>
              </View>
              */
    return (
      <Modal style={styles.modalContainer}
        animated={this.state.animated}
        transparent={this.state.transparent}
        visible={this.state.modalVisible}>
        <Image style={styles.container} source={require('../assets/images/BG_Login.png')}>
          <Image style={styles.logo} source={require('../assets/images/Logo_Beeper.png')}/>
          {imageIcon}
          <Text style={styles.noResultText}>{text}</Text>
          <TouchableElement
            style={styles.iconTouch}
            onPress={this._onPressRefresh}
            underlayColor={"#105D95"}>
            <Text style={styles.pressRefreshText}>{this.props.buttonText}</Text>
          </TouchableElement>
        </Image>
      </Modal>
    );
  }
});

var styles = StyleSheet.create({
	modalContainer: {
    flex: 1,  // this stretch the height to be stretched in "row" order
    // resizeMode: 'stretch',  // this allows the width to be stretched in "row" order
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
	container: {
    // resizeMode: 'stretch',  // this allows the width to be stretched in "row" order
    flex: 1,  // this stretch the height to be stretched in "row" order
    width: null,
    flexDirection: "column",
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 2,
    // borderColor: 'yellow',
	},
  logo: {
    // flex: 3,
    marginTop: 125,
    marginLeft: 15,
    width: 157,
    height: 124,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  imageIcon: {
    // flex: 3,
    marginTop: 25,
    width: 90,
    height: 90,
    backgroundColor: 'transparent',
    // backgroundColor: '#00BBF0',
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  noResultText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 5,
    width: 200,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
    color: 'white',
    // borderColor: 'pink',
    // borderWidth: 1,
  },
  iconTouch: {
    flex: 2,
    alignSelf: 'center',
    marginTop: 10,
    width: 250,
    // borderColor: "purple",
    // borderWidth: 1,
  },
  pressRefreshText: {
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
    color: 'gray',
    backgroundColor: 'white',
  },
});

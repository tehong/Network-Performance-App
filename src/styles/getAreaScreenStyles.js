/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 */
'use strict';
var React = require('react-native');
var {
  StyleSheet,
} = React;

function getAreaScreenStyles(): StyleSheet {
  var styles = StyleSheet.create({
    listView: {
      backgroundColor: '#f3f3f3',
      marginBottom: 70,
    },
    container: {
      flex: 1,
      alignItems: 'stretch',
      // backgroundColor: 'rgba(10,10,10,0.8)',
      backgroundColor: 'white',
    },
    noDataContainer: {
      flex: 1,
      flexDirection: "column",
      justifyContent: 'flex-start',
      alignItems: 'center',
      // marginBottom: 300,
      // backgroundColor: 'rgba(10,10,10,0.8)',
      backgroundColor: 'white',
      // borderColor: "green",
      // borderWidth: 2,
    },
    /*
    imageContainer: {
      flex: 1,
      alignItems: 'stretch'
    },
    backgroundImage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'stretch',
      // borderWidth: 1,
      // borderColor: '#00BBF0',
    },
    */
    centerText: {
      alignItems: 'center',
    },
    noResultText: {
      flex: 1,
      textAlign: 'auto',
      paddingTop: 100,
      paddingRight: 50,
      paddingLeft: 50,
      fontSize: 20,
      fontWeight: '700',
      fontFamily: 'Helvetica Neue',
      color: '#00BBF0',
      // borderColor: 'pink',
      // borderWidth: 2,
    },
  	iconTouch: {
      flex: 2,
      alignSelf: 'center',
      // borderColor: "red",
      // borderWidth: 1,
    },
    pressRefreshText: {
      fontSize: 20,
      height: 25,
      fontWeight: '700',
      fontFamily: 'Helvetica Neue',
      color: 'white',
      backgroundColor: '#00BBF0',
    },
    separator: {
      height: 1,
      backgroundColor: '#eeeeee',
    },
    scrollSpinner: {
      marginVertical: 20,
    },
    rowSeparator: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      height: 1,
      marginLeft: 4,
    },
    rowSeparatorHide: {
      opacity: 0.0,
    },
    header: {
      // backgroundColor: "#1C75BC",
      backgroundColor: "#066D7E",
    },
    centering: {
      flex: 1,
      width: null,
      backgroundColor: '#f3f3f3',
    },
  });
  return styles;
}

module.exports = getAreaScreenStyles;

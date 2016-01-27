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

function getRightLogoStyles(): StyleSheet {
  var styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: 'center',
      width: 50,
      height: 42,
      // borderColor: "red",
      // borderWidth: 1,
    },
    icon: {
      width: 28,
      height: 28,
      marginTop: 5,
      marginRight: 5,
      // borderColor: "white",
      // borderWidth: 1,
      // borderRadius: 14,
    },
    header: {
      // backgroundColor: "#1C75BC",
      backgroundColor: "#066D7E",
    },
  });
  return styles;
}

module.exports = getRightLogoStyles;

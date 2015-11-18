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
  Image,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  View,
  MapView,
  Modal,
  TouchableHighlight,
} = React;

var SectorDetailScreen = React.createClass({
  render: function() {
    var TouchableElement = TouchableHighlight;  // for iOS or Android variation
    return (
      <View style={styles.container}>
        <MapView style={styles.map}>
          <View style={styles.sectorNameOverlap}>
            <Text style={styles.sectorName}>Text</Text>
          </View>
        </MapView>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiTabContainer}>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressPerformance}>
              <Text style={styles.buttonText}>Performace</Text>
            </TouchableElement>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressDiagnosis}>
              <Text style={styles.buttonText}>Diagnosis</Text>
            </TouchableElement>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressRemedy}>
              <Text style={styles.buttonText}>Remedy</Text>
            </TouchableElement>
          </View>
          <View style={styles.kpiListContainer}>
            <SectorKpiList/>
          </View>
        </View>
      </View>
    );
  },
});

var SectorKpiList = React.createClass({
  render: function() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI1</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI2</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI3</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI4</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI5</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI6</Text>
        </View>
        <View style={styles.kpiRowContainer}>
          <Text style={styles.ratingTitle}>KPI7</Text>
        </View>
      </ScrollView>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    // borderColor: "yellow",
    // borderWidth: 2,
  },
  map: {
    flex: 5,
    // borderColor: "red",
    // borderWidth: 2,
  },
  kpiContainer: {
    flex: 7,
    // borderColor: "violet",
    // borderWidth: 2,
  },
  sectorNameOverlap: {
    flex: 1,
    backgroundColor: 'rgba(0, 166, 216, 0.1)',
    height: 50,
    borderColor: "blue",
    borderWidth: 2,
  },
  sectorName: {
    height: 50,
    borderColor: "red",
    borderWidth: 1,
  },
  kpiTabContainer: {
    flex:1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'stretch',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#D4E6EF',
    // borderColor: "brown",
    // borderWidth: 2,
  },
  button: {
    flex: 1,
    // alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#00A9E9',
    // borderColor: "green",
    // borderWidth: 1,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    backgroundColor: 'transparent',
    color: '#D4E6EF',
  },
  kpiListContainer: {
    flex:10,
    // borderColor: "green",
    // borderWidth: 2,
  },
  contentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    // borderColor: "pink",
    // borderWidth: 2,
  },
  kpiRowContainer: {
    flex: 1,
    padding: 10,
    borderColor: "blue",
    borderWidth: 1,
  },
  separator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1 / PixelRatio.get(),
    marginVertical: 10,
  },
});

module.exports = SectorDetailScreen;

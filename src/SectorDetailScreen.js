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
  ListView,
  TouchableHighlight,
  ActivityIndicatorIOS,
} = React;

var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/';
var API_KEYS = [
  '7waqfqbprs7pajbz28mqf6vz',
  // 'y4vwv8m33hed9ety83jmv52f', Fallback api_key
];

var resultsCache = {
  dataForQuery: {},
  // nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};


var TimerMixin = require('react-timer-mixin');

var SectorDetailScreen = React.createClass({
  mixins: [TimerMixin],

  getInitialState: function() {
    return {
      animating: true,
      tabNumber: 0,
      isLoading: false,
      isLoadingTail: false,
      sectorKpiData: {},
      sectorLocation: {},
      mapRegion: null,
      mapRegionInput: null,
      annotations: null,
      isFirstLoad: true,
      filter: '',
      queryNumber: 0,
    };
  },
  componentWillMount: function() {
  },
  /**
  * Returns a random number between min (inclusive) and max (exclusive)
   */
  getRandomArbitrary: function(min, max) {
      return Math.random() * (max - min) + min;
  },
  setAnimatingTimeout: function() {
    this.setTimeout(
      () => {
        this.setState({animating: !this.state.animating});
        // this.setToggleTimeout();
      },
      this.getRandomArbitrary(100, 800)
    );
  },
  componentDidMount: function() {
    // var query = this.props.markets.entityId;
    this.setAnimatingTimeout();
    this.setState({
      tabNumber: 0,
    });
    // get all 7 sector KPI files
    this.getSectorKPI("accessibility");
    this.getSectorKPI("retainability");
    this.getSectorKPI("dlthroughput");
    this.getSectorKPI("ulthroughput");
    this.getSectorKPI("fallback");
    // this.getSectorKPI("tnol");
    // this.getSectorKPI("volteaccessibility");
    // this.getSectorKPI("volteretainability");
    this.getSectorLocation();
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    if (query) {
      return (
        API_URL + 'movies.json?apikey=' + apiKey + '&q=' +
        encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber
      );
    } else {
      // With no query, load latest markets
      var queryString = API_URL + 'lists/movies/in_theaters.json?apikey=' + apiKey +
        '&page_limit=20&page=' + pageNumber
      return queryString;
    }
  },
  refreshSectorData: function(query:string, result:{}) {
    if (query === "location") {
      this.findSectorLocation(result);
    } else {
      this.findSectorKpiData(result);
    }
  },
  fetchData: function(query, queryString) {
    switch(query.toLowerCase()) {
      case "accessibility":
        var sectors = require('../simulatedData/SectorsAccessibility.json');
        break;
      case "retainability":
        var sectors = require('../simulatedData/SectorsRetainability.json');
        break;
      case "dlthroughput":
        var sectors = require('../simulatedData/SectorsDlThroughput.json');
        break;
      case "ulthroughput":
        var sectors = require('../simulatedData/SectorsUlThroughput.json');
        break;
      case "tnol":
        var sectors = require('../simulatedData/SectorsTNOL.json');
        break;
      case "volteaccessibility":
        var sectors = require('../simulatedData/SectorsVOLTEAccessibility.json');
        break;
      case "volteretainability":
        var sectors = require('../simulatedData/SectorsVOLTERetainability.json');
        break;
      case "fallback":
        var sectors = require('../simulatedData/SectorsCSFB.json');
        break;
      case "location":
        var sectors = require('../simulatedData/SectorsLocation.json');
        break;
    }
    if (sectors) {
        LOADING[query] = false;
        resultsCache.totalForQuery[query] = sectors.result.length;
        resultsCache.dataForQuery[query] = sectors.result;
        // resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        // this gets the right data from the results
        this.refreshSectorData(query, sectors.result);
        this.setState({
          isLoading: false,
        });
    } else {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          isLoading: false,
        });
    }
  },
  findSectorLocation: function(result) {
    // empties out the dictionary
    this.state.sectorLocation = {};
    var mileRadius = 10.0
    var centerLat = 0.0;
    var centerLng = 0.0;
    var latitudeDelta = 0.2;
    var longitudeDelta = 0.2;
    var region = {};
    // find the sector first
    for (var i=0; i<result.length; i++) {
      var item = result[i];
      if (this.props.market.entityId === item.entityId) {
        centerLng = item.longitude;
        centerLat = item.latitude;
        var location = {
          "name": item.name,
          "latitude": centerLat,
          "longitude": centerLng,
        }
        var scalingFactor = Math.abs(Math.cos(2 * Math.PI * location.latitude / 360.0))
        var key = item.entityId;
        this.state.sectorLocation[key] = location;
        latitudeDelta = mileRadius/69.0;
        longitudeDelta = mileRadius/(scalingFactor * 69.0)
        region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }
        break;
      }
    }
    // find the neighboring sectors
    for (var i=0; i<result.length; i++) {
      var item = result[i];
      if(this.isWithinRegion(item, centerLat, centerLng, latitudeDelta, longitudeDelta)) {
        var location = {
          "name": item.name,
          "latitude": item.latitude,
          "longitude": item.longitude,
        }
        var key = item.entityId;
        this.state.sectorLocation[key] = location;
      }
    }
    this._onRegionInputChanged(region);
  },
  isWithinRegion: function(point, centerLat, centerLng, latitudeDelta, longitudeDelta) {
    var absCenterLat = Math.abs(centerLat);
    var absCenterLng = Math.abs(centerLng);
    if (
      ((absCenterLng + 0.5 * longitudeDelta) >= Math.abs(point.longitude)) &&
      ((absCenterLng - 0.5 * longitudeDelta) <= Math.abs(point.longitude)) &&
      ((absCenterLat + 0.5 * latitudeDelta) >= Math.abs(point.latitude)) &&
      ((absCenterLat - 0.5 * latitudeDelta) <= Math.abs(point.latitude))
      ) {
        return true;
      }
      return false;
  },
  findSectorKpiData: function(result) {
    for (var i=0; i<result.length; i++) {
      var item = result[i];
      if (this.props.market.entityId === item.entityId) {
        var kpiData = {
          "category": item.category,
          "kpi": item.kpi,
          "dailyAverage": item.dailyAverage,
          "unit": item.unit,
          "thresholds": item.thresholds,
        }
        var kpiKey = item.category.toLowerCase() + "-" + item.kpi.toLowerCase();
        this.state.sectorKpiData[kpiKey] = kpiData;
        break;
      }
    }
  },
  getSectorLocation: function() {
    this.getSectorKPI("location");
  },
  getSectorKPI: function(query: string) {
    this.timeoutID = null;

    // NOTE: Since we are not really query via HTTP but directly via simulatedData files
    //       and there is no UI refresh, we update the state.filter directly for now
    //       THIS IS AN ABNORMAL USAGE!
    this.state.filter = query;
    // this.setState({filter: query});

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.refreshSectorData(query, cachedResultsForQuery);
        this.setState({
          isLoading: false
        });
      } else {
        this.setState({isLoading: true});
      }
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
    });

    var queryString = this._urlForQueryAndPage(query, 1);
    // now fetch data
    this.fetchData(query, queryString);
  },

  onEndReached: function() {
  },

  onPressPerformance: function() {
    this.setState({
      animating: true,
      tabNumber: 0,
    });
    this.setAnimatingTimeout();
  },
  onPressDiagnosis: function() {
    this.setState({
      animating: true,
      tabNumber: 1,
    });
    this.setAnimatingTimeout();
  },
  onPressRemedy: function() {
    this.setState({
      animating: true,
      tabNumber: 2,
    });
    this.setAnimatingTimeout();
  },
  _getAnnotations(region) {
    var annotations = [];
    var sectorLocations = this.state.sectorLocation;
    for (var key in sectorLocations) {
      var image = require('image!Sector_Icon_03');
      if (this.props.market.entityId.toString() === key) {
        image = require('image!Sector_Icon_focused_03');
      }
      var title = this.props.areaName;
      var subtitle = sectorLocations[key].name;
      var latitude = sectorLocations[key].latitude;
      var longitude = sectorLocations[key].longitude;
      annotations.push({
        longitude: longitude,
        latitude: latitude,
        title: title,
        subtitle: subtitle,
        image: image,
      });
    }
    return annotations;
  },
  _onRegionChange(region) {
    this.setState({
      mapRegionInput: region,
    });
  },
  _onRegionChangeComplete(region) {
    if (this.state.isFirstLoad) {
      this.setState({
        mapRegionInput: region,
        annotations: this._getAnnotations(region),
        isFirstLoad: false,
      });
    }
  },
  _onRegionInputChanged(region) {
    this.setState({
      mapRegion: region,
      mapRegionInput: region,
      annotations: this._getAnnotations(region),
    });
  },


  render: function() {
    var TouchableElement = TouchableHighlight;  // for iOS or Android variation
    // var textBlock =  SectorDiagnosis;
    // var textBlock =  SectorRemedy;
    // var textBlock =  SectorKpiList;
    var buttonStyle1 = styles.buttonText2;
    var buttonStyle2 = styles.buttonText2;
    var buttonStyle3 = styles.buttonText2;
    switch(this.state.tabNumber) {
      case 0:
        buttonStyle1 = styles.buttonText1;
        break;
      case 1:
        buttonStyle2 = styles.buttonText1;
        break;
      case 2:
        buttonStyle3 = styles.buttonText1;
        break;
    };
    return (
      <View style={styles.container}>
        <MapView style={styles.map}
          onRegionChange={this._onRegionChange}
          onRegionChangeComplete={this._onRegionChangeComplete}
          region={this.state.mapRegion || undefined}
          annotations={this.state.annotations || undefined}
          >
          <View style={styles.sectorNameOverlap}>
            <Text style={styles.sectorName}>Text</Text>
          </View>
        </MapView>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiTabContainer}>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressPerformance}
              underlayColor={"#00A9E9"}>
              <Text style={buttonStyle1}>Performance</Text>
            </TouchableElement>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressDiagnosis}>
              <Text style={buttonStyle2}>Diagnosis</Text>
            </TouchableElement>
            <TouchableElement
              style={styles.button}
              onPress={this.onPressRemedy}>
              <Text style={buttonStyle3}>Remedy</Text>
            </TouchableElement>
          </View>
          <View style={styles.kpiListContainer}>
            <SectorDetails animating={this.state.animating} tabNumber={this.state.tabNumber} sectorKpiData={this.state.sectorKpiData}/>
          </View>
        </View>
      </View>
    );
  },
});

var SectorDetails = React.createClass({
  render: function() {
    if (this.props.animating) {
      return (
        <ActivityIndicatorIOS
          animating={this.props.animating}
          style={[styles.centering, {height: 80}]}
          color={"#00A9E9"}
          size="large"
        />
      );
    }
    switch (this.props.tabNumber) {
      case 0:
        var data = this.props.sectorKpiData;
        return (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.kpiRowContainer}>
              <KpiDetails kpiKey={"data-accessibility"} data={data["data-accessibility"]}/>
            </View>
            <View style={styles.kpiRowContainer}>
              <KpiDetails kpiKey={"data-retainability"} data={data["data-retainability"]}/>
            </View>
            <View style={styles.kpiRowContainer}>
              <KpiDetails kpiKey={"downlink-throughput"} data={data["downlink-throughput"]}/>
            </View>
            <View style={styles.kpiRowContainer}>
              <KpiDetails kpiKey={"uplink-throughput"} data={data["uplink-throughput"]}/>
            </View>
            <View style={styles.kpiRowContainer}>
              <KpiDetails kpiKey={"cs-fallback"} data={data["cs-fallback"]}/>
            </View>
          </ScrollView>
        );
        break;
      case 1:
        return (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headText}>Throughput Degradation Common Issues</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Diagnosis - </Text>
              <Text style={styles.subHeadText2}>Ericsson Probable Causes</Text>
            </View>
            <Text style={styles.issueText}>1. Downlink Interference.</Text>
            <Text style={styles.issueText}>2. Bad BLER - bad RF environment.</Text>
            <Text style={styles.issueText}>3. Incorrect MIMO Parameters.</Text>
            <Text style={styles.issueText}>4. Possible low demand.</Text>
            <Text style={styles.issueText}>5. Incorrect scheduler type.</Text>
            <Text style={styles.issueText}>6. Slow CQI frequencies.</Text>
            <Text style={styles.issueText}>7. Others (VSWR, Backhaul capacity).</Text>
            <Image style={styles.diag} source={{uri: "DL_Throughput_Diag", isStatic: true}}/>
          </ScrollView>
        );
        break;
      case 2:
        return (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headText}>Ericsson Throughput Remedy Steps</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Step 01 - </Text>
              <Text style={styles.subHeadText2}>Check Alarms and Logs</Text>
            </View>
            <Text style={styles.issueText}>Check alarms and performance logs.
              Find the root causes of these alarms and peformance issues
              and correct them one by one</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Step 02 - </Text>
              <Text style={styles.subHeadText2}>Correct Configuration Problems</Text>
            </View>
            <Text style={styles.issueText}>Review existing configuration and
              see if there are any anomalies amongst the traffic affecting configurations.
              Correct them or reprovision them if needed.</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Step 03 - </Text>
              <Text style={styles.subHeadText2}>Check Software Status</Text>
            </View>
            <Text style={styles.issueText}>Inspect and monitor software processes on the user plane.
            Restart rogue processes if needed.</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Step 04 - </Text>
              <Text style={styles.subHeadText2}>Restart or Replace Faulty Unit</Text>
            </View>
            <Text style={styles.issueText}>If there are any faulty unit detected,
            Restart or replace them on as needed basis.</Text>
          </ScrollView>
        );
        break;
    }
  },
});

var getIconFromKpiData = require("./getIconFromKpiData");
var KpiDetails = React.createClass({
  render: function() {
    var data = this.props.data;
    if (!data) {
      return(
        <Text style={styles.noData}>No data available</Text>
      );
    }
    var kpiKey = this.props.kpiKey;
    var icon = getIconFromKpiData(kpiKey, data);
    return this.getKpiDetails(icon, data);
  },
  getKpiDetails: function(icon:string, data:{}) {
    var styleColor = "#00A9E9"
    if(icon.indexOf("Red") > -1) {
      styleColor = "#DD1F27";
    } else if (icon.indexOf("Yellow") > -1) {
      styleColor = "#D99A12";
    }
    var styleText = StyleSheet.create({
      text: {
        color:styleColor,
        fontFamily: 'Helvetica Neue',
      },
    });
    return (
      <View style={styles.kpiEntryContainer}>
        <View style={styles.kpiIconContainer}>
          <Image style={styles.kpiIcon} source={{uri: icon, isStatic: true}}/>
        </View>
        <View style={styles.kpiTextContainer}>
          <Text style={[styleText.text, styles.kpiCatText]}>{data.category}</Text>
          <Text style={[styleText.text, styles.kpiNameText]}>{data.kpi}</Text>
        </View>
        <View style={styles.dailyAverageContainer}>
          <Text style={[styleText.text, styles.dailyAverage]}>{data.dailyAverage}</Text>
          <Text style={[styleText.text, styles.kpiUnit]}>{data.unit}</Text>
        </View>
      </View>
    );
  }
});
/*
var SectorDiagnosis = React.createClass({
  render: function() {
        return (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headText}>Throughput Degrdation Common Issues</Text>
            <View style={styles.subHeadContainer}>
              <Text style={styles.subHeadText1}>Diagnosis - </Text>
              <Text style={styles.subHeadText2}>Ericsson Problem</Text>
            </View>
            <Text style={styles.issueText}>KPI3</Text>
          </ScrollView>
        );
        break;
  },
});

var SectorRemedy = React.createClass({
  render: function() {
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.headText}>Ericsson Throughput Issue</Text>
        <View style={styles.subHeadContainer}>
          <Text style={styles.subHeadText1}>Step 01 - </Text>
          <Text style={styles.subHeadText2}>Check Power</Text>
        </View>
        <Text style={styles.issueText}>check power</Text>
        <View style={styles.subHeadContainer}>
          <Text style={styles.subHeadText1}>Step 02 - </Text>
          <Text style={styles.subHeadText2}>Power Cycle</Text>
        </View>
        <Text style={styles.issueText}>power cyclc</Text>
        <View style={styles.subHeadContainer}>
          <Text style={styles.subHeadText1}>Step 03 - </Text>
          <Text style={styles.subHeadText2}>Fix Issue</Text>
        </View>
        <Text style={styles.issueText}>Fix issue</Text>
      </ScrollView>
    );
  },
});
*/

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
    flex: 8,
    // borderColor: "violet",
    // borderWidth: 2,
  },
  sectorNameOverlap: {
    flex: 1,
    backgroundColor: 'rgba(0, 166, 216, 0.1)',
    height: 50,
    // borderColor: "blue",
    // borderWidth: 2,
  },
  sectorName: {
    height: 50,
    //borderColor: "red",
    //borderWidth: 1,
  },
  kpiTabContainer: {
    flex:1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'stretch',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#D4E6EF',
    // borderColor: "brown",
    // borderWidth: 2,
  },
  button: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white',
    // borderColor: "green",
    // borderWidth: 1,
  },
  buttonText1: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    backgroundColor: '#00A9E9',
    color: '#D4E6EF',
    paddingTop: 8,
    paddingBottom: 8,
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  buttonText2: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: "500",
    fontFamily: 'Helvetica Neue',
    backgroundColor: '#D4E6EF',
    color: '#00A9E9',
    paddingTop: 8,
    paddingBottom: 8,
    // borderColor: "red",
    // borderWidth: 1,
  },
  kpiListContainer: {
    flex:10,
    // borderColor: "green",
    // borderWidth: 2,
  },
  contentContainer: {
    paddingLeft: 35,
    paddingRight: 25,
    // borderColor: "pink",
    // borderWidth: 2,
  },
  headText: {
    marginTop: 10,
    marginBottom: 4,
    fontFamily: 'Helvetica Neue',
    fontSize: 17,
    fontWeight: "400",
    color: "#888A8D",
  },
  subHeadContainer: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 7,
  },
  subHeadText1: {
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    fontWeight: "600",
    color: "#48C4F3",
  },
  subHeadText2: {
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    fontWeight: "800",
    color: "#03AEEE",
  },
  issueText: {
    fontFamily: 'Helvetica Neue',
    fontSize: 15,
    fontWeight: "400",
  },
  diag: {
    alignSelf: "stretch",
    marginTop: 10,
    width: 300,
    height: 160,
  },
  kpiRowContainer: {
    flex: 1,
    paddingLeft: 3,
    paddingTop: 5,
    paddingBottom: 5,
    // borderColor: "blue",
    // borderWidth: 1,
  },
  kpiEntryContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent:"flex-start",
    alignItems:"stretch",
    // borderColor: "red",
    // borderWidth: 1,
  },
  kpiIconContainer: {
    flex:5,
    justifyContent: "center",
    alignItems: "center",
    // borderColor: "pink",
    // borderWidth: 1,
  },
  kpiTextContainer: {
    flex: 19,
    flexDirection:"column",
    justifyContent:"flex-start",
    paddingLeft: 14,
    paddingTop: 2,
    alignItems:"flex-start",
    // borderColor: "yellow",
    // borderWidth: 1,
  },
  dailyAverageContainer: {
    flex: 10,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    paddingTop: 6,
    // borderColor: "green",
    // borderWidth: 1,
  },
  kpiIcon: {
    height: 39,
    width: 39,
    // borderColor: "purple",
    // borderWidth: 1,
  },
  kpiCatText: {
    flex:1,
    fontSize: 12,
    fontWeight: "900",
    // borderColor: "gray",
    // borderWidth: 1,
  },
  kpiNameText: {
    flex:4,
    fontSize: 16,
    fontWeight: "300",
    // borderColor: "pink",
    // borderWidth: 1,
  },
  dailyAverage: {
    flex:1,
    fontSize: 23,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 0,
    // borderColor: "gray",
    // borderWidth: 1,
  },
  kpiUnit: {
    flex:1,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "left",
    marginTop: 5,
    // borderColor: "violet",
    // borderWidth: 1,
  },
  noData: {
    fontSize: 20,
    fontWeight: "300",
    fontFamily: 'Helvetica Neue',
  },
  centering: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  separator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1 / PixelRatio.get(),
    marginVertical: 10,
  },
});

module.exports = SectorDetailScreen;

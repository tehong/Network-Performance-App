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
  TouchableOpacity,
  ActivityIndicatorIOS,
  Alert,
} = React;

/* Thumb operator */
var SECTOR_URL = 'http://52.20.201.145:3010/kpis/v1/sector/';
var SECTOR_LOC_URL = 'http://52.20.201.145:3010/kpis/v1/location/sectors/all';

// syringa
// var SECTOR_URL = 'http://52.20.201.145:3000/kpis/v1/sectors/zone/name/';
// var SECTOR_LOC_URL = 'http://52.20.201.145:3000/kpis/v1/location/sectors/zone/';

var ZONE_LOC_URL = 'http://52.20.201.145:3000/kpis/v1/location/zones/all/';
// var ZONE_LOC_URL = 'http://52.20.201.145:3000/kpis/v1/location/zones/zone/';
var NUM_CACHE_ENTRY = 2;  // 5 kpis and two locations
var numEntryProcessed = 0;

// TEST:  Makes the overlays a global and set with the annotations at the same time
// var overlays = [];  // didn't work

// map display diameter (double of the radius)
var mileDiameter = 20.0;

var resultsCache = {
  dataForQuery: {},
  // nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};


// Timer mixin (similar to multiple interetance in C++)
var TimerMixin = require('react-timer-mixin');
// Obtain device oritentation changes and process them
var Orientation = require('react-native-orientation');

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
      overlays: [],
      mapRegion: null,
      mapRegionInput: null,
      annotations: null,
      isFirstLoad: true,
      filter: '',
      queryNumber: 0,
      isLandscape: false,
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
  _orientationDidChange: function(orientation) {
    if(orientation == 'LANDSCAPE'){
      this.setState({isLandscape: true});
    }else{
      this.setState({isLandscape: false});
    }
  },
  componentDidMount: function() {
    // set default region first to remove warnings
    this.setState({
      tabNumber: 0,
      isLoading: true
    });
    Orientation.getOrientation((err,orientation)=> {
      if (orientation === "LANDSCAPE") {
        this.setState({isLandscape: true});
      } else {
        this.setState({isLandscape: false});
      }
    });
    // Orientation.lockToPortrait(); //this will lock the view to Portrait
    //Orientation.lockToLandscape(); //this will lock the view to Landscape
    Orientation.unlockAllOrientations(); //this will unlock the view to all Orientations
    // register the oritnation listener
    Orientation.addOrientationListener(this._orientationDidChange);

    // var query = this.props.markets.entityId;
    this.setAnimatingTimeout();
    numEntryProcessed = 0; // reset the number data entry processed to 0
    // plot the map
    // this.getZoneLocation();  // Syringa only
    this.getSectorLocation();
    // get all 5 sector KPI files
    // inlcude query name with zoneName (Syringa only)
    // var query = this.props.zoneName + "/category/";
    // Thumb:
    var query = this.props.sector.name + "/daily/kpi";

    // Thumb
    this.getData(query);

    // syringa
    /*
    this.getData(query + "Data" + "/kpi/" + "Accessibility");
    this.getData(query + "Data" + "/kpi/" + "Retainability");
    this.getData(query + "Data" + "/kpi/" + "Downlink Throughput");
    this.getData(query + "Data" + "/kpi/" + "Uplink Throughput");
    this.getData(query + "CS" + "/kpi/" + "Fallback");
    */
    // empties out the dictionary
    // this.getData("tnol");
    // this.getData("volteaccessibility");
    // this.getData("volteretainability");
  },
  componentWillUnmount: function() {
    /*
    Orientation.getOrientation((err,orientation)=> {
        console.log("Current Device Orientation: ", orientation);
    });
    */
    Orientation.removeOrientationListener(this._orientationDidChange);
    Orientation.lockToPortrait(); //this will lock the view to Portrait
  },
  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    if (query.indexOf("zonelocation") > -1) {
      return ZONE_LOC_URL + this.props.zoneName;
    } else if (query.indexOf("sectorlocation") > -1) {
      // return SECTOR_LOC_URL + this.props.zoneName;
      return SECTOR_LOC_URL;
    } else if (query) {
      return (
        SECTOR_URL + query
      );
    } else {
      // With no query, load sector's KPIs
      // var queryString = SECTOR_URL + this.props.zoneName + '/category/' + this.props.category + '/kpi/' + this.props.kpi + '/';
      // thumb:
      var queryString = SECTOR_URL + this.props.sector.name + 'daily/kpi/';
      return queryString;
    }
  },
  refreshData: function(query:string, result:{}) {
    if (query.indexOf("zonelocation") > -1) {
      this.findZoneLocation(result);
    } else if (query.indexOf("sectorlocation") > -1) {
      this.findSectorLocation(result);
    } else {
      this.findSectorKpiData(result);
    }
  },
  fetchData: function(query, queryString) {
    console.log("queryString = " + queryString);
    fetch(queryString, {
      headers: {
        'networkid': 'thumb',
      },
    })
      .then((response) => response.json())
      .then((responseData) => {
        var sectors = responseData;
        if (sectors) {
            LOADING[query] = false;
            resultsCache.totalForQuery[query] = sectors.length;
            resultsCache.dataForQuery[query] = sectors;
            // resultsCache.nextPageNumberForQuery[query] = 2;

            /* NOTE: doesn't work with fetch()
            if (this.state.filter !== query) {
              // do not update state if the query is stale
              return;
            }
            */
            // this gets the right data from the results
            this.refreshData(query, sectors);
            // don't set isLoading to false unless all data are loaded
            // console.log("queryNumber = " + this.state.queryNumber);
            // this.state.queryNumber won't be updated until later when the view is shown
            //   so an static number is shown
            if (numEntryProcessed >= NUM_CACHE_ENTRY) {
              this.setState({
                isLoading: false,
              });
            }
        } else {
          LOADING[query] = false;
          resultsCache.dataForQuery[query] = undefined;

          this.setState({
            dataSource: this.getDataSource([]),
            isLoading: false,
          });
        }
      })
      .catch((ex) => {
        var alertMessage = 'Timeout on retrieving data: ' + ex;
        Alert.alert(
          'Timeout Alert',
          alertMessage,
          [
            {text: 'OK', onPress: () => console.log(alertMessage)},
          ]
        );
        this.setState({isLoading: false});
      })
  },
  findZoneLocation: function(result) {
    var overlays = [];
    if (this.props.zoneName === result.name) {
      var coordinates = result.coordinates;
      // add the additional point from the first point
      coordinates.push(result.coordinates[0]);
      overlays.push(
        {
          coordinates: coordinates,
          strokeColor: "rgba(124,209,238,0.7)",
          // fillColor: "rgba(124,209,238,0.7)",
          // strokeColor: "#7cd1ee",
          // fillColor: "#7cd1ee",
          lineWidth: 3,
        }
      )
      this.setState({
        overlays: overlays,
      });
    }
  },
  findSectorLocation: function(result) {
    this.state.sectorLocation = {};
    var centerLat = 0.0;
    var centerLng = 0.0;
    var latitudeDelta = 0.2;
    var longitudeDelta = 0.2;
    var region = {};
    // find the sector first
    for (var i=0; i<result.length; i++) {
      var item = result[i];
      if (this.props.sector.name === item.name) {
        centerLng = item.longitude;
        centerLat = item.latitude;
        var location = {
          "name": item.name,
          "parentEntityName": item.parentName,
          "latitude": centerLat,
          "longitude": centerLng,
          "azimuth": item.azimuth,
        }
        var scalingFactor = Math.abs(Math.cos(2 * Math.PI * location.latitude / 360.0))
        var key = item.name;
        this.state.sectorLocation[key] = location;
        latitudeDelta = mileDiameter/69.0;
        longitudeDelta = mileDiameter/(scalingFactor * 69.0)
        /* TODO: not working, if user started with landscape, it seems that the zoom level is two times!
        if (this.state.isLandscape) {
          longitudeDelta = longitudeDelta / 2;  // initial landsacape need smaller radius
          latitudeDelta = latitudeDelta / 2;
        }
        */
        region = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        }
        break;
      } else {
        // set default region
        region={latitude: 39.06, longitude: -95.22, latitudeDelta: 25.0, longitudeDelta: 35.0};
      }
    }
    // find the neighboring sectors
    for (var i=0; i<result.length; i++) {
      var item = result[i];
      if(this.isWithinRegion(item, centerLat, centerLng, latitudeDelta, longitudeDelta)) {
        var location = {
          "name": item.name,
          "parentEntityName": item.parentName,
          "latitude": item.latitude,
          "longitude": item.longitude,
          "azimuth": item.azimuth,
        }
        var key = item.name;
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
      // if (this.props.sector.name === item.kpi) {
        /* Syringa
        var kpiData = {
          "category": item.category,
          "kpi": item.kpi,
          "dailyAverage": item.dailyAverage,
          "unit": item.unit,
          "thresholds": item.thresholds,
        }
        */
        var unit = item.unit;
        if (item.dailyAverage === "No Data") {
          unit = "";
        }
        var kpiData = {
          "category": item.category,
          "kpi": item.kpi,
          "dailyAverage": item.dailyAverage,
          "unit": unit,
          "thresholds": item.thresholds,
        }
        if (item.kpi.indexOf("Downlink") !== -1) {
          item.category = "Downlink";
        }
        if (item.kpi.indexOf("Uplink") !== -1) {
          item.category = "Uplink";
        }
        item.kpi = item.kpi.replace("Data ", "");
        item.kpi = item.kpi.replace("Downlink ", "");
        item.kpi = item.kpi.replace("Uplink ", "");

        var kpiKey = item.category.toLowerCase() + "-" + item.kpi.toLowerCase();
        this.state.sectorKpiData[kpiKey] = kpiData;
      // }
    }
  },
  getZoneLocation: function() {
    // add the zone name in the query
    this.getData(this.props.zoneName + "/zonelocation");
    /*
    var zone = require('../simulatedData/ZonesLocation.json');
    var query = "zonelocation";
    if (zone) {
      LOADING[query] = false;
      resultsCache.totalForQuery[query] = zone.result.length;
      resultsCache.dataForQuery[query] = zone.result;

      // this gets the right data from the results
      this.refreshData(query, zone.result);
    }
    */
  },
  getSectorLocation: function() {
    this.getData(this.props.zoneName + "/sectorlocation");
    /*
    var sectors = require('../simulatedData/SectorsLocation.json');
    var query = "sectorlocation";
    if (sectors) {
      LOADING[query] = false;
      resultsCache.totalForQuery[query] = sectors.result.length;
      resultsCache.dataForQuery[query] = sectors.result;

      // this gets the right data from the results
      this.refreshData(query, sectors.result);
    }
    */
  },
  getData: function(query: string) {
    numEntryProcessed = numEntryProcessed + 1;
    this.timeoutID = null;

    // NOTE: Since we are not really query via HTTP but directly via simulatedData files
    //       and there is no UI refresh, we update the state.filter directly for now
    //       THIS IS AN ABNORMAL USAGE!
    // this.state.filter = query;  // This doesn't work with fetch with error code
    // this.setState({filter: query});

    var cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.refreshData(query, cachedResultsForQuery);
        // if (resultsCache.totalForQuery.length >= NUM_CACHE_ENTRY && this.state.isLoading === true) {

        if (numEntryProcessed >= NUM_CACHE_ENTRY) {
          this.setState({
            isLoading: false
          });
        }
        // }
      } else {
        this.setState({isLoading: true});
      }
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
    });

    var queryString = this._urlForQueryAndPage(query, 1);
    console.log("SectorDetails queryString = " + queryString);
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
    // var resolveAssetSource = require('resolveAssetSource');
    for (var key in sectorLocations) {
      // var image = require('./assets/icons/Sector_Icon_03.png');
      // var image = resolveAssetSource(require('./assets/icons/Sector_Icon_03.png'));
      if (sectorLocations[key].azimuth !== undefined) {
        var azimuth = sectorLocations[key].azimuth + "deg";
      } else {
        var azimuth = "0deg";
      }
      var sectorView =
          <View style={styles.sectorViewWrapper}>
            <Image style={[styles.sectorView, {transform: [{rotate: azimuth}]}]} source={require('./assets/icons/Icon_Sector_01.png')}/>
          </View>
      if (this.props.sector.name === key) {
        // image = require('./assets/icons/Sector_Icon_focused_03.png');
        // image = resolveAssetSource(require('./assets/icons/Sector_Icon_focused_03.png'));
        sectorView =
          <View style={styles.sectorViewWrapper}>
            <Image style={[styles.sectorView, {transform: [{rotate: azimuth}]}]} source={require('./assets/icons/Icon_Sector_Selected_01.png')}/>
          </View>
      }
      var title = this.props.areaName;
      // var subtitle = this.props.zoneName + " - " + sectorLocations[key].name;
      // show sector name or site name based on which site it is.  If it is the site of the selected sector => show sector name
      if (this.props.sector.parentEntityName === sectorLocations[key].parentEntityName) {
        var subtitle = this.props.zoneName + " - " + this.props.sector.name;
      } else {
        var subtitle = this.props.zoneName + " - " + sectorLocations[key].parentEntityName;
      }
      var latitude = sectorLocations[key].latitude;
      var longitude = sectorLocations[key].longitude;
      annotations.push({
        longitude: longitude,
        latitude: latitude,
        title: title,
        subtitle: subtitle,
        // image: image,
        view: sectorView,
        // tintColor: "#1C75BC",  additional tint on site icon, not used
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
  showKpiView: function() {
    var TouchableElement = TouchableOpacity;  // for iOS or Android variation
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
    if (this.state.isLandscape) {
      return;
    } else {
      return(
        <View style={styles.kpiContainer}>
          <View style={styles.kpiTabContainer}>
            <TouchableElement
              style={styles.button}
              activeOpacity={0.5}
              onPress={this.onPressPerformance}>
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
      );
    }
  },
  render: function() {
    if (this.state.isLoading) {
      return(
        <ActivityIndicatorIOS
          animating={true}
          style={[styles.centering, {height: 100}]}
          color={"#00A9E9"}
          size="large"
        />
      );
    } else {
      return (
        <View style={styles.container}>
          <MapView style={styles.map}
            onRegionChange={this._onRegionChange}
            animateDrop={true}
            onRegionChangeComplete={this._onRegionChangeComplete}
            region={this.state.mapRegion || undefined}
            annotations={this.state.annotations || undefined}
            overlays={this.state.overlays || undefined}
          />
          {this.showKpiView()}
        </View>
      );
    }
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
            <Image style={styles.diag} source={require('./assets/images/diag.png')}/>
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

var getIconFromKpiData = require("./components/getIconFromKpiData");
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

    // treat the throughput differently
    if (data.kpi.indexOf("Throughput") > -1) {
      var category = data.kpi.substring(0, data.kpi.indexOf(" "));
      var kpi = data.kpi.substring(data.kpi.indexOf(" ") + 1, data.kpi.length);
    } else {
      var category = data.category;
      var kpi = data.kpi;
    }
    var styleColor = "#00A9E9";
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
          {this.getIconView(icon)}
        </View>
        <View style={styles.kpiTextContainer}>
          <Text style={[styleText.text, styles.kpiCatText]}>{category}</Text>
          <Text style={[styleText.text, styles.kpiNameText]}>{kpi}</Text>
        </View>
        <View style={styles.dailyAverageContainer}>
          <Text style={[styleText.text, styles.dailyAverage]}>{data.dailyAverage}</Text>
          <Text style={[styleText.text, styles.kpiUnit]}>{data.unit}</Text>
        </View>
      </View>
    );
  },
  getIconView: function(icon:string) {
    if(icon.indexOf("Red") > -1) {
      switch(icon) {
        case "Icon_DA_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DA_Red.png")}/>
          );
          break;
        case "Icon_DR_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DR_Red.png")}/>
          );
          break;
        case "Icon_DT_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DT_Red.png")}/>
          );
          break;
        case "Icon_UT_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_UT_Red.png")}/>
          );
          break;
        case "Icon_T_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_T_Red.png")}/>
          );
          break;
        case "Icon_VA_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VA_Red.png")}/>
          );
          break;
        case "Icon_VR_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VR_Red.png")}/>
          );
          break;
        case "Icon_CS_Red":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_CS_Red.png")}/>
          );
          break;
      }
    }
    else if(icon.indexOf("Green") > -1) {
      switch(icon) {
        case "Icon_DA_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DA_Green.png")}/>
          );
          break;
        case "Icon_DR_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DR_Green.png")}/>
          );
          break;
        case "Icon_DT_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DT_Green.png")}/>
          );
          break;
        case "Icon_UT_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_UT_Green.png")}/>
          );
          break;
        case "Icon_T_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_T_Green.png")}/>
          );
          break;
        case "Icon_VA_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VA_Green.png")}/>
          );
          break;
        case "Icon_VR_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VR_Green.png")}/>
          );
          break;
        case "Icon_CS_Green":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_CS_Green.png")}/>
          );
          break;
      }
    }
    else {
      switch(icon) {
        case "Icon_DA_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DA_Yellow.png")}/>
          );
          break;
        case "Icon_DR_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DR_Yellow.png")}/>
          );
          break;
        case "Icon_DT_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_DT_Yellow.png")}/>
          );
          break;
        case "Icon_UT_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_UT_Yellow.png")}/>
          );
          break;
        case "Icon_T_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_T_Yellow.png")}/>
          );
          break;
        case "Icon_VA_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VA_Yellow.png")}/>
          );
          break;
        case "Icon_VR_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_VR_Yellow.png")}/>
          );
          break;
        case "Icon_CS_Yellow":
          return (
            <Image style={styles.kpiIcon} source={require("./assets/icons/Icon_CS_Yellow.png")}/>
          );
          break;
      }
    }
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
    // flex: 1,  // this allows height to be stretched in "row" order!
    resizeMode: 'stretch',  // this allows the width to be stretched in "row" order!
    width: null, // enable full stretch
    height: 190, // enable full stretch
    // borderColor: "red",
    // borderWidth: 1,
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
    flex:2,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 0,
    // borderColor: "gray",
    // borderWidth: 1,
  },
  kpiUnit: {
    flex:1,
    fontSize: 10,
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
  sectorViewWrapper: {
    backgroundColor: 'transparent',
  },
  sectorView: {
    // transform: [{rotate: '0deg'}],
    height: 33,
    width: 33,
    backgroundColor: 'rgba(0,0,0,0)',
    // backgroundColor: 'transparent',
    // borderColor: "red",
    // borderWidth: 1,
  }
});

module.exports = SectorDetailScreen;

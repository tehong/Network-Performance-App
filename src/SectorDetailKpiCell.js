/**
 *
 */
'use strict';

var React = require('react-native');
var {
  Platform,
  StyleSheet,
  Text,
  View
} = React;

var isDataEmpty = require('./utils/isDataEmpty');

var SectorDetailKpiCell = React.createClass({
  render: function() {
    return (
      <View>
        {this.kpiView()}
      </View>
    );
  },
  kpiView: function() {
    var sector = this.props.geoArea;
    var getDailyAverage = require('./utils/getDailyAverage');
    var dailyAverage = getDailyAverage(sector.kpi, sector.dailyAverage, sector.kpiDecimalPrecision);
    var unit = sector.unit;
    var category = sector.category;
    var kpi = sector.kpi;

    var getThreshold = require('./utils/getThreshold');
    var getImageFromAverage = require('./utils/getImageFromAverage');

    var redThreshold = getThreshold(sector.thresholds, "red", kpi);
    var greenThreshold = getThreshold(sector.thresholds, "green", kpi);

    // dailyAverage = "No Data";  // for testing
    var colorBackground = getImageFromAverage(dailyAverage, redThreshold, greenThreshold, sector.statusColor).toLowerCase();

    var styleColor = "#37b449";
    if (colorBackground.indexOf("red") > -1) {
      styleColor = "#DD1F27";
    } else if (colorBackground.indexOf("yellow") > -1) {
      styleColor = "#D99A12";
    } else if (colorBackground.indexOf("grey") > -1) {
      styleColor = "#7a7a7c";
    }
    var styleText = StyleSheet.create({
      text: {
        color: styleColor,
        fontFamily: 'Helvetica Neue',
      },
    });
    if (dailyAverage === "No Data") {
      unit = "";
    }

    var dailyAverageContent = (dailyAverage === "No Data") ?
      <View style={styles.noDataContainer}>
        <Text style={[styles.categoryText, styleText.text]}>No Data</Text>
        <Text style={[styles.kpiText, styleText.text]}>Available</Text>
      </View>
      :
      <View style={styles.dailyAverageContainer}>
        <Text style={[styles.dailyValueText, styleText.text]}>{dailyAverage}</Text>
        <Text style={[styles.unitText, styleText.text]}>{unit}</Text>
      </View>;
    return(
      <View style={styles.container}>
        <View style={styles.kpiContainer}>
          <Text style={[styles.categoryText, styleText.text]}>{category}</Text>
          <Text style={[styles.kpiText, styleText.text]}>{kpi}</Text>
        </View>
        {dailyAverageContent}
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    // borderColor: "blue",
    // borderWidth: 2,
  },
  kpiContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: 'flex-start',
    marginLeft: 30,
    //borderColor: "red",
    // borderWidth: 2,
  },
  noDataContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: 'flex-start',
    marginRight: 52,
    // borderColor: "green",
    // borderWidth: 1,
  },
  categoryText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    // borderColor: "violet",
    // borderWidth: 1,
  },
  kpiText: {
    flex: 2,
    fontSize: 14,
    fontWeight: '300',
    // borderColor: "blue",
    // borderWidth: 1,
  },
  dailyAverageContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    marginRight: 30,
    width: 77,
    // borderColor: 'black',
    // borderWidth: 1,
  },
  dailyValueText: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: "left",
    // borderColor: 'purple',
    // borderWidth: 1,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 3,
    textAlign: "left",
    // borderColor: 'pink',
    // borderWidth: 1,
  },
});

module.exports = SectorDetailKpiCell;

//
//  SparklineViewController.swift
//  ShowMi
//
//  Created by Eric Hong on 9/16/15.
//  Copyright © 2015 3Ten8. All rights reserved.
//

import UIKit
// See CorePlot documentation:  http://core-plot.github.io/iOS/index.html#start
import CorePlot


class SparklineViewController: UIViewController, CPTPlotAreaDelegate, CPTPlotSpaceDelegate, CPTPlotDataSource, CPTScatterPlotDelegate {
  
  // class constants
  let kDataLine = "DataLine"
  let kGreenThreshLIne = "greenThresholdLine"

  // var annotation = CPTPlotSpaceAnnotation?()
  var histogramOption = CPTScatterPlotHistogramOption.SkipSecond
  var graph:CPTXYGraph?
  var plotSpace:CPTXYPlotSpace?
  var dataSourceLinePlot:CPTScatterPlot?
  var plotData = [[String:Double]]()
  var dateArray = Dictionary<Int, String>()
  let cptPrimeColor = CPTColor(componentRed: 43/255, green: 136/255, blue: 184/255, alpha: 1)
  var _greenThreshold:Double = 0.0
  
  
  func reset() {
    if graph != nil {
      graph!.removeAllAnimations()
      graph!.removeAllAnnotations()
      graph!.plotAreaFrame?.removeFromSuperlayer()
      graph!.removePlot(dataSourceLinePlot)
      graph!.plotAreaFrame?.plotArea?.delegate = nil
      graph!.graph?.removeFromSuperlayer()
      graph!.plotAreaFrame?.plotArea?.delegate = nil
      graph!.axisSet?.axes = nil
      graph!.graph = nil
      graph = nil
    }
    plotData.removeAll()
    dateArray.removeAll()
    graph = CPTXYGraph(frame: CGRectZero)
    plotData.removeAll()
    dateArray.removeAll()
    plotSpace?.removeAllCategories()
    
    plotSpace = nil
    dataSourceLinePlot = nil
    
  }
  
  // find the Y location and Y length
  //   item["location"] => Y Location
  //   item["length"] => Y Length
  func findYLocationAndLength() -> Dictionary<String, Double> {
    var maxY:Double = 0.0
    var yReturn:Dictionary = Dictionary<String, Double>()
    yReturn["location"] = 0.0
    yReturn["length"] = 0.0
    for item in plotData {
      if Double(item["y"]!) > maxY {
        maxY = Double(item["y"]!)
      }
    }
    var minY:Double = maxY
    
    // find minY
    for item in plotData {
      if Double(item["y"]!) < minY {
        minY = Double(item["y"]!)
      }
    }
    
    // This algorithm centers the greenThreshold line horizontally on the chart by finding the right display location and length of y-axis
    
    let greenThreshold:Double = Double(_greenThreshold)
    if (greenThreshold >= maxY) {
      yReturn["location"] = minY
      yReturn["length"] = (greenThreshold - minY) * 2
    } else if (greenThreshold <= minY) {
      yReturn["location"] = greenThreshold - (maxY - greenThreshold)
      yReturn["length"] = (maxY - greenThreshold) * 2
    } else if (greenThreshold - minY >= maxY - greenThreshold) {
      yReturn["location"] = minY
      yReturn["length"] = (greenThreshold - minY) * 2
    } else {
      yReturn["location"] = greenThreshold - (maxY - greenThreshold)
      yReturn["length"] = (maxY - greenThreshold) * 2
    }
    
    return yReturn
  }
  
  func findMaxY(dataArray:[[AnyObject]]) -> Float {
    var maxY:Float = 0.0
    for item in dataArray {
      if item[1] as! Float > maxY {
        maxY = item[1] as! Float
      }
    }
    return maxY
  }
  
  
  // This function transform the [(dateStr, number)] such as [("2015-09-10 13:00", 98)] to [[String:Int]] "x", "y" pairs, e.g. [[x:"2015-09-10 13:00", y:98]]
  // However, the "x", "y" pairs will needed to be sorted by the precedent of the data
  func generateData(dataArray:[[AnyObject]]) {
    // data comes with the latest first so we need to set up the x number in reverse
    var i = dataArray.count - 1  // count down to 0
    for item in dataArray {
      let xValue = (item[0] as! NSString).doubleValue
      let yValue = (item[1] as! Double)
      plotData.append(["x":xValue, "y":yValue])
      // let dateStr:NSString = NSString(string: item.0).substringFromIndex(5)
      let dateStr:NSString = NSString(string: String(xValue)).substringFromIndex(0)
      
      dateArray[i] = dateStr as String
      i--
    }
    // print(plotData)
    // print(dateArray)
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
  }
  
  // This function sets up the CPTPlotAreaFrame, CPTPlotArea, CPTAxisSet, CTPAxis
  func setUpChart(graphView:CPTGraphHostingView) {
    
    reset()
    
    let bounds:CGRect = graphView.bounds
    graph!.frame = bounds
    
    // some paddings on all sides
    graph!.paddingBottom = 3
    graph!.paddingLeft = 0
    graph!.paddingRight = 0
    graph!.paddingTop = 3
    
    // create graph

    // ** set up CPTPlotAreaFrame (from CPTPlotAreaDelete)
    // set the plotArea delegate to self
    graph!.plotAreaFrame!.plotArea!.delegate = self
    
    
    // graph.plotAreaFrame?.plotArea?.frame = bounds
    
    // set up plotSpace
    plotSpace = graph!.defaultPlotSpace as? CPTXYPlotSpace
    plotSpace!.allowsUserInteraction = false
    plotSpace!.delegate = self
    
    /*
    // Grid line styles
    
    let majorGridLineStyle:CPTMutableLineStyle = CPTMutableLineStyle()
    majorGridLineStyle.lineWidth = 0.75
    majorGridLineStyle.lineColor = CPTColor(genericGray: CGFloat(0.2)).colorWithAlphaComponent(CGFloat(0.5))
    let minorGridLineStyle: CPTMutableLineStyle = CPTMutableLineStyle()
    minorGridLineStyle.lineWidth = 0.25
    minorGridLineStyle.lineColor = CPTColor.whiteColor().colorWithAlphaComponent(CGFloat(0.1))
    
    let redLineStyle: CPTMutableLineStyle = CPTMutableLineStyle()
    redLineStyle.lineWidth = 10.0
    redLineStyle.lineColor = CPTColor.redColor().colorWithAlphaComponent(0.5)
    */
    // Axes
    // Label x axis with a fixed interval policy
    /*
    let axisSet: CPTXYAxisSet = graph.axisSet as! CPTXYAxisSet
    let x: CPTXYAxis = axisSet.xAxis!
    x.majorIntervalLength = 0
    x.orthogonalPosition = 0
    x.minorTicksPerInterval = 0
    x.majorGridLineStyle = majorGridLineStyle
    x.minorGridLineStyle = minorGridLineStyle
    x.labelOffset = 10.0
    x.title = "Date-Time"
    x.titleOffset = 0.0
    // x.titleLocation = 0
    
    // Label y with an automatic label policy.
    let y: CPTXYAxis = axisSet.yAxis!
    y.labelingPolicy = CPTAxisLabelingPolicy.Automatic
    y.orthogonalPosition = 0
    y.minorTicksPerInterval = 0
    y.preferredNumberOfMajorTicks = 10
    y.majorGridLineStyle = majorGridLineStyle
    y.minorGridLineStyle = minorGridLineStyle
    y.labelOffset = 1.0
    y.title = yLabel
    y.titleOffset = 30.0
    
    let yTitleTextStyle: CPTMutableTextStyle = CPTMutableTextStyle()
    yTitleTextStyle.color = primeColor
    yTitleTextStyle.fontSize = 12.0
    yTitleTextStyle.fontName = "Helvetica-Bold"
    y.titleTextStyle = yTitleTextStyle
    
    let yLabelTextStyle: CPTMutableTextStyle = CPTMutableTextStyle()
    yLabelTextStyle.color = CPTColor.redColor()
    yLabelTextStyle.fontSize = 10.0
    yLabelTextStyle.fontName = "Helvetica"
    y.labelTextStyle = yLabelTextStyle
    // y.titleLocation = 5
    
    // Set axes
    graph.axisSet!.axes = [x, y]
    */
    
    graph!.axisSet!.axes = nil  // no x/y axes
    
  }
  
  // yScale: [0] => yMinValue, [1] => yLength
  func plot(dataArray:[[AnyObject]], greenThreshold: Double, yScale: [Double], graphView:CPTGraphHostingView)
  {
    _greenThreshold = greenThreshold
    setUpChart(graphView)
    
    // data needs to be there before the plot gets created!
    generateData(dataArray)
    
    // Create a data line plot that uses the data source method
    
    dataSourceLinePlot = CPTScatterPlot()
    dataSourceLinePlot!.identifier = kDataLine
    var lineStyle: CPTMutableLineStyle = dataSourceLinePlot!.dataLineStyle!.mutableCopy() as! CPTMutableLineStyle
    lineStyle.lineWidth = 1.0
    // lineStyle.lineColor = CPTColor.orangeColor()
    lineStyle.lineColor = CPTColor.whiteColor() // cptPrimeColor
    dataSourceLinePlot!.dataLineStyle = lineStyle
    dataSourceLinePlot!.histogramOption = self.histogramOption
    dataSourceLinePlot!.dataSource = self
    graph!.addPlot(dataSourceLinePlot)

    // Red Threshold Line plot:
    
    let redThreshLinePlot: CPTScatterPlot = CPTScatterPlot()
    redThreshLinePlot.identifier = kGreenThreshLIne
    lineStyle = redThreshLinePlot.dataLineStyle!.mutableCopy() as! CPTMutableLineStyle
    lineStyle.lineWidth = 1.0
    lineStyle.lineColor = CPTColor(componentRed: 60/255, green: 60/255, blue: 60/255, alpha: 1)
    lineStyle.dashPattern = [4, 3]
    redThreshLinePlot.dataLineStyle = lineStyle
    redThreshLinePlot.dataSource = self
    graph!.addPlot(redThreshLinePlot)
    
    // Auto scale the plot space to fit the plot data
    // Extend the ranges by 30% for neatness
    //  NOTE: this adds some margin of display beyond the displayed data range
    
    plotSpace!.scaleToFitPlots([dataSourceLinePlot!])

    /*
    let xRange: CPTMutablePlotRange = plotSpace!.xRange.mutableCopy() as! CPTMutablePlotRange
    let yRange: CPTMutablePlotRange = plotSpace!.yRange.mutableCopy() as! CPTMutablePlotRange
    xRange.expandRangeByFactor(1.0)
    yRange.expandRangeByFactor(1.0)
    plotSpace!.xRange = xRange
    plotSpace!.yRange = yRange
    */
    
    // Restrict x,y range to a global range  (NOTE: maximum y value range!)
    
    // locations => start value of x and y
    let locationX = 0.0
    /*
    let yMax = findMaxY(dataArray)
    if yMax == 0 {
      locationY = 0.0
    }
    */
    var maxX:Double = 0.0
    for item in plotData {
      if item["x"] > maxX {
        maxX = item["x"]!
      }
    }
    
    // var yLocLen:Dictionary<String, Double> = findYLocationAndLength()

    let xRange: CPTPlotRange = CPTPlotRange(location: locationX, length: Double(maxX) + (-locationX))
    let yRange: CPTPlotRange = CPTPlotRange(location: yScale[0], length: yScale[1])
    // plotSpace!.globalXRange = globalXRange
    // plotSpace!.globalYRange = globalYRange
    
    plotSpace!.xRange = xRange
    plotSpace!.yRange = yRange
    
    
    // Add plot symbols  (markers)
    
    /*
    let symbolLineStyle: CPTMutableLineStyle = CPTMutableLineStyle()
    symbolLineStyle.lineColor = CPTColor.blackColor()
    let plotSymbol: CPTPlotSymbol = CPTPlotSymbol.ellipsePlotSymbol()
    plotSymbol.fill = CPTFill(color: CPTColor.blueColor())
    plotSymbol.lineStyle = symbolLineStyle
    plotSymbol.size = CGSizeMake(7.0, 7.0)
    dataSourceLinePlot.plotSymbol = plotSymbol
    
    
    // Set plot delegate, to know when symbols have been touched
    // We will display an annotation when a symbol is touched
    dataSourceLinePlot.delegate = self
    dataSourceLinePlot.plotSymbolMarginForHitDetection = 5.0
    
    */
    // Add legend
    /*  No legend for now
    graph.legend = CPTLegend(graph: graph)
    graph.legend!.textStyle = x.labelTextStyle
    graph.legend!.fill = CPTFill(color: CPTColor.clearColor())
    // graph.legend!.borderLineStyle = x.axisLineStyle
    // graph.legend!.cornerRadius = 5.0
    graph.legendAnchor = CPTRectAnchor.TopRight
    graph.legendDisplacement = CGPointMake(0.0, 0.0)  // x.y displacement from the graph boundary
    */
    
    graphView.hostedGraph = graph
    
  }
  
  func numberOfRecordsForPlot(plot: CPTPlot) -> UInt {
    // return the number of record for a plot
    let identifier:String = plot.identifier as! String
    if (identifier == kDataLine ) {
      return UInt(plotData.count)
    } else {
      return 2
    }
  }
  
  func numberForPlot(plot: CPTPlot, field fieldEnum: UInt, recordIndex idx: UInt) -> AnyObject? {
    let identifier:String = plot.identifier as! String
    let key: String = (fieldEnum == UInt(CPTScatterPlotField.X.rawValue) ? "x" : "y")
    var num: Double = 0.0

    if (identifier == kDataLine ) {
    
      // let dataOut = index as (UnsafeMutablePointer<Int8>,Int32) // cast the C pointer to Swift pointer
      // let original:Int = idx as Int
      let i:Double = Double(idx)
      for item in plotData {
        // make sure we get the correct x value
        if item["x"] == i {
          num = Double(item[key]!)
        }
      }
      // let num: Int = Int(plotData[i][key]!)
    } else {
      switch(key) {
        case "x":
          switch ( idx % 2 ) {
            case 0:
              num = 0.0
              break
            case 1:
              num = (Double)(plotData.count - 1)
              break
            default:
              break
          }
          break
        case "y":
          num = _greenThreshold;
          break
        default:
          break
      }
    }
    return num
    
  }
  /*
  func scatterPlot(plot: CPTScatterPlot, plotSymbolWasSelectedAtRecordIndex index: UInt) {
  if annotation != nil {
  graph.plotAreaFrame!.plotArea!.removeAnnotation(annotation)
  annotation = nil
  }
  let hitAnnotationTextStyle: CPTMutableTextStyle = CPTMutableTextStyle()
  hitAnnotationTextStyle.color = CPTColor.redColor()
  hitAnnotationTextStyle.fontSize = 11.0
  hitAnnotationTextStyle.fontName = "Helvetica-Bold"
  var dataPoint: [NSObject : AnyObject] = plotData[Int(index)]
  let x: Int = dataPoint["x"] as! Int
  let y: Int = dataPoint["y"] as! Int
  let anchorPoint: [AnyObject] = [x, y]
  let formatter: NSNumberFormatter = NSNumberFormatter()
  // formatter.setMaximumFractionDigits(2)
  formatter.maximumFractionDigits = 0
  let xString: String = dateArray[x]!  // get the date string
  let yString: String = formatter.stringFromNumber(y)!
  let annoString = "(" + xString + ", " + yString + ")"
  let defaultSpace: CPTPlotSpace = graph.defaultPlotSpace!
  if graph.defaultPlotSpace != nil {
  let textLayer: CPTTextLayer = CPTTextLayer(text: annoString, style: hitAnnotationTextStyle)
  // annotation = CPTPlotSpaceAnnotation(plotSpace: defaultSpace, anchorPlotPoint: anchorPoint)
  annotation = CPTPlotSpaceAnnotation(plotSpace: defaultSpace, anchorPlotPoint: anchorPoint as? [NSNumber])
  annotation!.contentLayer = textLayer
  annotation!.displacement = CGPointMake(0.0, 10.0)
  // self.symbolTextAnnotation = annotation
  graph.plotAreaFrame!.plotArea!.addAnnotation(annotation)
  }
  }
  func scatterPlotDataLineWasSelected(plot: CPTScatterPlot) {
  // print("scatterPlotDataLineWasSelected: \(plot)")
  }
  
  func scatterPlotDataLineTouchDown(plot: CPTScatterPlot) {
  // print("scatterPlotDataLineTouchDown: \(plot)")
  }
  
  func scatterPlotDataLineTouchUp(plot: CPTScatterPlot) {
  // print("scatterPlotDataLineTouchUp: \(plot)")
  }
  
  func plotAreaWasSelected(plotArea: CPTPlotArea) {
  if annotation != nil {
  graph.plotAreaFrame!.plotArea!.removeAnnotation(annotation)
  annotation = nil
  }
  /*
  else {
  var interpolation: CPTScatterPlotInterpolation = CPTScatterPlotInterpolation.Histogram
  if self.histogramOption.rawValue < 0 {
  interpolation = CPTScatterPlotInterpolation.Linear
  self.histogramOption = CPTScatterPlotHistogramOption.OptionCount
  }
  let dataSourceLinePlot: CPTScatterPlot = graph.plotWithIdentifier("Data Source Plot") as! CPTScatterPlot
  dataSourceLinePlot.interpolation = interpolation
  dataSourceLinePlot.histogramOption = self.histogramOption
  }
  */
  }
  */
  
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
    print("ERR: SparklineView - memory wwarning")
  }
  
}

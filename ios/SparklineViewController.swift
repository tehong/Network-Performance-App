//
//  SparklineViewController.swift
//  ShowMi
//
//  Created by Eric Hong on 9/16/15.
//  Copyright © 2015 3Ten8. All rights reserved.
//

import UIKit
import CorePlot


class SparklineViewController: UIViewController, CPTPlotAreaDelegate, CPTPlotSpaceDelegate, CPTPlotDataSource, CPTScatterPlotDelegate {

    // var annotation = CPTPlotSpaceAnnotation?()
    var histogramOption = CPTScatterPlotHistogramOption.SkipSecond
    var graph:CPTXYGraph?
    var plotSpace:CPTXYPlotSpace?
    var dataSourceLinePlot:CPTScatterPlot?
    var plotData = [[String:Float]]()
    var dateArray = Dictionary<Int, String>()
    let cptPrimeColor = CPTColor(componentRed: 43/255, green: 136/255, blue: 184/255, alpha: 1)


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

    func findMaxY(dataArray:[(String, Int)]) -> Int {
        var maxY = 0
        for item in dataArray {
            if item.1 > maxY {
                maxY = item.1
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
            let xValue = (item[0] as! NSString).floatValue
            let yValue = (item[1] as! Float)
            // print(xValue)
            // print(yValue)
            plotData.append(["x":xValue, "y":yValue])
            // let dateStr:NSString = NSString(string: item.0).substringFromIndex(5)
            let dateStr:NSString = NSString(string: String(xValue)).substringFromIndex(0)

            dateArray[i] = dateStr as String
            i--
        }
        print(plotData)
        // print(dateArray)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    func plot(dataArray:[[AnyObject]], graphView:CPTGraphHostingView)
    {
        reset()
        let bounds:CGRect = graphView.bounds
        graph!.frame = bounds

        // some paddings on all sides
        graph!.paddingBottom = 5
        graph!.paddingLeft = 5
        graph!.paddingRight = 5
        graph!.paddingTop = 5

        generateData(dataArray)

        // create graph
        graph!.plotAreaFrame!.plotArea!.delegate = self


        // graph.plotAreaFrame?.plotArea?.frame = bounds
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

        // Create a plot that uses the data source method

        dataSourceLinePlot = CPTScatterPlot()
        // dataSourceLinePlot.identifier = yLabel
        let lineStyle: CPTMutableLineStyle = dataSourceLinePlot!.dataLineStyle!.mutableCopy() as! CPTMutableLineStyle
        lineStyle.lineWidth = 1.0
        // lineStyle.lineColor = CPTColor.orangeColor()
        lineStyle.lineColor = CPTColor.whiteColor() // cptPrimeColor
        dataSourceLinePlot!.dataLineStyle = lineStyle
        dataSourceLinePlot!.histogramOption = self.histogramOption
        dataSourceLinePlot!.dataSource = self

        // Auto scale the plot space to fit the plot data
        // Extend the ranges by 30% for neatness
        //  NOTE: this adds some margin of display beyond the displayed data range
        graph!.addPlot(dataSourceLinePlot)
        plotSpace!.scaleToFitPlots([dataSourceLinePlot!])

        let xRange: CPTMutablePlotRange = plotSpace!.xRange.mutableCopy() as! CPTMutablePlotRange
        let yRange: CPTMutablePlotRange = plotSpace!.yRange.mutableCopy() as! CPTMutablePlotRange
        xRange.expandRangeByFactor(1.0)
        yRange.expandRangeByFactor(1.0)
        plotSpace!.xRange = xRange
        plotSpace!.yRange = yRange

        // Restrict x,y range to a global range  (NOTE: maxium y value range!)
/*
        var locationX = -(Double(plotData.count)) * 0.14
        var locationY = -(Double(plotData.count)) * 0.05
        // var locationX = -3.0
        // var locationY = -0.3
        let yMax = findMaxY(dataArray)
        if yMax == 0 {
            locationX = 0.0
            locationY = 0.0
        }
        var maxX = 0
        var maxY = 0
        for item in plotData {
            if item["x"] > maxX {
                maxX = item["x"]!
            }
            if item["y"] > maxY {
                maxY = item["y"]!
            }
        }
        let globalXRange: CPTPlotRange = CPTPlotRange(location: locationX, length: Double(maxX)*1.1 + (-locationX))
        let globalYRange: CPTPlotRange = CPTPlotRange(location: locationY, length: Double(maxY)*1.1 + (-locationY))
        plotSpace.globalXRange = globalXRange
        plotSpace.globalYRange = globalYRange
*/

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
        // return 4
        return UInt(plotData.count)
    }

    func numberForPlot(plot: CPTPlot, field fieldEnum: UInt, recordIndex idx: UInt) -> AnyObject? {
        let key: String = (fieldEnum == UInt(CPTScatterPlotField.X.rawValue) ? "x" : "y")

        // let dataOut = index as (UnsafeMutablePointer<Int8>,Int32) // cast the C pointer to Swift pointer
        // let original:Int = idx as Int
        let i:Float = Float(idx)
        var num: Float = 0.0
        for item in plotData {
          // make sure we get the correct x value
          if item["x"] == i {
            num = Float(item[key]!)
          }
        }
        // let num: Int = Int(plotData[i][key]!)
        return num

        // return i + 1
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

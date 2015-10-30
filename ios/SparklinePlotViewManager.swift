//
//  SparklinePlotManager.swift
//  RNiOSCorePlotExample
//
//  Created by Eric Hong on 10/29/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

import UIKit
import CorePlot



@objc(SparklinePlotViewManager)
class SparklinePlotViewManager: RCTViewManager {

  // RCT_EXPORT_MODULE()
  
  let dataArray = [("1", 96), ("2", 97), ("3",99), ("4",100), ("5",95), ("6", 97), ("7", 99), ("8", 94), ("9", 90), ("10", 100), ("11", 80), ("12", 99), ("13", 97)]
  
  @objc override func view() -> UIView
  {
    let viewContainter:UIView = UIView()
    let sparklineView: CPTGraphHostingView = CPTGraphHostingView()
    let sparklineController:SparklineViewController = SparklineViewController()

    viewContainter.userInteractionEnabled = false;
    sparklineView.userInteractionEnabled = false;
    
    // let viewController: ViewController = ViewController();
    // viewController.viewDidLoad();
    
    
    // need to turn this off before adding layout constraint
    sparklineView.translatesAutoresizingMaskIntoConstraints = false
    
    // sparklineView.backgroundColor = UIColor.redColor()
    
    viewContainter.addSubview(sparklineView);

    
    /*
    // make dictionary for views
    let viewsDictionary = ["sparklineView":sparklineView]
    
    let view1_constraint_H = NSLayoutConstraint.constraintsWithVisualFormat(
      "H:[sparklineView(>=350)]",
      options: NSLayoutFormatOptions(rawValue: 0),
      metrics: nil, views: viewsDictionary)
    let view1_constraint_V = NSLayoutConstraint.constraintsWithVisualFormat(
      "V:[sparklineView(>=500)]",
      options: NSLayoutFormatOptions(rawValue:0),
      metrics: nil, views: viewsDictionary)
    
    sparklineView.addConstraints(view1_constraint_H)
    sparklineView.addConstraints(view1_constraint_V)
    */
    
    
    // Now make the sparklineView stretch to the viewContainer
    let leftConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Left,
      relatedBy:NSLayoutRelation.Equal,
      toItem:viewContainter,
      attribute:NSLayoutAttribute.Left,
      multiplier:1.0,
      constant:0)
    
    let topConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Top,
      relatedBy:NSLayoutRelation.Equal,
      toItem:viewContainter,
      attribute:NSLayoutAttribute.Top,
      multiplier:1.0,
      constant:0)
    
    let rightConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Right,
      relatedBy:NSLayoutRelation.Equal,
      toItem:viewContainter,
      attribute:NSLayoutAttribute.Right,
      multiplier:1.0,
      constant:0)
    
    let bottomConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Bottom,
      relatedBy:NSLayoutRelation.Equal,
      toItem:viewContainter,
      attribute:NSLayoutAttribute.Bottom,
      multiplier:1.0,
      constant:0)
        
    // IMPORTANT - always add contraints to the top view or the referenced view not the new view!
    viewContainter.addConstraint(leftConstraint)
    viewContainter.addConstraint(topConstraint)
    viewContainter.addConstraint(rightConstraint)
    viewContainter.addConstraint(bottomConstraint)


    sparklineController.plot(dataArray, graphView: sparklineView)

    
    return viewContainter;
  }
}

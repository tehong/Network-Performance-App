//
//  SparklineView.swift
//  MiKPI
//
//  Created by Eric Hong on 11/9/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

import UIKit
import CorePlot

class SparklineView: UIView {

  // let dataDictionary = ["0":96, "1":97, "2":99, "3":100, "4":95, "5":97, "6":99, "7":94, "8":90, "9":100, "10":80, "11":99, "12":97]

  var _threshold:Float = 0.0
  var _isPlot:Bool = false
  var _dataArray = [(String, Int)]()
    /*
    // Only override drawRect: if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func drawRect(rect: CGRect) {
        // Drawing code
    }
    */
  func setRedThreshold(value:Float) {
    _threshold = value
  }
  
  // !!! Encountered "unrecognized selector sent to instance" error due to that RN Obj-c code expects NSArray but Swift is only NSArray, thus using
  //    Obj-c code instead
  func setDataArray(dataArray: [[AnyObject]]) {
    print(dataArray)
    let sparklineView: CPTGraphHostingView = CPTGraphHostingView()
    let sparklineController:SparklineViewController = SparklineViewController()
    
    self.userInteractionEnabled = false;
    sparklineView.userInteractionEnabled = false;
    
    // let viewController: ViewController = ViewController();
    // viewController.viewDidLoad();
    
    
    // need to turn this off before adding layout constraint
    sparklineView.translatesAutoresizingMaskIntoConstraints = false
    
    // sparklineView.backgroundColor = UIColor.redColor()
    
    self.addSubview(sparklineView);
    
    
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
      toItem:self,
      attribute:NSLayoutAttribute.Left,
      multiplier:1.0,
      constant:0)
    
    let topConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Top,
      relatedBy:NSLayoutRelation.Equal,
      toItem:self,
      attribute:NSLayoutAttribute.Top,
      multiplier:1.0,
      constant:0)
    
    let rightConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Right,
      relatedBy:NSLayoutRelation.Equal,
      toItem:self,
      attribute:NSLayoutAttribute.Right,
      multiplier:1.0,
      constant:0)
    
    let bottomConstraint = NSLayoutConstraint(item:sparklineView,
      attribute:NSLayoutAttribute.Bottom,
      relatedBy:NSLayoutRelation.Equal,
      toItem:self,
      attribute:NSLayoutAttribute.Bottom,
      multiplier:1.0,
      constant:0)
    
    // IMPORTANT - always add contraints to the top view or the referenced view not the new view!
    self.addConstraint(leftConstraint)
    self.addConstraint(topConstraint)
    self.addConstraint(rightConstraint)
    self.addConstraint(bottomConstraint)
    
    sparklineController.plot(dataArray, graphView: sparklineView)

  }
  
  func setPlot(value:Bool) {
    _isPlot = value
    
  }
}

//
//  SparklinePlotManager.swift
//  RNiOSCorePlotExample
//
//  Created by Eric Hong on 10/29/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

import UIKit
import CorePlot
// import SparklineView


@objc(SparklineViewManager)
class SparklineViewManager: RCTViewManager {

  
  override func view() -> UIView
  {
    let viewContainter:SparklineView = SparklineView()
    return viewContainter;
  }
}

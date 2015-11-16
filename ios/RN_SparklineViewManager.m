//
//  RNiOSCorePlotExampleBridge.m
//  RNiOSCorePlotExample
//
//  Created by Eric Hong on 10/29/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "MiKPI-Bridging-Header.h"

@interface RCT_EXTERN_MODULE(SparklineViewManager, RCTViewManager)

// RCT_EXTERN_METHOD(view:(float *) threashold)

RCT_EXTERN_METHOD(view)

RCT_EXPORT_VIEW_PROPERTY(redThreshold, float)
// RCT_EXPORT_VIEW_PROPERTY(plot, BOOL)
RCT_EXPORT_VIEW_PROPERTY(dataArray, NSArrayArray)

@end

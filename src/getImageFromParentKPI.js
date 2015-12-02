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

function getImageFromParentKPI(category: string, kpi: string): string {
  var cat = category.toLowerCase();
  switch(kpi.toLowerCase()) {
    case "accessibility":
      var kpiImage = "Icon_DA";
      if (cat === "volte") {
        kpiImage = "Icon_VA";
      }
      break;
    case "retainability":
      var kpiImage = "Icon_DR";
      if (cat == "volte") {
        kpiImage = "Icon_VR";
      }
      break;
    case "throughput":
      var kpiImage = "Icon_UT";
      if (cat === "downlink") {
        kpiImage = "Icon_DT";
      }
      break;
    case "tnol":
      var kpiImage = "Icon_T";
      break;
    case "retainability":
      var kpiImage = "Icon_AV";
      break;
    case "mobility":
      var kpiImage = "Icon_MO";
      break;
    case "fallback":
      var kpiImage = "Icon_CS";
      break;
  }

  return kpiImage;
}

module.exports = getImageFromParentKPI;

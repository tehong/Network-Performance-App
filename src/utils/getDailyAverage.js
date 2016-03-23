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

function getDailyAverage(kpi: string, dailyAverage: string, kpiDecimalPrecision: int) {
  if (dailyAverage !== 'No Data' && dailyAverage !== null) {
    // treat data availability as a special case
    var newDailyAverage = dailyAverage.toString();
    var indexDecimal = newDailyAverage.indexOf('.');
    if (indexDecimal > -1 && parseFloat(dailyAverage) === 100) {
      return newDailyAverage.toString().substring(0, indexDecimal);
    }
    if (indexDecimal >= 0 && (!kpiDecimalPrecision || (kpiDecimalPrecision && kpiDecimalPrecision !== "" && kpiDecimalPrecision < 4))) {
      // if we had override kpiDecimalPrecision, use that
      if (!kpiDecimalPrecision) {
        var decimal_digits = newDailyAverage.length - indexDecimal - 1;
        var integer_digits = newDailyAverage.length - decimal_digits - 1;
        // default the numDecimalDigit to 1 unless decimal_digits is 0;
        var numDecimalDigit = 1 < decimal_digits ? 1 : decimal_digits;
        // show max three non-zero digits or at least one decimal if more than three digits
        if (integer_digits === 1) {
          if (newDailyAverage.charAt(0) === "0") {
            numDecimalDigit = 3 < decimal_digits?3:decimal_digits;
          } else {
            numDecimalDigit = 2 < decimal_digits?2:decimal_digits;
          }
        }
      } else {
        var numDecimalDigit = kpiDecimalPrecision;
      }
      // if (kpi.toLowerCase().indexOf("availability") > -1) debugger;
      var adjustedDailyAverage = (Math.round(parseFloat(dailyAverage) * Math.pow(10, numDecimalDigit)) / (Math.pow(10, numDecimalDigit))).toString();
    } else {
      adjustedDailyAverage = dailyAverage.toString();
    }
    newDailyAverage = (adjustedDailyAverage.indexOf(".") > -1 && numDecimalDigit) ?
      adjustedDailyAverage.toString().substring(0, indexDecimal + numDecimalDigit + 1) :
      adjustedDailyAverage;
    // newDailyAverage = parseFloat(newDailyAverage);
    return newDailyAverage;
  }
  if (dailyAverage === null) {
    dailyAverage = "No Data";
  }
  return dailyAverage;
}

module.exports = getDailyAverage;

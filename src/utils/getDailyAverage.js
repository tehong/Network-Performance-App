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

function getDailyAverage(dailyAverage: string) {
  if (dailyAverage !== 'No Data' && dailyAverage !== null) {
    var newDailyAverage = dailyAverage.toString();
    // Limit the number of total digits to 3 non-leading-zero digits
    var indexDecimal = newDailyAverage.indexOf('.');
    if (indexDecimal >= 0) {
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
      newDailyAverage = newDailyAverage.substring(0, indexDecimal + numDecimalDigit + 1)
    }
    newDailyAverage = parseFloat(newDailyAverage);
    return newDailyAverage;
  }
  if (dailyAverage === null) {
    dailyAverage = "No Data";
  }
  return dailyAverage;
}

module.exports = getDailyAverage;

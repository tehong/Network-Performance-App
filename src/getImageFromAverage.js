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

function getImageFromAverage(dailyAverage: number, redThreshold: number,
  greenThreshold: number): string {
  var backgroundImage = "BG_Yellow_KPI_Item";
  if(redThreshold < greenThreshold) {
    if (dailyAverage <= redThreshold) {
      // red
      backgroundImage = "BG_Red_KPI_Item";
    } else if (dailyAverage >= greenThreshold) {
      // green
      backgroundImage = "BG_Green_KPI_Item";
    }
  } else {
    if (dailyAverage <= greenThreshold) {
      // green
      backgroundImage = "BG_Green_KPI_Item";
    } else if (dailyAverage >= redThreshold) {
      // red
      backgroundImage = "BG_Red_KPI_Item";
    }
  }
  return backgroundImage;
}

module.exports = getImageFromAverage;

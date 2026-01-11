/* global describe, it */

const assert = require('assert'),
  path = require('path'),
  Bundle = require('../../lib/package/Bundle.js'),
  bl = require('../../lib/package/bundleLinter.js');

var pluginPath = path.resolve(__dirname, '../../rules/PS-BN001-MandatoryPolicy.js');
var ruleId = "PS-BN001";
describe('PS-BN001 MandatoryPolicy run on fixture bundle', function () {
  it('Policy is not attached where mandatory', function (done) {
    const bundlePath = path.resolve(__dirname, '../fixtures/resources/PS-BN001-MandatoryPolicy-Failure/apiproxy');
    const configuration = {
      source: {
        type: 'filesystem',
        path: bundlePath,
        bundleType: 'apiproxy'
      },
      profile: 'apigeex',
      debug: true,
      excluded: {},
      setExitCode: false,
      output: () => { } // suppress output
    };
    var bundle = new Bundle(configuration);
    bl.executePlugin(pluginPath, bundle);
    var report = getReportByRuleId(ruleId, bundle.getReport());
    assert.equal(report[0].message, 'Policy "QA-checkQuota" of type "Quota" is not attached to required flow ProxyEndpoint:PreFlow:Response');
    assert.equal(report[0].severity, 2);
    done();
  });
});
function getReportByRuleId(ruleId, bundleReport) {
  var jsimple = bl.getFormatter('json.js');
  // console.log("getReportByRuleId:", jsimple(bundleReport));
  const jsonReport = JSON.parse(jsimple(bundleReport)),
    reports = [];
  for (let r of jsonReport) {
    for (let j of r.messages) {
      if (j.ruleId === ruleId) {
        reports.push(j);
        // console.log("Found report for ruleId", ruleId, j);
      }
    }
  }
  return reports;
}

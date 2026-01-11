/*
  PS-BN001 Mandatory Policy Attachment
  Correct apigeelint implementation
*/

const ruleId = 'PS-BN001';

console.log('Loading rule:', ruleId);

const plugin = {
  ruleId,
  name: 'PS-BN001 Mandatory Policy Attachment',
  message:
    'Mandatory Policy Attachment: Check if mandatory policies are attached to required flows.',
  fatal: false,
  severity: 2,
  nodeType: 'Bundle',
  enabled: true
};

// ------------------------------------------------------------
// Load configuration
// ------------------------------------------------------------
const configProperties = require('../configProperties.json');

let rawEntries = [];
if (configProperties && configProperties[ruleId]) {
  const ruleConfig = configProperties[ruleId];

  if (ruleConfig.enabled === false) {
    plugin.enabled = false;
  }

  if (ruleConfig.config && Array.isArray(ruleConfig.config.mandatoryPoliciesAndFlow)) {
    rawEntries = ruleConfig.config.mandatoryPoliciesAndFlow.slice();
  }
}

// ------------------------------------------------------------
// Parse config
// Format:
//   Type|PolicyName|ProxyEndpoint:PreFlow:Request
// ------------------------------------------------------------
const mandatoryPolicies = rawEntries
  .map(e => {
    if (typeof e !== 'string') return null;
    const p = e.split('|');
    if (p.length < 3) return null;

    return {
      type: p[0].trim(),
      name: p[1].trim(),
      requiredFlow: p.slice(2).join('|').trim()
    };
  })
  .filter(Boolean);

console.log('Mandatory Policies configured:', mandatoryPolicies);

// ------------------------------------------------------------
// Rule logic
// ------------------------------------------------------------
const onBundle = function (bundle, cb) {
  let hasViolation = false;

  function report(msg) {
    bundle.addMessage({
      plugin,
      message: msg
    });
    hasViolation = true;
  }

  mandatoryPolicies.forEach(rule => {
    console.log(
      `Checking ${rule.type}:${rule.name} at ${rule.requiredFlow}`
    );

    let policyFound = false;
    let flowMatched = false;

    bundle.getPolicies().forEach(policy => {
      if (policy.getType() === rule.type && policy.getName() === rule.name) {
        policyFound = true;

        // 🔑 THIS IS THE CORRECT API
        policy.getSteps().forEach(step => {
          const flowName = step.getFlowName();
          console.log(
            `  Found attachment at: ${flowName}`
          );
          var flowNameValue = flowName.split('#')[1];
          var flowNameParts = "document:" + rule.requiredFlow + ":" + rule.name;
          // console.log("    Comparing flowNameValue:", flowNameValue, "with flowNameParts:", flowNameParts);
          if (flowNameValue === flowNameParts) {
            // console.log(`    -> MATCHED required flow: ${rule.requiredFlow}`);
            flowMatched = true;
          }
        });
      }
    });

    if (!policyFound) {
      report(
        `Policy "${rule.name}" of type "${rule.type}" not found`
      );
    } else if (!flowMatched) {
      report(
        `Policy "${rule.name}" of type "${rule.type}" is not attached to required flow ${rule.requiredFlow}`
      );
    } else {
      console.log(
        `  Policy "${rule.name}" of type "${rule.type}" is correctly attached to required flow ${rule.requiredFlow}`
      );
    }
  });

  if (cb) {
    cb(null, hasViolation);
  }
};

module.exports = {
  plugin,
  onBundle
};

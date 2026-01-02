/**
 * Rule-Based Diagnostic Engine
 *
 * Implements a deterministic, explainable diagnostic system that:
 * - Evaluates elimination rules first
 * - Applies scoring rules sequentially
 * - Normalizes confidence scores
 * - Returns structured diagnostic results with explanations
 */

class DiagnosticEngine {
  constructor(rules) {
    this.rules = rules;
    this.hypotheses = JSON.parse(JSON.stringify(rules.hypotheses)); // Deep copy
    this.eliminatedCauses = [];
    this.appliedRules = [];
  }

  /**
   * Main analysis method
   * @param {Object} signals - Raw diagnostic signals/data
   * @returns {Object} Structured diagnostic result
   */
  analyze(signals) {
    // Reset state
    this.hypotheses = JSON.parse(JSON.stringify(this.rules.hypotheses));
    this.eliminatedCauses = [];
    this.appliedRules = [];

    // Step 1: Apply elimination rules first
    this.applyEliminationRules(signals);

    // Step 2: Apply scoring rules
    this.applyScoringRules(signals);

    // Step 3: Normalize and calculate confidence
    const result = this.calculateResult();

    return result;
  }

  /**
   * Evaluate and apply elimination rules
   * @param {Object} signals - Input signals
   */
  applyEliminationRules(signals) {
    for (const rule of this.rules.elimination_rules) {
      if (this.evaluateConditions(rule.if, signals)) {
        // Lock eliminated hypotheses at 0
        for (const hypothesis of rule.eliminate) {
          if (this.hypotheses[hypothesis] !== undefined) {
            this.hypotheses[hypothesis].score = 0;
            this.hypotheses[hypothesis].eliminated = true;

            if (!this.eliminatedCauses.includes(hypothesis)) {
              this.eliminatedCauses.push(hypothesis);
            }
          }
        }

        this.appliedRules.push({
          id: rule.id,
          type: 'elimination',
          explanation: rule.explanation
        });
      }
    }
  }

  /**
   * Evaluate and apply scoring rules
   * @param {Object} signals - Input signals
   */
  applyScoringRules(signals) {
    for (const rule of this.rules.rules) {
      if (this.evaluateConditions(rule.if, signals)) {
        // Apply score modifications
        for (const [hypothesis, scoreChange] of Object.entries(rule.then)) {
          if (this.hypotheses[hypothesis] !== undefined) {
            // Skip if hypothesis is eliminated
            if (this.hypotheses[hypothesis].eliminated) {
              continue;
            }

            this.hypotheses[hypothesis].score += scoreChange;

            // Ensure score doesn't go negative
            if (this.hypotheses[hypothesis].score < 0) {
              this.hypotheses[hypothesis].score = 0;
            }
          }
        }

        this.appliedRules.push({
          id: rule.id,
          type: 'scoring',
          explanation: rule.explanation,
          scores: rule.then
        });
      }
    }
  }

  /**
   * Evaluate rule conditions against signals
   * @param {Object} conditions - Rule conditions
   * @param {Object} signals - Input signals
   * @returns {boolean} Whether conditions are met
   */
  evaluateConditions(conditions, signals) {
    for (const [key, condition] of Object.entries(conditions)) {
      const signalValue = signals[key];

      // Handle missing signals
      if (signalValue === undefined || signalValue === null) {
        return false;
      }

      // Handle direct value comparison (string, boolean)
      if (typeof condition === 'string' || typeof condition === 'boolean' || typeof condition === 'number') {
        if (signalValue !== condition) {
          return false;
        }
      }
      // Handle operator-based comparison
      else if (typeof condition === 'object') {
        if (!this.evaluateOperators(signalValue, condition)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate operator-based conditions
   * @param {*} value - Signal value
   * @param {Object} operators - Operator conditions
   * @returns {boolean} Whether all operators are satisfied
   */
  evaluateOperators(value, operators) {
    for (const [operator, threshold] of Object.entries(operators)) {
      switch (operator) {
        case '>':
          if (!(value > threshold)) return false;
          break;
        case '>=':
          if (!(value >= threshold)) return false;
          break;
        case '<':
          if (!(value < threshold)) return false;
          break;
        case '<=':
          if (!(value <= threshold)) return false;
          break;
        case '==':
          if (value != threshold) return false;
          break;
        case '!=':
          if (value == threshold) return false;
          break;
        default:
          console.warn(`Unknown operator: ${operator}`);
          return false;
      }
    }

    return true;
  }

  /**
   * Calculate final result with normalized confidence
   * @returns {Object} Diagnostic result
   */
  calculateResult() {
    // Filter out eliminated hypotheses
    const activeHypotheses = Object.entries(this.hypotheses)
      .filter(([_, data]) => !data.eliminated)
      .map(([name, data]) => ({ name, score: data.score }));

    // Calculate total score
    const totalScore = activeHypotheses.reduce((sum, h) => sum + h.score, 0);

    // If no positive scores, return low confidence result
    if (totalScore === 0) {
      return {
        primary_cause: 'unknown',
        confidence_percent: 0,
        confidence_level: 'Low',
        evidence: this.appliedRules
          .filter(r => r.type === 'scoring')
          .map(r => r.explanation),
        eliminated_causes: this.eliminatedCauses,
        next_steps: ['Collect more diagnostic data', 'Run additional tests'],
        all_scores: this.hypotheses,
        applied_rules: this.appliedRules
      };
    }

    // Normalize scores to percentages
    const normalizedHypotheses = activeHypotheses.map(h => ({
      name: h.name,
      score: h.score,
      confidence_percent: Math.round((h.score / totalScore) * 100)
    }));

    // Sort by confidence
    normalizedHypotheses.sort((a, b) => b.confidence_percent - a.confidence_percent);

    // Get primary cause (highest confidence)
    const primaryCause = normalizedHypotheses[0];

    // Determine confidence level
    let confidenceLevel;
    if (primaryCause.confidence_percent >= 65) {
      confidenceLevel = 'High';
    } else if (primaryCause.confidence_percent >= 40) {
      confidenceLevel = 'Medium';
    } else {
      confidenceLevel = 'Low';
    }

    // Generate evidence from applied rules
    const evidence = this.appliedRules
      .filter(r => r.type === 'scoring')
      .map(r => r.explanation);

    // Get next steps for primary cause
    const nextSteps = this.rules.next_steps[primaryCause.name] || [
      'Review system logs',
      'Run additional diagnostics',
      'Contact support if issue persists'
    ];

    return {
      primary_cause: primaryCause.name,
      confidence_percent: primaryCause.confidence_percent,
      confidence_level: confidenceLevel,
      raw_score: primaryCause.score,
      evidence: evidence,
      eliminated_causes: this.eliminatedCauses,
      next_steps: nextSteps,
      all_hypotheses: normalizedHypotheses,
      all_scores: this.hypotheses,
      applied_rules: this.appliedRules
    };
  }

  /**
   * Get human-readable explanation of the analysis
   * @param {Object} result - Analysis result
   * @returns {string} Formatted explanation
   */
  getExplanation(result) {
    let explanation = `Primary Diagnosis: ${this.formatCauseName(result.primary_cause)}\n`;
    explanation += `Confidence: ${result.confidence_percent}% (${result.confidence_level})\n\n`;

    if (result.eliminated_causes.length > 0) {
      explanation += `Ruled Out: ${result.eliminated_causes.map(c => this.formatCauseName(c)).join(', ')}\n\n`;
    }

    explanation += `Evidence:\n`;
    result.evidence.forEach((e, i) => {
      explanation += `  ${i + 1}. ${e}\n`;
    });

    explanation += `\nRecommended Next Steps:\n`;
    result.next_steps.forEach((step, i) => {
      explanation += `  ${i + 1}. ${step}\n`;
    });

    return explanation;
  }

  /**
   * Format cause name for display
   * @param {string} cause - Cause identifier
   * @returns {string} Formatted name
   */
  formatCauseName(cause) {
    const names = {
      dns: 'DNS Resolution',
      network: 'Network Latency',
      disk: 'Disk I/O',
      cpu: 'CPU Usage',
      memory: 'Memory Pressure',
      application: 'Application Layer',
      vpn: 'VPN Overhead',
      bandwidth: 'Bandwidth Limitation',
      unknown: 'Insufficient Data'
    };

    return names[cause] || cause;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagnosticEngine;
}

# AI Prediction Feedback Learning System

## Overview

The prediction feedback system enables the AI sentiment analyzer to learn from its past predictions by comparing predicted sentiment with actual price movements. This creates a continuous improvement loop where the AI becomes more accurate over time.

## How It Works

### 1. **Prediction Tracking**
- When news articles are analyzed, the AI makes predictions about future price movements (1-7 days ahead)
- Predictions include:
  - **Direction**: UP, DOWN, or NEUTRAL
  - **Strength**: 0-100 (how impactful the news is expected to be)

### 2. **Feedback Evaluation**
- Daily, the system evaluates predictions from 1-7 days ago
- Compares predicted sentiment with actual price movements
- Calculates accuracy metrics:
  - **Full accuracy**: Was the prediction correct (direction + magnitude)?
  - **Direction accuracy**: Did the direction match?
  - **Strength accuracy**: How well did strength predict magnitude?

### 3. **Learning Integration**
- Historical accuracy data is included in AI prompts
- The AI sees:
  - Overall accuracy statistics
  - Accuracy by sentiment type (UP/DOWN/NEUTRAL)
  - Lessons learned from past mistakes
  - Recommendations for improvement

### 4. **Continuous Improvement**
- As more predictions are evaluated, the system builds a knowledge base
- The AI learns which types of predictions tend to be more/less accurate
- Predictions improve over time as the AI adapts

## Database Schema

### `prediction_feedback` Table

Stores feedback on prediction accuracy:

```sql
- id: UUID (primary key)
- news_id: TEXT (references news table)
- predicted_sentiment: TEXT ('up', 'down', 'neutral')
- predicted_strength: INTEGER (0-100)
- prediction_timestamp: TIMESTAMPTZ
- actual_price_at_prediction: REAL
- actual_price_after_1d: REAL
- actual_price_after_3d: REAL
- actual_price_after_7d: REAL
- price_change_1d: REAL (%)
- price_change_3d: REAL (%)
- price_change_7d: REAL (%)
- was_correct_1d: BOOLEAN
- was_correct_3d: BOOLEAN
- was_correct_7d: BOOLEAN
- direction_correct_1d: BOOLEAN
- direction_correct_3d: BOOLEAN
- direction_correct_7d: BOOLEAN
- strength_accuracy_score: REAL (0-100)
- evaluated_at: TIMESTAMPTZ
```

## Setup Instructions

### 1. Run Database Migration

Run the migration in Supabase SQL Editor:

```sql
-- File: supabase_migrations/add_prediction_feedback.sql
```

This creates the `prediction_feedback` table with all necessary indexes.

### 2. Automatic Evaluation

The system automatically evaluates predictions daily at 2 AM. No manual intervention needed!

The scheduler (`backend/scheduler-supabase.js`) includes:
- Daily evaluation job
- Automatic feedback calculation
- Integration with AI sentiment analyzer

### 3. Manual Evaluation (Optional)

You can manually trigger evaluation:

```javascript
import { evaluatePredictions } from './backend/predictionFeedback.js';

await evaluatePredictions();
```

## Usage

### View Accuracy Statistics

```javascript
import { getAccuracyStats, getLessonsLearned } from './backend/predictionFeedback.js';

// Get accuracy stats for last 30 days
const stats = await getAccuracyStats(30);
console.log(`Accuracy: ${stats.accuracy_7d}%`);
console.log(`Direction accuracy: ${stats.direction_accuracy_7d}%`);

// Get lessons learned
const lessons = await getLessonsLearned();
console.log(lessons.insights);
console.log(lessons.recommendations);
```

### Query Feedback Data

```sql
-- View recent feedback
SELECT 
  n.title,
  pf.predicted_sentiment,
  pf.predicted_strength,
  pf.price_change_7d,
  pf.was_correct_7d,
  pf.direction_correct_7d
FROM prediction_feedback pf
JOIN news n ON pf.news_id = n.id
ORDER BY pf.evaluated_at DESC
LIMIT 20;

-- Overall accuracy
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN was_correct_7d = true THEN 1 ELSE 0 END) as correct,
  ROUND(100.0 * SUM(CASE WHEN was_correct_7d = true THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_pct
FROM prediction_feedback
WHERE was_correct_7d IS NOT NULL;

-- Accuracy by sentiment type
SELECT 
  predicted_sentiment,
  COUNT(*) as total,
  SUM(CASE WHEN was_correct_7d = true THEN 1 ELSE 0 END) as correct,
  ROUND(100.0 * SUM(CASE WHEN was_correct_7d = true THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_pct
FROM prediction_feedback
WHERE was_correct_7d IS NOT NULL
GROUP BY predicted_sentiment;
```

## How the AI Uses Feedback

The AI sentiment analyzer (`backend/sentimentAnalyzer.js`) automatically includes historical accuracy context in its prompts:

```
LEARNING FROM PAST PREDICTIONS - USE THIS TO IMPROVE ACCURACY:
- Overall accuracy: 65.2% over 7 days
- Direction accuracy: 72.1% (predicting direction is 6.9% more accurate than full predictions)
- Key insights: UP predictions: 68.5% accurate; DOWN predictions: 61.2% accurate
- Recommendations: DOWN predictions have low accuracy (61.2%). Review examples to understand why.
```

The AI uses this information to:
- Adjust prediction confidence
- Learn which types of news are harder to predict
- Improve strength calibration
- Avoid repeating past mistakes

## Accuracy Metrics Explained

### Full Accuracy (`was_correct_7d`)
- **True**: Prediction matched actual outcome
  - Predicted UP and price went up (>0.1%)
  - Predicted DOWN and price went down (<-0.1%)
  - Predicted NEUTRAL and price stayed stable (-0.5% to +0.5%)
- **False**: Prediction didn't match

### Direction Accuracy (`direction_correct_7d`)
- **True**: Direction matched (ignoring magnitude)
  - Predicted UP and price went up (any amount)
  - Predicted DOWN and price went down (any amount)
- **False**: Direction didn't match

### Strength Accuracy (`strength_accuracy_score`)
- Score 0-100 indicating how well predicted strength matched actual magnitude
- 100 = perfect match
- Higher scores mean the AI is better at predicting how impactful news will be

## Benefits

1. **Continuous Improvement**: AI gets smarter over time
2. **Transparency**: Track prediction accuracy
3. **Adaptation**: AI learns from mistakes
4. **Better Calibration**: Strength predictions become more accurate
5. **Data-Driven**: Decisions based on actual performance

## Monitoring

### Check Evaluation Status

```sql
-- See how many predictions are waiting to be evaluated
SELECT COUNT(*) 
FROM news 
WHERE published_at >= NOW() - INTERVAL '7 days'
  AND published_at <= NOW() - INTERVAL '1 day'
  AND sentiment != 'neutral'
  AND sentiment_strength IS NOT NULL
  AND id NOT IN (SELECT news_id FROM prediction_feedback);
```

### View Recent Evaluations

```sql
SELECT 
  COUNT(*) as evaluations_today,
  AVG(CASE WHEN was_correct_7d = true THEN 1.0 ELSE 0.0 END) * 100 as accuracy
FROM prediction_feedback
WHERE evaluated_at >= CURRENT_DATE;
```

## Troubleshooting

### No Predictions Being Evaluated

**Possible causes:**
- Not enough time has passed (need 1-7 days after prediction)
- All predictions are NEUTRAL (neutral predictions aren't evaluated)
- Missing price data for evaluation period

**Solution:**
- Wait for more predictions to age
- Check that price data exists for the evaluation period
- Verify news articles have sentiment_strength values

### Low Accuracy

**If accuracy is below 50%:**
- Review specific examples to understand patterns
- Check if certain news sources are less reliable
- Consider adjusting prediction thresholds
- Review if market conditions have changed

### Missing Feedback Data

**If feedback table is empty:**
- Check that migration was run successfully
- Verify scheduler is running
- Check logs for evaluation errors
- Manually trigger evaluation to test

## Future Enhancements

Potential improvements:
1. **Source-specific accuracy**: Track accuracy by news source
2. **Time-based patterns**: Learn if predictions are more accurate at certain times
3. **News category accuracy**: Track accuracy by news category
4. **Automated prompt tuning**: Automatically adjust prompts based on accuracy
5. **User feedback integration**: Allow users to rate predictions
6. **Advanced ML models**: Use feedback data to train custom models

## Files Created/Modified

1. **`supabase_migrations/add_prediction_feedback.sql`** - Database schema
2. **`backend/predictionFeedback.js`** - Evaluation logic and statistics
3. **`backend/sentimentAnalyzer.js`** - Enhanced with accuracy context
4. **`backend/scheduler-supabase.js`** - Added daily evaluation job

## Cost Considerations

- **Database storage**: Minimal (one row per prediction)
- **Evaluation computation**: Very low (runs once daily)
- **AI prompt enhancement**: Slightly longer prompts, but same API cost
- **Overall impact**: Negligible cost increase, significant accuracy improvement

---

**Status**: ✅ Fully Implemented and Ready to Use

The system will start learning as soon as:
1. Migration is run
2. Predictions start being made (already happening)
3. 1-7 days pass for initial evaluations

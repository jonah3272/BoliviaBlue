import { supabase } from './db-supabase.js';
import { getRatesInRange, getLatestRate } from './db-supabase.js';

/**
 * Evaluate prediction accuracy by comparing predicted sentiment with actual price movements
 * This function should be called daily to evaluate predictions from 1-7 days ago
 */
export async function evaluatePredictions() {
  console.log('🔍 Starting prediction accuracy evaluation...');
  
  if (!supabase) {
    console.warn('⚠️  Supabase client not available, skipping prediction evaluation');
    return;
  }

  try {
    // Get news articles from 1-7 days ago that have sentiment predictions but haven't been evaluated yet
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Find news articles with predictions that need evaluation
    const { data: newsToEvaluate, error: newsError } = await supabase
      .from('news')
      .select('id, published_at, sentiment, sentiment_strength')
      .gte('published_at', sevenDaysAgo.toISOString())
      .lte('published_at', oneDayAgo.toISOString())
      .not('sentiment', 'eq', 'neutral')
      .not('sentiment_strength', 'is', null)
      .order('published_at', { ascending: false });
    
    if (newsError) {
      throw new Error(`Failed to fetch news for evaluation: ${newsError.message}`);
    }
    
    if (!newsToEvaluate || newsToEvaluate.length === 0) {
      console.log('✅ No predictions to evaluate (all recent predictions are neutral or already evaluated)');
      return;
    }
    
    console.log(`📊 Found ${newsToEvaluate.length} predictions to evaluate`);
    
    // Check which ones already have feedback
    const { data: existingFeedback, error: feedbackError } = await supabase
      .from('prediction_feedback')
      .select('news_id')
      .in('news_id', newsToEvaluate.map(n => n.id));
    
    if (feedbackError) {
      throw new Error(`Failed to check existing feedback: ${feedbackError.message}`);
    }
    
    const evaluatedIds = new Set(existingFeedback?.map(f => f.news_id) || []);
    const toEvaluate = newsToEvaluate.filter(n => !evaluatedIds.has(n.id));
    
    if (toEvaluate.length === 0) {
      console.log('✅ All predictions already evaluated');
      return;
    }
    
    console.log(`📈 Evaluating ${toEvaluate.length} new predictions...`);
    
    // Get price data for the evaluation period
    const evaluationStartDate = new Date(sevenDaysAgo);
    evaluationStartDate.setDate(evaluationStartDate.getDate() - 1); // Get one extra day for safety
    const rates = await getRatesInRange(evaluationStartDate.toISOString());
    
    if (!rates || rates.length === 0) {
      console.warn('⚠️  No price data available for evaluation period');
      return;
    }
    
    // Create a map of timestamps to prices for quick lookup
    const priceMap = new Map();
    rates.forEach(rate => {
      const timestamp = new Date(rate.t).getTime();
      priceMap.set(timestamp, rate.mid); // Use mid price
    });
    
    // Evaluate each prediction
    const feedbackResults = [];
    let evaluatedCount = 0;
    
    for (const newsItem of toEvaluate) {
      try {
        const feedback = await evaluateSinglePrediction(newsItem, priceMap);
        if (feedback) {
          feedbackResults.push(feedback);
          evaluatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error evaluating prediction for news ${newsItem.id}:`, error.message);
      }
    }
    
    // Batch insert all feedback results
    if (feedbackResults.length > 0) {
      const { error: insertError } = await supabase
        .from('prediction_feedback')
        .insert(feedbackResults);
      
      if (insertError) {
        throw new Error(`Failed to insert feedback: ${insertError.message}`);
      }
      
      console.log(`✅ Successfully evaluated ${evaluatedCount} predictions`);
    }
    
  } catch (error) {
    console.error('❌ Error in prediction evaluation:', error);
    throw error;
  }
}

/**
 * Evaluate a single prediction by comparing it with actual price movements
 */
async function evaluateSinglePrediction(newsItem, priceMap) {
  const predictionTime = new Date(newsItem.published_at).getTime();
  const predictedSentiment = newsItem.sentiment.toLowerCase();
  const predictedStrength = newsItem.sentiment_strength || 50;
  
  // Find the price at the time of prediction (or closest available)
  let priceAtPrediction = null;
  let closestTimeDiff = Infinity;
  
  for (const [timestamp, price] of priceMap.entries()) {
    const timeDiff = Math.abs(timestamp - predictionTime);
    if (timeDiff < closestTimeDiff) {
      closestTimeDiff = timeDiff;
      priceAtPrediction = price;
    }
  }
  
  if (!priceAtPrediction) {
    console.warn(`⚠️  No price data found for prediction time: ${newsItem.published_at}`);
    return null;
  }
  
  // Calculate prices at 1, 3, and 7 days after prediction
  const oneDayAfter = predictionTime + (24 * 60 * 60 * 1000);
  const threeDaysAfter = predictionTime + (3 * 24 * 60 * 60 * 1000);
  const sevenDaysAfter = predictionTime + (7 * 24 * 60 * 60 * 1000);
  
  const price1d = findClosestPrice(priceMap, oneDayAfter);
  const price3d = findClosestPrice(priceMap, threeDaysAfter);
  const price7d = findClosestPrice(priceMap, sevenDaysAfter);
  
  // Calculate percentage changes
  const change1d = price1d ? ((price1d - priceAtPrediction) / priceAtPrediction) * 100 : null;
  const change3d = price3d ? ((price3d - priceAtPrediction) / priceAtPrediction) * 100 : null;
  const change7d = price7d ? ((price7d - priceAtPrediction) / priceAtPrediction) * 100 : null;
  
  // Determine if predictions were correct
  // A prediction is "correct" if:
  // - Predicted UP and price actually went up (>0.1% threshold to avoid noise)
  // - Predicted DOWN and price actually went down (<-0.1% threshold)
  // - Predicted NEUTRAL and price stayed relatively stable (-0.5% to +0.5%)
  
  const threshold = 0.1; // 0.1% minimum movement to count as a change
  
  const wasCorrect1d = evaluateAccuracy(predictedSentiment, change1d, threshold);
  const wasCorrect3d = evaluateAccuracy(predictedSentiment, change3d, threshold);
  const wasCorrect7d = evaluateAccuracy(predictedSentiment, change7d, threshold);
  
  // Direction accuracy (just check if direction matched, ignoring magnitude)
  const directionCorrect1d = evaluateDirection(predictedSentiment, change1d);
  const directionCorrect3d = evaluateDirection(predictedSentiment, change3d);
  const directionCorrect7d = evaluateDirection(predictedSentiment, change7d);
  
  // Strength accuracy: how well did the predicted strength match the actual magnitude?
  // Higher strength should correlate with larger price movements
  const strengthAccuracyScore = calculateStrengthAccuracy(predictedStrength, change7d);
  
  return {
    news_id: newsItem.id,
    predicted_sentiment: predictedSentiment,
    predicted_strength: predictedStrength,
    prediction_timestamp: newsItem.published_at,
    actual_price_at_prediction: priceAtPrediction,
    actual_price_after_1d: price1d,
    actual_price_after_3d: price3d,
    actual_price_after_7d: price7d,
    price_change_1d: change1d,
    price_change_3d: change3d,
    price_change_7d: change7d,
    was_correct_1d: wasCorrect1d,
    was_correct_3d: wasCorrect3d,
    was_correct_7d: wasCorrect7d,
    direction_correct_1d: directionCorrect1d,
    direction_correct_3d: directionCorrect3d,
    direction_correct_7d: directionCorrect7d,
    strength_accuracy_score: strengthAccuracyScore,
    evaluation_window_days: 7
  };
}

/**
 * Find the closest price to a given timestamp
 */
function findClosestPrice(priceMap, targetTime) {
  let closestPrice = null;
  let closestTimeDiff = Infinity;
  
  for (const [timestamp, price] of priceMap.entries()) {
    const timeDiff = Math.abs(timestamp - targetTime);
    if (timeDiff < closestTimeDiff && timeDiff < (12 * 60 * 60 * 1000)) { // Within 12 hours
      closestTimeDiff = timeDiff;
      closestPrice = price;
    }
  }
  
  return closestPrice;
}

/**
 * Evaluate if a prediction was correct based on actual price change
 */
function evaluateAccuracy(predictedSentiment, actualChange, threshold) {
  if (actualChange === null) return null;
  
  if (predictedSentiment === 'up') {
    return actualChange > threshold;
  } else if (predictedSentiment === 'down') {
    return actualChange < -threshold;
  } else { // neutral
    return Math.abs(actualChange) <= 0.5; // Within 0.5% is considered neutral
  }
}

/**
 * Evaluate if the direction of prediction matched actual direction
 */
function evaluateDirection(predictedSentiment, actualChange) {
  if (actualChange === null) return null;
  
  if (predictedSentiment === 'up') {
    return actualChange > 0;
  } else if (predictedSentiment === 'down') {
    return actualChange < 0;
  } else { // neutral
    return Math.abs(actualChange) <= 0.5;
  }
}

/**
 * Calculate how well the predicted strength matched the actual price movement magnitude
 * Returns a score 0-100 where 100 = perfect match
 */
function calculateStrengthAccuracy(predictedStrength, actualChange) {
  if (actualChange === null) return null;
  
  // Convert actual change to a 0-100 scale
  // Assume max change is ±10% (very extreme movement)
  const maxChange = 10.0;
  const normalizedChange = Math.min(Math.abs(actualChange) / maxChange, 1.0) * 100;
  
  // Calculate how close predicted strength is to normalized change
  const difference = Math.abs(predictedStrength - normalizedChange);
  const accuracy = Math.max(0, 100 - difference); // 100 if perfect match, decreases with difference
  
  return Math.round(accuracy * 100) / 100; // Round to 2 decimal places
}

/**
 * Get accuracy statistics for the AI sentiment analyzer
 * Returns metrics about prediction performance
 */
export async function getAccuracyStats(days = 30) {
  if (!supabase) {
    return null;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('prediction_feedback')
    .select('*')
    .gte('prediction_timestamp', cutoffDate.toISOString())
    .not('was_correct_7d', 'is', null);
  
  if (error) {
    console.error('Error fetching accuracy stats:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    return {
      total_predictions: 0,
      accuracy_7d: null,
      direction_accuracy_7d: null,
      average_strength_accuracy: null,
      by_sentiment: {}
    };
  }
  
  // Calculate overall accuracy
  const correct7d = data.filter(f => f.was_correct_7d === true).length;
  const accuracy7d = (correct7d / data.length) * 100;
  
  // Calculate direction accuracy
  const directionCorrect7d = data.filter(f => f.direction_correct_7d === true).length;
  const directionAccuracy7d = (directionCorrect7d / data.length) * 100;
  
  // Calculate average strength accuracy
  const strengthScores = data.filter(f => f.strength_accuracy_score !== null).map(f => f.strength_accuracy_score);
  const avgStrengthAccuracy = strengthScores.length > 0
    ? strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length
    : null;
  
  // Calculate accuracy by sentiment type
  const bySentiment = {};
  ['up', 'down', 'neutral'].forEach(sentiment => {
    const sentimentData = data.filter(f => f.predicted_sentiment === sentiment);
    if (sentimentData.length > 0) {
      const correct = sentimentData.filter(f => f.was_correct_7d === true).length;
      bySentiment[sentiment] = {
        total: sentimentData.length,
        correct: correct,
        accuracy: (correct / sentimentData.length) * 100
      };
    }
  });
  
  return {
    total_predictions: data.length,
    accuracy_7d: Math.round(accuracy7d * 100) / 100,
    direction_accuracy_7d: Math.round(directionAccuracy7d * 100) / 100,
    average_strength_accuracy: avgStrengthAccuracy ? Math.round(avgStrengthAccuracy * 100) / 100 : null,
    by_sentiment: bySentiment,
    period_days: days
  };
}

/**
 * Get lessons learned from past predictions
 * Returns insights about what types of predictions tend to be more/less accurate
 */
export async function getLessonsLearned() {
  const stats = await getAccuracyStats(90); // Last 90 days
  
  if (!stats || stats.total_predictions === 0) {
    return {
      insights: [],
      recommendations: []
    };
  }
  
  const insights = [];
  const recommendations = [];
  
  // Insight: Overall accuracy
  if (stats.accuracy_7d !== null) {
    insights.push({
      type: 'overall_accuracy',
      message: `Overall prediction accuracy: ${stats.accuracy_7d}% over 7 days`,
      value: stats.accuracy_7d
    });
    
    if (stats.accuracy_7d < 50) {
      recommendations.push({
        type: 'improve_accuracy',
        message: 'Prediction accuracy is below 50%. Consider adjusting prediction thresholds or improving context analysis.'
      });
    }
  }
  
  // Insight: Direction vs full accuracy
  if (stats.direction_accuracy_7d !== null && stats.accuracy_7d !== null) {
    const diff = stats.direction_accuracy_7d - stats.accuracy_7d;
    if (diff > 10) {
      insights.push({
        type: 'direction_better',
        message: `Direction predictions are ${diff.toFixed(1)}% more accurate than full predictions. The AI is better at predicting direction than magnitude.`,
        value: diff
      });
    }
  }
  
  // Insight: Accuracy by sentiment type
  if (stats.by_sentiment) {
    Object.entries(stats.by_sentiment).forEach(([sentiment, data]) => {
      if (data.total >= 5) { // Only include if we have enough samples
        insights.push({
          type: 'sentiment_accuracy',
          sentiment: sentiment,
          message: `${sentiment.toUpperCase()} predictions: ${data.accuracy.toFixed(1)}% accurate (${data.correct}/${data.total})`,
          value: data.accuracy
        });
        
        if (data.accuracy < 40) {
          recommendations.push({
            type: 'improve_sentiment',
            sentiment: sentiment,
            message: `${sentiment.toUpperCase()} predictions have low accuracy (${data.accuracy.toFixed(1)}%). Review examples to understand why.`
          });
        }
      }
    });
  }
  
  // Insight: Strength accuracy
  if (stats.average_strength_accuracy !== null) {
    insights.push({
      type: 'strength_accuracy',
      message: `Average strength prediction accuracy: ${stats.average_strength_accuracy.toFixed(1)}%`,
      value: stats.average_strength_accuracy
    });
    
    if (stats.average_strength_accuracy < 50) {
      recommendations.push({
        type: 'improve_strength',
        message: 'Strength predictions are not well calibrated. Consider adjusting strength calculation logic.'
      });
    }
  }
  
  return {
    insights,
    recommendations,
    stats
  };
}

export default {
  evaluatePredictions,
  getAccuracyStats,
  getLessonsLearned
};

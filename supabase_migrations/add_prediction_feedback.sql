-- Create prediction_feedback table to track AI sentiment prediction accuracy
-- This table stores feedback on how accurate predictions were compared to actual price movements

CREATE TABLE IF NOT EXISTS prediction_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id TEXT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  
  -- Prediction data (what AI predicted)
  predicted_sentiment TEXT NOT NULL CHECK (predicted_sentiment IN ('up', 'down', 'neutral')),
  predicted_strength INTEGER NOT NULL CHECK (predicted_strength >= 0 AND predicted_strength <= 100),
  prediction_timestamp TIMESTAMPTZ NOT NULL, -- When the prediction was made (news published_at)
  
  -- Actual outcome data (what actually happened)
  actual_price_at_prediction REAL NOT NULL, -- Price when prediction was made
  actual_price_after_1d REAL, -- Price 1 day after prediction
  actual_price_after_3d REAL, -- Price 3 days after prediction
  actual_price_after_7d REAL, -- Price 7 days after prediction
  
  -- Calculated metrics
  price_change_1d REAL, -- Percentage change after 1 day
  price_change_3d REAL, -- Percentage change after 3 days
  price_change_7d REAL, -- Percentage change after 7 days
  
  -- Accuracy assessment
  was_correct_1d BOOLEAN, -- Was prediction correct after 1 day?
  was_correct_3d BOOLEAN, -- Was prediction correct after 3 days?
  was_correct_7d BOOLEAN, -- Was prediction correct after 7 days?
  
  -- Direction accuracy (ignoring magnitude)
  direction_correct_1d BOOLEAN, -- Did direction match after 1 day?
  direction_correct_3d BOOLEAN, -- Did direction match after 3 days?
  direction_correct_7d BOOLEAN, -- Did direction match after 7 days?
  
  -- Strength accuracy (how well did strength predict magnitude?)
  strength_accuracy_score REAL, -- 0-100 score based on how well strength predicted magnitude
  
  -- Evaluation metadata
  evaluated_at TIMESTAMPTZ DEFAULT NOW(), -- When this feedback was calculated
  evaluation_window_days INTEGER DEFAULT 7, -- How many days after prediction to evaluate
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prediction_feedback_news_id ON prediction_feedback(news_id);
CREATE INDEX IF NOT EXISTS idx_prediction_feedback_timestamp ON prediction_feedback(prediction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_feedback_evaluated ON prediction_feedback(evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_feedback_correct_7d ON prediction_feedback(was_correct_7d) WHERE was_correct_7d IS NOT NULL;

-- Add comment explaining the table
COMMENT ON TABLE prediction_feedback IS 'Tracks accuracy of AI sentiment predictions by comparing predicted sentiment with actual price movements over 1, 3, and 7 day periods';

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prediction_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_prediction_feedback_updated_at
  BEFORE UPDATE ON prediction_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_prediction_feedback_updated_at();

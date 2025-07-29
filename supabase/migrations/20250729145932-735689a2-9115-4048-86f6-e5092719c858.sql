-- Create assessment_questions table for storing individual questions
CREATE TABLE public.assessment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_type_id UUID NOT NULL REFERENCES public.assessment_types(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- Unique ID within the assessment (e.g., "q1", "q2")
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multi_choice', 'text_input')),
  question_text TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb, -- Array of {text, value} objects
  scoring JSONB DEFAULT '{}'::jsonb, -- Map of option values to scores
  next_question_logic JSONB DEFAULT '[]'::jsonb, -- Conditional branching logic
  min_selections INTEGER DEFAULT 1, -- For multi_choice questions
  max_selections INTEGER DEFAULT 1, -- For multi_choice questions
  placeholder TEXT, -- For text_input questions
  order_index INTEGER NOT NULL DEFAULT 0, -- Order of questions
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessment_results_logic table for storing result interpretation
CREATE TABLE public.assessment_results_logic (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_type_id UUID NOT NULL REFERENCES public.assessment_types(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('score_range', 'answer_combination')),
  condition_data JSONB NOT NULL, -- e.g., {"min_score": 0, "max_score": 10} or {"answers": ["q1_value", "q2_value"]}
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add content_file_name to assessment_types for tracking uploaded files
ALTER TABLE public.assessment_types 
ADD COLUMN content_file_name TEXT,
ADD COLUMN content_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results_logic ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_questions
CREATE POLICY "Questions are publicly readable" 
ON public.assessment_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage questions" 
ON public.assessment_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.email = ANY(ARRAY['admin@careercraft.com', 'support@careercraft.com'])
));

-- Create policies for assessment_results_logic
CREATE POLICY "Results logic is publicly readable" 
ON public.assessment_results_logic 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage results logic" 
ON public.assessment_results_logic 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.email = ANY(ARRAY['admin@careercraft.com', 'support@careercraft.com'])
));

-- Create trigger for updated_at on assessment_questions
CREATE TRIGGER update_assessment_questions_updated_at
BEFORE UPDATE ON public.assessment_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_assessment_questions_type_id ON public.assessment_questions(assessment_type_id);
CREATE INDEX idx_assessment_questions_order ON public.assessment_questions(assessment_type_id, order_index);
CREATE INDEX idx_assessment_results_logic_type_id ON public.assessment_results_logic(assessment_type_id);
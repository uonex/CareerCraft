-- Create assessment_types table for managing dynamic assessments
CREATE TABLE public.assessment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_duration TEXT NOT NULL DEFAULT '20-30 minutes',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;

-- Create policies for assessment_types
CREATE POLICY "Assessment types are publicly readable" 
ON public.assessment_types 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage assessment types" 
ON public.assessment_types 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.email = ANY(ARRAY['admin@careercraft.com', 'support@careercraft.com'])
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_assessment_types_updated_at
  BEFORE UPDATE ON public.assessment_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default assessment types
INSERT INTO public.assessment_types (name, description, estimated_duration) VALUES
('Career Aptitude Test', 'Discover your natural talents and abilities across different career domains.', '20-30 minutes'),
('Interest Profiler', 'Identify what truly motivates and interests you in potential career paths.', '15-20 minutes'),
('Personality Assessment', 'Understand your personality type and how it relates to career success.', '25-35 minutes');
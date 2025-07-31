-- Create feedback table for managing user feedback
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  counselor_id UUID,
  session_id UUID,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized' CHECK (category IN ('technical', 'social', 'spam', 'uncategorized')),
  is_read BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback
CREATE POLICY "Admins can manage all feedback" 
ON public.feedback 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.email = ANY(ARRAY['admin@careercraft.com', 'support@careercraft.com'])
));

CREATE POLICY "Users can insert their own feedback" 
ON public.feedback 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create analytics_metrics table for storing platform metrics
CREATE TABLE public.analytics_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics_metrics
CREATE POLICY "Admins can manage analytics metrics" 
ON public.analytics_metrics 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.email = ANY(ARRAY['admin@careercraft.com', 'support@careercraft.com'])
));

-- Insert some sample analytics data
INSERT INTO public.analytics_metrics (metric_type, metric_name, metric_value, date_recorded) VALUES
('growth', 'total_users', 1250, CURRENT_DATE),
('growth', 'new_registrations_today', 15, CURRENT_DATE),
('growth', 'active_users_30d', 980, CURRENT_DATE),
('growth', 'retention_rate_30d', 78.5, CURRENT_DATE),
('sales', 'total_sessions_booked', 3420, CURRENT_DATE),
('sales', 'sessions_today', 8, CURRENT_DATE),
('sales', 'revenue_total', 68400, CURRENT_DATE),
('sales', 'average_session_price', 20, CURRENT_DATE),
('sales', 'conversion_rate', 12.5, CURRENT_DATE),
('outreach', 'website_visitors_today', 245, CURRENT_DATE),
('outreach', 'leads_generated', 89, CURRENT_DATE);

-- Insert sample feedback data
INSERT INTO public.feedback (user_id, message, category, is_read) VALUES
(gen_random_uuid(), 'The website is very slow when loading the assessments page. It takes almost 2 minutes to load.', 'technical', false),
(gen_random_uuid(), 'My counselor Sarah was extremely helpful and provided great career advice. Highly recommend!', 'social', false),
(gen_random_uuid(), 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt', 'spam', true),
(gen_random_uuid(), 'The assessment results page crashed when I tried to download my report. Please fix this bug.', 'technical', false),
(gen_random_uuid(), 'Great platform! The user interface is intuitive and easy to navigate.', 'social', true);
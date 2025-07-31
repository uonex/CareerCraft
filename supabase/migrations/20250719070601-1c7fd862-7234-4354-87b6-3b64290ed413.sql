-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  education_level TEXT,
  preferred_language TEXT DEFAULT 'en',
  parent_guardian_name TEXT,
  parent_guardian_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counselors table
CREATE TABLE public.counselors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  photo_url TEXT,
  availability_json JSONB DEFAULT '{}',
  rate_per_session NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  counselor_id UUID REFERENCES public.counselors(id) NOT NULL,
  service_type TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled', 'rescheduled')),
  notes TEXT,
  counselor_notes TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  rate NUMERIC(10,2),
  location TEXT DEFAULT 'Career Craft Guidance Center',
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  results_json JSONB DEFAULT '{}',
  counselor_interpretation_notes TEXT,
  score INTEGER,
  career_suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for counselor-student communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES public.sessions(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_types table
CREATE TABLE public.service_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.sessions FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions" 
  ON public.sessions FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" 
  ON public.sessions FOR UPDATE 
  USING (user_id = auth.uid());

-- Create RLS policies for assessments
CREATE POLICY "Users can view their own assessments" 
  ON public.assessments FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own assessments" 
  ON public.assessments FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages FOR SELECT 
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (sender_id = auth.uid());

-- Counselors and service_types are publicly readable
CREATE POLICY "Counselors are publicly readable" 
  ON public.counselors FOR SELECT 
  USING (true);

CREATE POLICY "Service types are publicly readable" 
  ON public.service_types FOR SELECT 
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselors_updated_at
  BEFORE UPDATE ON public.counselors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample counselors
INSERT INTO public.counselors (name, specializations, experience_years, bio, rate_per_session) VALUES
('Dr. Priya Sharma', ARRAY['School Career Guidance', 'Stream Selection'], 8, 'Dr. Priya has over 8 years of experience helping students navigate their academic choices and career paths.', 1500),
('Mr. Rajesh Kumar', ARRAY['Engineering Admissions', 'Technical Careers'], 12, 'Rajesh specializes in guiding students toward engineering and technical career paths with 12 years of experience.', 1800),
('Ms. Anita Verma', ARRAY['Arts & Humanities', 'Creative Careers'], 6, 'Anita is passionate about helping students explore creative and humanities-based career opportunities.', 1200),
('Dr. Vikram Singh', ARRAY['Medical Entrance', 'Science Careers'], 10, 'Dr. Vikram guides students preparing for medical entrance exams and science-related career paths.', 2000);

-- Insert sample service types
INSERT INTO public.service_types (name, description, duration_minutes, price) VALUES
('Individual Counseling (1 Session)', 'Personalized 1-on-1 guidance session to explore career options and create action plans', 60, 1500),
('Individual Counseling (3 Session Package)', 'Comprehensive 3-session package for in-depth career exploration and planning', 180, 4000),
('Group Workshop', 'Interactive group sessions on common topics like stream selection and study techniques', 120, 800),
('Initial Assessment Review', 'Detailed review and interpretation of career assessment results', 45, 1000),
('Career Assessment', 'Comprehensive aptitude and interest assessment with professional interpretation', 90, 1200);
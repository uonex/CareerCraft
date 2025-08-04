-- Add counselor role to existing enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'counselor';

-- Update counselors table to support authentication
ALTER TABLE public.counselors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;

-- Create counselor availability table
CREATE TABLE IF NOT EXISTS public.counselor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID REFERENCES public.counselors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counselor students assignment table
CREATE TABLE IF NOT EXISTS public.counselor_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID REFERENCES public.counselors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(counselor_id, student_id)
);

-- Create counselor resources table
CREATE TABLE IF NOT EXISTS public.counselor_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  resource_type TEXT NOT NULL, -- 'document', 'link', 'video', etc.
  is_public BOOLEAN DEFAULT false, -- if true, available to all counselors
  created_by UUID REFERENCES public.counselors(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.counselor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for counselor_availability
CREATE POLICY "Counselors can manage their own availability" 
ON public.counselor_availability 
FOR ALL 
USING (counselor_id IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all availability" 
ON public.counselor_availability 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for counselor_students
CREATE POLICY "Counselors can view their assigned students" 
ON public.counselor_students 
FOR SELECT 
USING (counselor_id IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage student assignments" 
ON public.counselor_students 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for counselor_resources
CREATE POLICY "Counselors can view public resources and their own" 
ON public.counselor_resources 
FOR SELECT 
USING (is_public = true OR created_by IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Counselors can insert their own resources" 
ON public.counselor_resources 
FOR INSERT 
WITH CHECK (created_by IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Counselors can update their own resources" 
ON public.counselor_resources 
FOR UPDATE 
USING (created_by IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Counselors can delete their own resources" 
ON public.counselor_resources 
FOR DELETE 
USING (created_by IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all resources" 
ON public.counselor_resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update existing counselors RLS to include counselor role access
CREATE POLICY "Counselors can update their own profile" 
ON public.counselors 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Counselors can view their own profile" 
ON public.counselors 
FOR SELECT 
USING (user_id = auth.uid() OR true); -- Keep public readable for featured section

-- Update sessions table to allow counselors to manage their sessions
CREATE POLICY "Counselors can view their own sessions" 
ON public.sessions 
FOR SELECT 
USING (counselor_id IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

CREATE POLICY "Counselors can update their own sessions" 
ON public.sessions 
FOR UPDATE 
USING (counselor_id IN (
  SELECT id FROM public.counselors WHERE user_id = auth.uid()
));

-- Add trigger for updated_at columns
CREATE TRIGGER update_counselor_availability_updated_at
BEFORE UPDATE ON public.counselor_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselor_resources_updated_at
BEFORE UPDATE ON public.counselor_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
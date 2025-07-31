-- Phase 1: Critical RLS Fixes
-- Enable RLS on counselors and service_types tables
ALTER TABLE public.counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Fix the security definer function to prevent SQL injection
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add missing RLS policies for counselors (admin management)
CREATE POLICY "Admins can manage counselors" ON public.counselors
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@careercraft.com', 'support@careercraft.com')
  )
);

-- Add missing RLS policies for service_types (admin management)
CREATE POLICY "Admins can manage service types" ON public.service_types
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@careercraft.com', 'support@careercraft.com')
  )
);

-- Add missing UPDATE policies for messages
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

-- Add missing DELETE policies for messages  
CREATE POLICY "Users can delete their own messages" ON public.messages
FOR DELETE USING (sender_id = auth.uid());

-- Add missing UPDATE policies for assessments
CREATE POLICY "Users can update their own assessments" ON public.assessments
FOR UPDATE USING (user_id = auth.uid());

-- Add missing DELETE policies for profiles (users can delete their own profile)
CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE USING (auth.uid() = user_id);

-- Add data validation constraints
ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_phone CHECK (phone IS NULL OR length(phone) >= 10);

ALTER TABLE public.sessions 
  ADD CONSTRAINT valid_session_date CHECK (session_date >= CURRENT_DATE);

ALTER TABLE public.sessions 
  ADD CONSTRAINT valid_status CHECK (status IN ('booked', 'completed', 'cancelled', 'no-show'));

ALTER TABLE public.sessions 
  ADD CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Add audit logging function for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email IN ('admin@careercraft.com', 'support@careercraft.com')
  )
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_sessions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_counselors_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.counselors
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
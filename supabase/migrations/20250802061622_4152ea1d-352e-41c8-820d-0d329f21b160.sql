-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT role
    FROM public.user_roles
    WHERE user_id = auth.uid()
    ORDER BY 
        CASE role
            WHEN 'admin' THEN 1
            WHEN 'moderator' THEN 2
            WHEN 'user' THEN 3
        END
    LIMIT 1;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Update existing RLS policies to use role-based access instead of hardcoded emails

-- Update assessment_types policies
DROP POLICY IF EXISTS "Admins can manage assessment types" ON public.assessment_types;
CREATE POLICY "Admins can manage assessment types"
ON public.assessment_types
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update counselors policies  
DROP POLICY IF EXISTS "Admins can manage counselors" ON public.counselors;
CREATE POLICY "Admins can manage counselors"
ON public.counselors
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update feedback policies
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback;
CREATE POLICY "Admins can manage all feedback"
ON public.feedback
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update analytics_metrics policies
DROP POLICY IF EXISTS "Admins can manage analytics metrics" ON public.analytics_metrics;
CREATE POLICY "Admins can manage analytics metrics"
ON public.analytics_metrics
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update audit_logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update assessment_questions policies
DROP POLICY IF EXISTS "Admins can manage questions" ON public.assessment_questions;
CREATE POLICY "Admins can manage questions"
ON public.assessment_questions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update assessment_results_logic policies
DROP POLICY IF EXISTS "Admins can manage results logic" ON public.assessment_results_logic;
CREATE POLICY "Admins can manage results logic"
ON public.assessment_results_logic
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update service_types policies
DROP POLICY IF EXISTS "Admins can manage service types" ON public.service_types;
CREATE POLICY "Admins can manage service types"
ON public.service_types
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Enhanced audit logging trigger for security events
CREATE OR REPLACE FUNCTION public.audit_security_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Log admin actions with enhanced security context
    IF public.has_role(auth.uid(), 'admin') THEN
        INSERT INTO public.audit_logs (
            table_name, 
            operation, 
            user_id, 
            old_data, 
            new_data
        )
        VALUES (
            TG_TABLE_NAME, 
            TG_OP, 
            auth.uid(),
            CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN row_to_json(OLD) END,
            CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply security audit triggers to sensitive tables
CREATE TRIGGER audit_user_roles_security
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_security_trigger();

CREATE TRIGGER audit_assessment_types_security
    AFTER INSERT OR UPDATE OR DELETE ON public.assessment_types
    FOR EACH ROW EXECUTE FUNCTION public.audit_security_trigger();
-- Fix RLS policies for counselors table to allow admin operations
DROP POLICY IF EXISTS "Admins can manage counselors" ON counselors;
DROP POLICY IF EXISTS "Counselors can update their own profile" ON counselors;
DROP POLICY IF EXISTS "Counselors can view their own profile" ON counselors;

-- Create comprehensive admin policy
CREATE POLICY "Admins can manage all counselors" 
ON counselors 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow counselors to view and update their own profile
CREATE POLICY "Counselors can manage own profile" 
ON counselors 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Keep public read access
CREATE POLICY "Public read access to counselors" 
ON counselors 
FOR SELECT 
USING (true);
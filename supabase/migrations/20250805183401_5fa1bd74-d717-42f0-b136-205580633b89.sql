-- Fix RLS policy for user_roles table to allow admin insertions

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create updated policy that allows admins to insert roles for other users
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  -- Allow users to see their own roles OR admins to see all roles
  (user_id = auth.uid()) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  -- Allow users to insert their own roles OR admins to insert any roles
  (user_id = auth.uid()) OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);
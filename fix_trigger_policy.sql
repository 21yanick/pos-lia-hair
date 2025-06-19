-- Fix: Allow the trigger to insert users
-- Option 1: Update the INSERT policy to allow SECURITY DEFINER functions

DROP POLICY IF EXISTS users_insert_own ON public.users;

CREATE POLICY users_insert_own ON public.users 
FOR INSERT 
WITH CHECK (
    auth.uid() = id 
    OR 
    -- Allow SECURITY DEFINER functions (like our trigger) to insert
    current_setting('role') = 'postgres'
);

-- Alternative Option 2: Temporarily disable the trigger
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
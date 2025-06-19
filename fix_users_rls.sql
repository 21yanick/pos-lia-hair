-- Fix: Add missing INSERT policy for users table
-- This allows new users to insert themselves into the users table during registration

CREATE POLICY users_insert_own ON public.users 
FOR INSERT 
WITH CHECK ((auth.uid() = id));
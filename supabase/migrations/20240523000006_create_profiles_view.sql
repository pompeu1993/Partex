
-- 1. Create a view to join profiles and auth.users
CREATE OR REPLACE VIEW public.profiles_with_email AS
SELECT
  p.*,
  u.email
FROM
  public.profiles p
JOIN
  auth.users u ON p.id = u.id;

-- 2. Grant permissions to the view
GRANT SELECT ON public.profiles_with_email TO authenticated;
GRANT SELECT ON public.profiles_with_email TO service_role;

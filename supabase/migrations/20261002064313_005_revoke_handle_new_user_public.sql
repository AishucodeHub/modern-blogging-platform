/*
# Revoke EXECUTE on handle_new_user from public role

The previous migration revoked from anon and authenticated explicitly,
but the `public` pseudo-role still grants EXECUTE by default to all roles.
*/

REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;

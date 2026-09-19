-- Move helper functions out of the exposed API schema (advisor 0028/0029).
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;

alter function public.owns_child(uuid) set schema private;
revoke all on function private.owns_child(uuid) from public, anon;
grant execute on function private.owns_child(uuid) to authenticated;

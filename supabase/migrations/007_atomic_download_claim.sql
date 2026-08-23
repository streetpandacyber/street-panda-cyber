-- Atomically claim one download slot. A return value of -1 means that the
-- item does not exist or has already reached its configured download limit.
create or replace function public.claim_download(item_row_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_count integer;
begin
  update public.order_items
     set download_count = download_count + 1
   where id = item_row_id
     and download_count < max_downloads
  returning download_count into claimed_count;

  return coalesce(claimed_count, -1);
end;
$$;

revoke all on function public.claim_download(uuid) from public;
grant execute on function public.claim_download(uuid) to service_role;

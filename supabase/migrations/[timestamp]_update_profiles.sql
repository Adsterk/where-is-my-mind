-- Add new columns to profiles table
alter table profiles
add column if not exists theme text not null default 'light',
add column if not exists language text not null default 'en';

-- Create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name)
values ('avatars', 'avatars')
on conflict do nothing;

-- Enable RLS on storage
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid ); 
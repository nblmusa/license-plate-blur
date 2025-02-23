create table public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  responded_at timestamp with time zone,
  notes text
);

-- Set up RLS (Row Level Security)
alter table public.contact_submissions enable row level security;

-- Create policy to allow all users to insert
create policy "Allow users to submit contact forms"
  on public.contact_submissions for insert
  to public
  with check (true);

-- Create policy to allow only authenticated users to view their own submissions
create policy "Allow users to view their own submissions"
  on public.contact_submissions for select
  to authenticated
  using (email = auth.jwt()->>'email');

-- Create policy to allow admins to view all submissions
create policy "Allow admins to view all submissions"
  on public.contact_submissions for all
  to authenticated
  using (auth.jwt()->>'email' in (
    select email from auth.users where raw_user_meta_data->>'isAdmin' = 'true'
  )); 
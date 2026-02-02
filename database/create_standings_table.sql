-- Create table for standings (classificacoes)
create table if not exists public.classificacoes (
    id uuid default gen_random_uuid() primary key,
    competicao text not null,
    grupo text not null,
    equipa text not null,
    posicao integer,
    jogos integer,
    vitorias integer,
    derrotas integer,
    pontos integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    unique(competicao, grupo, equipa)
);

-- Enable RLS
alter table public.classificacoes enable row level security;

-- Create policy to allow read access for all users
create policy "Allow public read access"
on public.classificacoes
for select
to public
using (true);

-- Create policy to allow insert/update for service role (handled by key usually, or anon if using simple scraper setup)
create policy "Allow insert for service role"
on public.classificacoes
for insert
to anon, authenticated, service_role
with check (true);

create policy "Allow update for service role"
on public.classificacoes
for update
to anon, authenticated, service_role
using (true);

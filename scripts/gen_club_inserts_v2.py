import json
import re
import unicodedata
import sys

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\fpb_clubes_final-1.json', encoding='utf-8') as f:
    clubs = json.load(f)

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def escape_sql(s):
    return s.replace("'", "''")

used_slugs = {}
values_list = []

for c in clubs:
    cid = c['id']
    name = c['nome_curto'].strip()
    full = c['nome_completo'].strip()
    color = c['cor_fundo'].strip()
    logo_primary = (c.get('logo_principal') or '').strip()
    logo_secondary = (c.get('logo_secundario') or '').strip()  # will be NULL if empty
    priority = c.get('prioridade', 0)

    base_slug = slugify(name)
    if base_slug in used_slugs:
        base_slug = f"{base_slug}-{cid}"
    used_slugs[base_slug] = True

    search_name = slugify(full)
    
    primary_val = f"'{escape_sql(logo_primary)}'" if logo_primary else 'NULL'
    secondary_val = f"'{escape_sql(logo_secondary)}'" if logo_secondary else 'NULL'
    color_val = f"'{escape_sql(color)}'" if color else 'NULL'

    values_list.append(
        f"({cid}, '{escape_sql(name)}', '{base_slug}', '{search_name}', {color_val}, {primary_val}, {secondary_val}, {priority})"
    )

# Generate SQL in batches of 50
batch_size = 50
total = len(values_list)
batches = []

for i in range(0, total, batch_size):
    batch = values_list[i:i+batch_size]
    values_str = ',\n'.join(batch)
    sql = f"""INSERT INTO clubs (id, name, slug, search_name, primary_color, logo_url, logo_secondary, priority)
VALUES
{values_str}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  logo_url = EXCLUDED.logo_url,
  logo_secondary = EXCLUDED.logo_secondary,
  priority = EXCLUDED.priority;"""
    batches.append(sql)

# Write batches
for idx, b in enumerate(batches):
    with open(rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\batch_v2_{idx+1}.sql', 'w', encoding='utf-8') as f:
        f.write(b)

print(f"Generated {len(batches)} batches for {total} clubs")

# Check slug duplicates
dups = {}
for c in clubs:
    s = slugify(c['nome_curto'].strip())
    if s not in dups:
        dups[s] = []
    dups[s].append(c['id'])
dup_ids = [ids for ids in dups.values() if len(ids) > 1]
if dup_ids:
    print(f"Warning: slug collisions (resolved with -ID suffix): {dup_ids}")
else:
    print("No slug collisions")

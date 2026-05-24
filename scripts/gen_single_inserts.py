import re

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_all.sql', encoding='utf-8') as f:
    sql = f.read()

# Extract all rows from all INSERT statements
all_rows = re.findall(r'\((\d+),\s*\'([^\']*)\',\s*(\d+),\s*\'([^\']*)\',\s*\'([^\']*)\',\s*ARRAY\[\]::text\[\],\s*NOW\(\)\s*,\s*NOW\(\)\)', sql)

# Deduplicate by competition_id + season
seen = set()
single_inserts = []
for cid, cname, aid, aname, season in all_rows:
    key = f'{cid}-{season}'
    if key not in seen:
        seen.add(key)
        escaped_name = cname.replace("'", "''")
        escaped_aname = aname.replace("'", "''")
        single_inserts.append(
            f"INSERT INTO competitions (competition_id, competition_name, association_id, association_name, season, club_names, created_at, updated_at) VALUES ({cid}, '{escaped_name}', {aid}, '{escaped_aname}', '{season}', ARRAY[]::text[], NOW(), NOW()) ON CONFLICT (competition_id, season) DO UPDATE SET competition_name = EXCLUDED.competition_name, association_name = EXCLUDED.association_name, updated_at = NOW();"
        )

print(f'Total unique rows: {len(single_inserts)}')

# Write to file
with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_single_inserts.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(single_inserts))
print('Written to comp_single_inserts.sql')

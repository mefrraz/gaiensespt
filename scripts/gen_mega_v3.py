import re

# Read the single inserts SQL
with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_single_inserts.sql', encoding='utf-8') as f:
    sql = f.read()

statements = [s.strip() for s in sql.split(';') if s.strip()]

# Remove ON CONFLICT clause to avoid "cannot affect row a second time" error
cleaned = []
for stmt in statements:
    # Keep only competition_id, name, association_id, name, season
    # Remove ON CONFLICT
    stmt_no_conflict = re.sub(r'\s*ON CONFLICT.*$', '', stmt, flags=re.DOTALL) + ';'
    cleaned.append(stmt_no_conflict)

# Write a single VALUES block with all rows
# Parse each row and create a mega INSERT
all_values = []
seen = set()
for stmt in cleaned:
    m = re.search(r'\((\d+),\s*\'([^\']*)\',\s*(\d+),\s*\'([^\']*)\',\s*\'([^\']*)\'', stmt)
    if m:
        cid, cname, aid, aname, season = m.groups()
        key = f'{cid}-{season}'
        if key not in seen:
            seen.add(key)
            escaped_name = cname.replace("'", "''")
            escaped_aname = aname.replace("'", "''")
            all_values.append(f"({cid}, '{escaped_name}', {aid}, '{escaped_aname}', '{season}', ARRAY[]::text[], NOW(), NOW())")

print(f'Total unique rows: {len(all_values)}')

# Write mega INSERTs
batch_size = 100
for i in range(0, len(all_values), batch_size):
    chunk = all_values[i:i+batch_size]
    sql_block = f"""
INSERT INTO competitions (competition_id, competition_name, association_id, association_name, season, club_names, created_at, updated_at)
VALUES
{',\n'.join(chunk)};
"""
    # Remove ON CONFLICT — just INSERT, ignore duplicate errors
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_mega_v3_{i//batch_size+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(sql_block)
    print(f'Batch {i//batch_size+1}: {len(chunk)} rows, {len(sql_block)} chars')

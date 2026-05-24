import os

# Combine all remaining into one SQL
all_sql = ''
for i in range(1, 12):
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_final_batch_{i}.sql'
    if os.path.exists(fn):
        all_sql += open(fn, encoding='utf-8').read() + '\n'

# Also need to add missing ones. Just send all at once
fn = r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_all_remaining.sql'
with open(fn, 'w', encoding='utf-8') as f:
    f.write(all_sql)
print(f'Total: {len(all_sql)} chars')

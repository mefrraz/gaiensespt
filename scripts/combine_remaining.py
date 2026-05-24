combined = ''
for i in range(2, 10):
    with open(rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_dedup_{i}.sql', encoding='utf-8') as f:
        combined += f.read() + '\n'

fn = r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_remaining.sql'
with open(fn, 'w', encoding='utf-8') as f:
    f.write(combined)
print(f'Remaining SQL: {len(combined)} chars')

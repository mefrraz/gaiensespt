combined = ''
for i in range(1, 10):
    with open(rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_dedup_{i}.sql', encoding='utf-8') as f:
        combined += f.read() + '\n'

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_dedup_all.sql', 'w', encoding='utf-8') as f:
    f.write(combined)
print(f'Combined: {len(combined)} chars')

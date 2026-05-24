import re
html = open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\tuga_test.html', encoding='utf-8').read()
# Find season select options
opts = re.findall(r'option[^>]*value="(\d+)"[^>]*>([^<]+)', html)
for v, l in opts:
    print(f'value={v} -> {l.strip()}')
# Find selected/highlighted season
selected = re.findall(r'option[^>]*value="(\d+)"[^>]*selected[^>]*>([^<]+)', html)
print(f'Selected: {selected}')

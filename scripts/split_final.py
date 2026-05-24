with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_remaining.sql', encoding='utf-8') as f:
    text = f.read()

# Split on the last INSERT boundary before halfway
import re
positions = [m.start() for m in re.finditer(r'INSERT INTO', text)]
mid = len(text) // 2
split_pos = max(p for p in positions if p < mid)

part1 = text[:split_pos]
part2 = text[split_pos:]

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_final_1.sql', 'w', encoding='utf-8') as f:
    f.write(part1)
with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_final_2.sql', 'w', encoding='utf-8') as f:
    f.write(part2)

print(f'Part 1: {len(part1)} chars')
print(f'Part 2: {len(part2)} chars')

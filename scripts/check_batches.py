import json, os

# Read all batch files and execute via Python + supabase REST
batches = []
for i in range(4, 7):
    with open(rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\batch_v2_{i}.sql', encoding='utf-8') as f:
        sql = f.read().strip()
        batches.append(sql)

print(f"Total batches to execute: {len(batches)}")
for i, b in enumerate(batches):
    print(f"Batch {i+4}: {len(b)} chars, {b.count('ON CONFLICT')} INSERTs")

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Supabase credentials not found in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SEASONS = {
    "2024_2025": [
        "https://resultados.tugabasket.com/standings?competitionId=10392",
        "https://resultados.tugabasket.com/standings?competitionId=10487",
        "https://resultados.tugabasket.com/standings?competitionId=10478",
        "https://resultados.tugabasket.com/standings?competitionId=10476"
    ],
    "2023_2024": [
        "https://resultados.tugabasket.com/standings?competitionId=9970",
        "https://resultados.tugabasket.com/standings?competitionId=9972",
        "https://resultados.tugabasket.com/standings?competitionId=9974",
        "https://resultados.tugabasket.com/standings?competitionId=9863"
    ],
    "2022_2023": [
        "https://resultados.tugabasket.com/standings?competitionId=9319",
        "https://resultados.tugabasket.com/standings?competitionId=9415",
        "https://resultados.tugabasket.com/standings?competitionId=9416",
        "https://resultados.tugabasket.com/standings?competitionId=9417"
    ]
};

function cleanInt(val) {
    if (!val) return 0;
    try {
        const cleaned = val.replace(/\./g, '').trim();
        return parseInt(cleaned, 10) || 0;
    } catch {
        return 0;
    }
}

async function scrapeSeason(seasonKey, urls) {
    console.log(`--- Processing Season: ${seasonKey} ---`);
    const browser = await chromium.launch({ headless: true });
    // Use a desktop user agent to be safe
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    for (const url of urls) {
        console.log(`Navigating to: ${url}`);
        const competitionIdMatch = url.match(/competitionId=(\d+)/);
        const competitionId = competitionIdMatch ? competitionIdMatch[1] : null;

        if (!competitionId) {
            console.error(`  Could not extract competitionId from ${url}`);
            continue;
        }

        try {
            await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

            // Get Competition Name
            let competitionName = "Unknown Competition";
            try {
                // Try to find title in h1 inside .header-title
                const titleEl = page.locator('.panel-comp__title .title__name a, .header-title h1');
                if (await titleEl.count() > 0) {
                    competitionName = (await titleEl.first().innerText()).trim();
                }
            } catch (e) { }
            console.log(`  Competition: ${competitionName}`);

            // 1. Get Phases from Select
            const phaseSelect = page.locator('#phaseId');
            if (await phaseSelect.count() === 0) {
                console.log('  No phase select found. Skipping.');
                continue;
            }

            const options = await phaseSelect.locator('option').all();
            const phases = [];
            for (const opt of options) {
                const val = await opt.getAttribute('value');
                const text = (await opt.innerText()).trim();
                if (val) phases.push({ id: val, name: text });
            }
            console.log(`  Found ${phases.length} phases.`);

            // 2. Loop phases and fetch data
            for (const phase of phases) {
                const phaseUrl = `https://resultados.tugabasket.com/Competition/GetStandingsByPhase?competitionId=${competitionId}&phaseId=${phase.id}`;
                // console.log(`    Fetching Phase: ${phase.name} (${phaseUrl})`);

                // Navigate to the partial view
                await page.goto(phaseUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });

                // Parse Table
                // Selector based on debug_phase.html
                const table = page.locator('table.standings, table.table-striped').first();
                if (await table.count() === 0) {
                    console.log(`    No table found for ${phase.name}`);
                    continue;
                }

                const rows = await table.locator('tbody tr').all();
                const parsedRows = [];
                let gaiaFound = false;

                for (const row of rows) {
                    const cols = await row.locator('td').all();
                    if (cols.length < 10) continue; // safety check

                    try {
                        // Parse logic based on debug_phase.html
                        // Col 0: Team info. Rank inside .t3, Name inside .ml-2 or direct text?
                        // The debug HTML shows: 
                        // <td class="primary"><div class="flex..."><div...><p class="t3">1</p>...<div class="ml-2">Name</div>...

                        const col0 = cols[0];
                        let pos = 0;
                        let teamName = "";

                        // Try specific selectors
                        const posEl = col0.locator('.t3');
                        if (await posEl.count() > 0) {
                            pos = cleanInt(await posEl.innerText());
                        } else {
                            // Fallback
                            pos = cleanInt((await col0.innerText()).substring(0, 2));
                        }

                        const nameEl = col0.locator('.ml-2');
                        if (await nameEl.count() > 0) {
                            teamName = (await nameEl.innerText()).trim();
                        } else {
                            teamName = (await col0.innerText()).replace(/^\d+/, '').trim();
                        }

                        const played = cleanInt(await cols[1].innerText());
                        const won = cleanInt(await cols[2].innerText());
                        const lost = cleanInt(await cols[3].innerText());
                        // Skip col 4 (FC), 5 (PM), 6 (PS), 7 (DIF), 8 (CASA), 9 (PM/PS), 10 (FORA), 11 (PM/PS)
                        // PTS is usually 2nd to last or similar.
                        // In debug_phase.html, PTS is index 12 (13th column).
                        // Let's verify by checking header if possible, or just grab index 12.
                        // Header: EQUIPA, J, V, D, FC, PM, PS, DIF, CASA, PM/PS, FORA, PM/PS, PTS, FORMA.
                        // 14 columns. PTS is index 12.

                        let pts = 0;
                        if (cols.length >= 13) {
                            pts = cleanInt(await cols[12].innerText());
                        } else {
                            // Fallback: search for Pts text? Or assume last numeric?
                            pts = cleanInt(await cols[cols.length - 2].innerText());
                        }

                        parsedRows.push({
                            competicao: competitionName,
                            grupo: phase.name,
                            equipa: teamName,
                            posicao: pos,
                            jogos: played,
                            vitorias: won,
                            derrotas: lost,
                            pontos: pts
                        });

                        if (teamName.toUpperCase().includes('GAIA')) {
                            gaiaFound = true;
                        }

                    } catch (err) {
                        //  console.log('Error parsing row', err);
                    }
                }

                if (gaiaFound) {
                    console.log(`    > Found Gaia in '${phase.name}'. Inserting ${parsedRows.length} rows.`);
                    const { error } = await supabase
                        .from(`classificacoes_${seasonKey}`)
                        .upsert(parsedRows, { onConflict: 'competicao,grupo,equipa' });

                    if (error) {
                        console.error('      Error inserting to DB:', error);
                    }
                } else {
                    // console.log(`    > Skipping '${phase.name}' (Gaia not found).`);
                }
            }

        } catch (e) {
            console.error(`Error processing ${url}:`, e);
        }
    }

    await browser.close();
}

async function main() {
    console.log("Starting import...");
    for (const [season, links] of Object.entries(SEASONS)) {
        await scrapeSeason(season, links);
    }
    console.log("Import complete.");
}

main().catch(console.error);

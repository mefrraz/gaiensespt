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

// Config with known OFFICIAL names where available. 
// These names match the pattern the user requested (Official full names).
const SEASONS_CONFIG = {
    "2024_2025": [
        { id: "10392", name: "XII Campeonato Nacional da 1ª Divisão Masculina", url: "https://resultados.tugabasket.com/standings?competitionId=10392" },
        { id: "10487", name: "Campeonato Distrital 1ª Divisão Sub14 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=10487" },
        { id: "10478", name: "Campeonato Distrital 1ª Divisão Sub18 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=10478" },
        { id: "10476", name: "Campeonato Distrital Naismith Sub16 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=10476" }
    ],
    "2023_2024": [
        { id: "9970", name: "Campeonato Distrital 1ª Divisão Sub18 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9970" },
        { id: "9972", name: "Campeonato Distrital 1ª Divisão Sub16 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9972" },
        { id: "9974", name: "Campeonato Distrital 1ª Divisão Sub14 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9974" },
        { id: "9863", name: "XI Campeonato Nacional da 1ª Divisão Masculina", url: "https://resultados.tugabasket.com/standings?competitionId=9863" }
    ],
    "2022_2023": [
        { id: "9319", name: "X Campeonato Nacional da 1ª Divisão Masculina", url: "https://resultados.tugabasket.com/standings?competitionId=9319" },
        { id: "9415", name: "Campeonato Distrital 1ª Divisão Sub14 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9415" },
        { id: "9416", name: "Campeonato Distrital 1ª Divisão Sub16 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9416" },
        { id: "9417", name: "Campeonato Distrital 1ª Divisão Sub18 masculinos", url: "https://resultados.tugabasket.com/standings?competitionId=9417" }
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

async function scrapeSeason(seasonKey, competitions) {
    console.log(`--- Processing Season: ${seasonKey} ---`);

    // 0. Truncate table first to avoid duplicates
    const tableName = `classificacoes_${seasonKey}`;
    console.log(`  > Truncating table ${tableName}...`);

    const { error: truncateError } = await supabase
        .from(tableName)
        .delete()
        .gte('posicao', 0);

    if (truncateError) {
        console.error(`    Error truncating table: ${truncateError.message}`);
    } else {
        console.log(`    Table truncated.`);
    }

    const browser = await chromium.launch({ headless: true });
    // Use a desktop user agent to be safe
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    for (const competition of competitions) {
        const { url, id: competitionId } = competition;
        let competitionName = competition.name;

        console.log(`Navigating to: ${url}`);

        if (!competitionId) {
            console.error(`  No competitionId found`);
            continue;
        }

        try {
            await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

            if (!competitionName) {
                // Try to find title in h1 inside .header-title or similar
                try {
                    // Page Title Strategy: "Standings - X Competition - FPB"
                    const pageTitle = await page.title();
                    // Remove common suffixes/prefixes if possible
                    competitionName = pageTitle.replace('Standings - ', '').replace(' - FPB', '').trim();
                } catch (e) {
                    console.log('Error scraping title', e);
                    competitionName = "Unknown Competition";
                }
            }
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

                await page.goto(phaseUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });

                // Parse Table
                const table = page.locator('table.standings, table.table-striped').first();
                if (await table.count() === 0) {
                    // console.log(`    No table found for ${phase.name}`);
                    continue;
                }

                const rows = await table.locator('tbody tr').all();
                const parsedRows = [];
                let gaiaFound = false;

                for (const row of rows) {
                    const cols = await row.locator('td').all();
                    if (cols.length < 10) continue;

                    try {
                        const col0 = cols[0];
                        let pos = 0;
                        let teamName = "";

                        // Try specific selectors
                        const posEl = col0.locator('.t3');
                        if (await posEl.count() > 0) {
                            pos = cleanInt(await posEl.innerText());
                        } else {
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

                        let pts = 0;
                        if (cols.length >= 13) {
                            pts = cleanInt(await cols[12].innerText());
                        } else {
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
                        .from(tableName)
                        .insert(parsedRows);

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
    for (const [season, competitions] of Object.entries(SEASONS_CONFIG)) {
        await scrapeSeason(season, competitions);
    }
    console.log("Import complete.");
}

main().catch(console.error);

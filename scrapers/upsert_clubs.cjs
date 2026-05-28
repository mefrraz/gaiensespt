const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const SUPABASE_URL = "https://qdzmwgahencinoucvoop.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkem13Z2FoZW5jaW5vdWN2b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTA5MTMsImV4cCI6MjA2MjkyNjkxM30.uMkyku7r9NsNZ-QSUmGiU1BGhUMBhGzMP5I_iA7BC3U";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    const clubs = JSON.parse(fs.readFileSync("C:/Users/andre/OneDrive/Documentos/gaiensespt/scrapers/scraped_clubs_clean.json", "utf8"));
    console.log("Upserting " + clubs.length + " clubs...");
    let updated = 0, errors = 0;
    for (const club of clubs) {
        const isBlack = club.color === "#000000" || club.color === "#000" || club.color === "#FFFFFF";
        const r = await supabase.from("clubs").upsert({
            id: club.id,
            name: club.name,
            search_name: club.search,
            slug: club.slug,
            primary_color: isBlack ? "#7C3AED" : club.primary,
            logo_url: club.logo || null,
        }, { onConflict: "id" });
        if (r.error) { errors++; }
        else updated++;
        if (updated % 50 === 0) console.log("  " + updated + "/" + clubs.length);
    }
    console.log("Done: " + updated + " upserted, " + errors + " errors");
}
main();

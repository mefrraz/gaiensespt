const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

function decodeEntities(s) {
    return s.replace(/&#(\d+);/g, (_,d) => String.fromCharCode(parseInt(d)))
            .replace(/&ccedil;/g, 'ç').replace(/&Ccedil;/g, 'Ç')
            .replace(/&atilde;/g, 'ã').replace(/&Atilde;/g, 'Ã')
            .replace(/&otilde;/g, 'õ').replace(/&Otilde;/g, 'Õ')
            .replace(/&aacute;/g, 'á').replace(/&Aacute;/g, 'Á')
            .replace(/&eacute;/g, 'é').replace(/&Eacute;/g, 'É')
            .replace(/&iacute;/g, 'í').replace(/&Iacute;/g, 'Í')
            .replace(/&oacute;/g, 'ó').replace(/&Oacute;/g, 'Ó')
            .replace(/&uacute;/g, 'ú').replace(/&Uacute;/g, 'Ú')
            .replace(/&acirc;/g, 'â').replace(/&Acirc;/g, 'Â')
            .replace(/&ecirc;/g, 'ê').replace(/&Ecirc;/g, 'Ê')
            .replace(/&ocirc;/g, 'ô').replace(/&Ocirc;/g, 'Ô')
            .replace(/&agrave;/g, 'à').replace(/&ntilde;/g, 'ñ')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '-').replace(/&ndash;/g, '-')
            .replace(/\s+/g, ' ').trim();
}

const SUPABASE_URL = "https://qdzmwgahencinoucvoop.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkem13Z2FoZW5jaW5vdWN2b29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTA5MTMsImV4cCI6MjA2MjkyNjkxM30.uMkyku7r9NsNZ-QSUmGiU1BGhUMBhGzMP5I_iA7BC3U";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    const clubs = JSON.parse(fs.readFileSync("C:/Users/andre/OneDrive/Documentos/gaiensespt/scrapers/scraped_clubs_clean.json", "utf8"));
    let updated = 0, errors = 0;
    const batch = [];
    for (const club of clubs) {
        const name = decodeEntities(club.name);
        const isBlack = club.color === "#000000" || club.color === "#000" || club.color === "#FFFFFF";
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
        batch.push({ id: club.id, name, search_name: name.toLowerCase().replace(/[^a-z0-9]/g, ''), slug, primary_color: isBlack ? "#7C3AED" : club.primary, logo_url: club.logo || null });
    }
    console.log("Upserting " + batch.length + " clubs...");
    for (let i = 0; i < batch.length; i += 20) {
        const chunk = batch.slice(i, i + 20);
        const { error } = await supabase.from("clubs").upsert(chunk, { onConflict: "id" });
        if (error) { console.error("Batch " + i + " error: " + error.message); errors += chunk.length; }
        else { updated += chunk.length; if (i % 100 === 0) console.log("  " + Math.min(i + 20, batch.length) + "/" + batch.length); }
    }
    console.log("Done: " + updated + " upserted, " + errors + " errors");
}
main();

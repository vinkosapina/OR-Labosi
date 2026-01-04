const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');

// JSON download
router.get('/json', async (req, res) => {
  const { query, attribute } = req.query;
  const data = await fetchInstrumentData(query, attribute);
  res.setHeader('Content-Disposition', 'attachment; filename=instrumenti-filtrirani.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

// CSV download
router.get('/csv', async (req, res) => {
  const { query, attribute } = req.query;
  const data = await fetchInstrumentData(query, attribute);

  // priprema podataka za CSV (ravnanje ugnijezdenih polja)
  const flatData = data.map(item => ({
    nazivInstrumenta: item.nazivInstrumenta,
    vrsta: item.vrsta,
    žanrovi: item.žanrovi?.join(', ') || '',
    kljuc: item.kljuc,
    polifonija: item.polifonija,
    zemljaPodrijetla: item.zemljaPodrijetla,
    stoljeceNastanka: item.stoljeceNastanka,
    materijal: item.materijal,
    prosjecnaTezinaKg: item.prosjecnaTezinaKg,
    podvrste: item.podvrste?.map(p => `${p.nazivPodvrste} (${p.raspon})`).join(', ') || '',
    predstavnici: item.predstavnici?.map(p => `${p.ime} ${p.prezime}`).join(', ') || ''
  }));

  const parser = new Parser();
  const csv = parser.parse(flatData);

  res.setHeader('Content-Disposition', 'attachment; filename=instrumenti-filtrirani.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

// funkcija za dohvat podataka 
async function fetchInstrumentData(query, attribute) {
  const q = `%${query}%`;
  let values = [];
  let joins = `
    LEFT JOIN instrumentZanr iz ON i.nazivInstrumenta = iz.nazivInstrumenta
    LEFT JOIN podvrsta p ON i.nazivInstrumenta = p.nazivInstrumenta
    LEFT JOIN predstavnik pr ON i.nazivInstrumenta = pr.nazivInstrumenta
  `;
  let filter = '';

  if (query) {
    // posebne pretrage po atributima
    switch (attribute) {
      // ako je odabrano pretrazivanje po zanru...
      case 'žanrovi':
        joins = `
          INNER JOIN instrumentZanr iz ON i.nazivInstrumenta = iz.nazivInstrumenta
          LEFT JOIN podvrsta p ON i.nazivInstrumenta = p.nazivInstrumenta
          LEFT JOIN predstavnik pr ON i.nazivInstrumenta = pr.nazivInstrumenta
        `;
        filter = `WHERE iz.nazivZanra ILIKE $1`;
        values = [q];
        break;

      case 'podvrste':
        joins = `
          LEFT JOIN instrumentZanr iz ON i.nazivInstrumenta = iz.nazivInstrumenta
          INNER JOIN podvrsta p ON i.nazivInstrumenta = p.nazivInstrumenta
          LEFT JOIN predstavnik pr ON i.nazivInstrumenta = pr.nazivInstrumenta
        `;
        filter = `WHERE p.naziv ILIKE $1 OR p.raspon ILIKE $1`;
        values = [q];
        break;

      case 'predstavnici':
        joins = `
          LEFT JOIN instrumentZanr iz ON i.nazivInstrumenta = iz.nazivInstrumenta
          LEFT JOIN podvrsta p ON i.nazivInstrumenta = p.nazivInstrumenta
          INNER JOIN predstavnik pr ON i.nazivInstrumenta = pr.nazivInstrumenta
        `;
        filter = `WHERE pr.ime ILIKE $1 OR pr.prezime ILIKE $1`;
        values = [q];
        break;

      case '':
      case null:
        filter = `
          WHERE 
            i.nazivInstrumenta ILIKE $1 OR
            i.vrsta ILIKE $1 OR
            i.kljuc ILIKE $1 OR
            i.polifonija ILIKE $1 OR
            i.zemljaPodrijetla ILIKE $1 OR
            CAST(i.stoljeceNastanka AS TEXT) ILIKE $1 OR
            i.materijal ILIKE $1 OR
            CAST(i.prosjecnaTezinaKg AS TEXT) ILIKE $1 OR
            iz.nazivZanra ILIKE $1 OR
            p.naziv ILIKE $1 OR
            p.raspon ILIKE $1 OR
            pr.ime ILIKE $1 OR
            pr.prezime ILIKE $1
        `;
        values = [q];
        break;

      default:
        filter = `WHERE i.${attribute} ILIKE $1`;
        values = [q];
        break;
    }
  }

  // sql upit za izvoz podataka iz sa konacno definiranim spajanjem i filterima 
  const sql = `
    SELECT 
      i.*,
      COALESCE(json_agg(DISTINCT iz.nazivZanra) FILTER (WHERE iz.nazivZanra IS NOT NULL), '[]') AS "žanrovi",
      COALESCE(json_agg(DISTINCT jsonb_build_object('nazivPodvrste', p.naziv, 'raspon', p.raspon)) FILTER (WHERE p.naziv IS NOT NULL), '[]') AS "podvrste",
      COALESCE(json_agg(DISTINCT jsonb_build_object('ime', pr.ime, 'prezime', pr.prezime)) FILTER (WHERE pr.ime IS NOT NULL), '[]') AS "predstavnici"
    FROM instrument i
    ${joins}
    ${filter}
    GROUP BY i.nazivInstrumenta
  `;

  try {
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (err) {
    console.error('Greška pri dohvaćanju podataka:', err);
    return [];
  }
}


module.exports = router;

const express = require('express');
const router = express.Router();

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ORdb',
  password: 'postgres',
  port: 5432,
});

router.use(express.json());


router.get('/instrumenti', async (req, res) => {
  const { query } = req.query;
  let filter = '';
  let values = [];

  if (query) {
    filter = `WHERE (
      i.nazivinstrumenta ILIKE $1 OR
      i.vrsta ILIKE $1 OR
      i.kljuc ILIKE $1 OR
      i.polifonija ILIKE $1 OR
      i.zemljapodrijetla ILIKE $1 OR
      CAST(i.stoljecenastanka AS TEXT) ILIKE $1 OR
      i.materijal ILIKE $1 OR
      CAST(i.prosjecnatezinakg AS TEXT) ILIKE $1
    )`;
    values.push(`%${query}%`);
  }

  const sql = `
    SELECT
      i.nazivinstrumenta,
      i.vrsta,
      i.kljuc,
      i.polifonija,
      i.zemljapodrijetla,
      i.stoljecenastanka,
      i.materijal,
      i.prosjecnatezinakg,

      COALESCE(
        json_agg(DISTINCT iz.nazivzanra)
        FILTER (WHERE iz.nazivzanra IS NOT NULL),
        '[]'
      ) AS zanrovi,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'nazivPodvrste', pv.naziv,
            'raspon', pv.raspon
          )
        ) FILTER (WHERE pv.naziv IS NOT NULL),
        '[]'
      ) AS podvrste,

      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'ime', pr.ime,
            'prezime', pr.prezime
          )
        ) FILTER (WHERE pr.ime IS NOT NULL),
        '[]'
      ) AS predstavnici

    FROM instrument i
    LEFT JOIN instrumentzanr iz
      ON i.nazivinstrumenta = iz.nazivinstrumenta
    LEFT JOIN podvrsta pv
      ON i.nazivinstrumenta = pv.nazivinstrumenta
    LEFT JOIN predstavnik pr
      ON i.nazivinstrumenta = pr.nazivinstrumenta

    ${filter}

    GROUP BY
      i.nazivinstrumenta,
      i.vrsta,
      i.kljuc,
      i.polifonija,
      i.zemljapodrijetla,
      i.stoljecenastanka,
      i.materijal,
      i.prosjecnatezinakg
  `;

  try {
    const result = await pool.query(sql, values);
    return success(res, result.rows, 'Dohvaćena kolekcija instrumenata');
  } catch (err) {
    console.error(err);
    return error(res, 'Neuspješno dohvaćanje instrumenata');
  }
});


router.get('/instrumenti/vrsta/:vrsta', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instrument WHERE vrsta = $1',
      [req.params.vrsta]
    );


    return success(res, result.rows, 'Pronađeni instrumenti po vrsti');
  } catch (err) {
    return error(res, 'Greška pri filtriranju');
  }
});


router.get('/instrumenti/zemlja/:zemlja', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instrument WHERE zemljaPodrijetla = $1',
      [req.params.zemlja]
    );
    if (result.rowCount != 0)
      return success(res, result.rows, 'Instrumenti po zemlji');
    else
      return error(res, 'Ne postoje instrumenti za traženu zemlju.')
  } catch (err) {
    return error(res, 'Greška pri filtriranju');
  }
});


router.get('/instrumenti/stoljece/:st', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM instrument WHERE stoljeceNastanka = $1',
      [req.params.st]
    );
    if (result.rowCount != 0)
      return success(res, result.rows, 'Instrumenti po stoljeću');
    else
      return error(res, 'Ne postoje instrumenti za traženo stoljeće.')
  } catch (err) {
    return error(res, 'Greška pri filtriranju');
  }
});


router.post('/instrumenti', async (req, res) => {
  const {
    nazivInstrumenta,
    vrsta,
    kljuc,
    polifonija,
    zemljaPodrijetla,
    stoljeceNastanka,
    materijal,
    prosjecnaTezinaKg
  } = req.body;
  try {
    await pool.query(
      `INSERT INTO instrument VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [nazivInstrumenta, vrsta, kljuc, polifonija,
        zemljaPodrijetla, stoljeceNastanka, materijal, prosjecnaTezinaKg]
    );
    return success(res, null, 'Instrument dodan');
  } catch (err) {
    return error(res, 'Neuspješan unos', 400);
  }
});


router.put('/instrumenti/:naziv', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE instrument SET vrsta=$1 WHERE nazivInstrumenta=$2',
      [req.body.vrsta, req.params.naziv]
    );
    if (result.rowCount === 0) {
      return error(res, 'Instrument ne postoji', 404);
    }
    return success(res, null, 'Instrument ažuriran');
  } catch (err) {
    return error(res, 'Greška pri ažuriranju');
  }
});


router.delete('/instrumenti/:naziv', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM instrument WHERE nazivInstrumenta=$1',
      [req.params.naziv]
    );
    if (result.rowCount === 0) {
      return error(res, 'Instrument ne postoji', 404);
    }
    return success(res, null, 'Instrument obrisan');
  } catch (err) {
    return error(res, 'Greška pri brisanju');
  }
});


function success(res, data, message = 'OK') {
  return res.status(200).json({
    status: 'success',
    message,
    response: data
  });
}

function error(res, message = 'Greška', code = 500) {
  return res.status(code).json({
    status: 'error',
    message,
    response: null
  });
}

module.exports = router;
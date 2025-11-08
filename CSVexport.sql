SELECT
    i.nazivInstrumenta,
    i.vrsta,
    i.kljuc,
    i.polifonija,
    i.zemljaPodrijetla,
    i.stoljeceNastanka,
    i.materijal,
    i.prosjecnaTezinaKg,
    'predstavnik' AS tip_odnosa,
    pr.ime AS vrijednost1,
    pr.prezime AS vrijednost2
FROM instrument i
JOIN predstavnik pr ON i.nazivInstrumenta = pr.nazivInstrumenta

UNION ALL

SELECT
    i.nazivInstrumenta,
    i.vrsta,
    i.kljuc,
    i.polifonija,
    i.zemljaPodrijetla,
    i.stoljeceNastanka,
    i.materijal,
    i.prosjecnaTezinaKg,
    'podvrsta' AS tip_odnosa,
    p.naziv AS vrijednost1,
    p.raspon AS vrijednost2
FROM instrument i
JOIN podvrsta p ON i.nazivInstrumenta = p.nazivInstrumenta

UNION ALL

SELECT
    i.nazivInstrumenta,
    i.vrsta,
    i.kljuc,
    i.polifonija,
    i.zemljaPodrijetla,
    i.stoljeceNastanka,
    i.materijal,
    i.prosjecnaTezinaKg,
    'žanr' AS tip_odnosa,
    z.nazivZanra AS vrijednost1,
    NULL AS vrijednost2
FROM instrument i
JOIN instrumentZanr z ON i.nazivInstrumenta = z.nazivInstrumenta

ORDER BY nazivInstrumenta, tip_odnosa, vrijednost1;
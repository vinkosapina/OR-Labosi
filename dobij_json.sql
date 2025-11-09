SELECT json_agg(
    json_build_object(
        'naziv', i.nazivInstrumenta,
        'vrsta', i.vrsta,
        'žanrovi', (
            SELECT array_agg(z.naziv)
            FROM instrumentZanr iz
            WHERE iz.nazivInstrumenta = i.nazivInstrumenta
        ),
        'ključ', i.kljuc,
        'polifonija', i.polifonija,
        'zemljaPodrijetla', i.zemljaPodrijetla,
        'stoljećeNastanka', i.stoljeceNastanka,
        'materijal', i.materijal,
        'prosječnaTežinaKg', i.prosjecnaTezinaKg,
        'podvrste', (
            SELECT array_agg(
                json_build_object('nazivPodvrste', p.naziv, 'raspon', p.raspon)
            )
            FROM podvrsta p
            WHERE p.nazivInstrumenta = i.nazivInstrumenta
        ),
        'predstavnici', (
            SELECT json_agg(
                json_build_object('ime', pr.ime, 'prezime', pr.Prezime)
            )
            FROM predstavnik pr
            WHERE pr.nazivInstrumenta = i.nazivInstrumenta
        )
    )
) AS instrumenti
FROM instrumenti i;
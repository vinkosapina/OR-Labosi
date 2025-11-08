--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Homebrew)
-- Dumped by pg_dump version 17.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: instrument; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrument (
    nazivinstrumenta character varying(20) NOT NULL,
    vrsta character varying(20),
    kljuc character(1),
    polifonija character(7),
    zemljapodrijetla character varying(20),
    stoljecenastanka integer,
    materijal character varying(20),
    prosjecnatezinakg real,
    CONSTRAINT chkkljuc CHECK ((kljuc = ANY (ARRAY['G'::bpchar, 'F'::bpchar, 'C'::bpchar]))),
    CONSTRAINT chkpolifonija CHECK ((polifonija = ANY (ARRAY['monofon'::bpchar, 'polifon'::bpchar]))),
    CONSTRAINT chkstoljece CHECK ((stoljecenastanka <= 21))
);


ALTER TABLE public.instrument OWNER TO postgres;

--
-- Name: instrumentzanr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instrumentzanr (
    nazivzanra character varying(20) NOT NULL,
    nazivinstrumenta character varying(20) NOT NULL
);


ALTER TABLE public.instrumentzanr OWNER TO postgres;

--
-- Name: podvrsta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.podvrsta (
    naziv character varying(20) NOT NULL,
    raspon character varying(7),
    nazivinstrumenta character varying(20),
    CONSTRAINT chkraspon CHECK (((raspon)::text ~~ '%-%'::text))
);


ALTER TABLE public.podvrsta OWNER TO postgres;

--
-- Name: predstavnik; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.predstavnik (
    ime character varying(20) NOT NULL,
    prezime character varying(20) NOT NULL,
    nazivinstrumenta character varying(20)
);


ALTER TABLE public.predstavnik OWNER TO postgres;

--
-- Data for Name: instrument; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrument (nazivinstrumenta, vrsta, kljuc, polifonija, zemljapodrijetla, stoljecenastanka, materijal, prosjecnatezinakg) FROM stdin;
Trombon	puhački	F	monofon	Engleska	16	lim	2
Violina	gudački	G	monofon	Italija	16	drvo	0.5
Klavir	žičani	\N	polifon	Italija	17	razni	400
Gitara	žičani	G	polifon	nepoznato	\N	drvo	2.5
Violončelo	žičani	F	monofon	Italija	16	drvo	3
Kontrabas	žičani	F	monofon	Europa	15	drvo	10
Truba	puhački	G	monofon	Egipat	-20	lim	1.1
Viola	gudački	C	monofon	Italija	16	drvo	0.7
Klarinet	puhački	G	monofon	Njemačka	18	drvo	0.6
Flauta	puhački	G	monofon	Slovenija	-430	lim	0.6
Tuba	puhački	F	monofon	Njemačka	19	lim	13
\.


--
-- Data for Name: instrumentzanr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instrumentzanr (nazivzanra, nazivinstrumenta) FROM stdin;
jazz	Trombon
blues	Trombon
klasika	Violina
razni	Klavir
razni	Gitara
klasika	Violončelo
razni	Kontrabas
jazz	Truba
klasika	Truba
klasika	Klarinet
klasika	Flauta
klasika	Tuba
\.


--
-- Data for Name: podvrsta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.podvrsta (naziv, raspon, nazivinstrumenta) FROM stdin;
Bas trombon	F1-F4	Trombon
Tenor trombon	E2-F5	Trombon
Alt trombon	A2-Eb5	Trombon
Klasična	E2-E6	Gitara
Akustična	E2-E6	Gitara
Električna	E2-E6	Gitara
\.


--
-- Data for Name: predstavnik; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.predstavnik (ime, prezime, nazivinstrumenta) FROM stdin;
Joseph	Alessi	Trombon
Wycliffe	Gordon	Trombon
Ian	Bousfield	Trombon
Joshua	Bell	Violina
Nicola	Benedetti	Violina
Niccolo	Paganini	Violina
Sergey	Rachmaninov	Klavir
Jimi	Hendrix	Gitara
Mstislav	Rostropovich	Violončelo
Ray	Brown	Kontrabas
Louis	Armstrong	Truba
Wolfgang Amadeus	Mozart	Viola
Benny	Goodman	Klarinet
James	Galway	Flauta
Arnold	Jacobs	Tuba
\.


--
-- Name: instrument instrument_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_pkey PRIMARY KEY (nazivinstrumenta);


--
-- Name: instrumentzanr instrumentzanr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrumentzanr
    ADD CONSTRAINT instrumentzanr_pkey PRIMARY KEY (nazivinstrumenta, nazivzanra);


--
-- Name: podvrsta podvrsta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.podvrsta
    ADD CONSTRAINT podvrsta_pkey PRIMARY KEY (naziv);


--
-- Name: predstavnik predstavnik_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predstavnik
    ADD CONSTRAINT predstavnik_pkey PRIMARY KEY (ime, prezime);


--
-- Name: instrumentzanr instrumentzanr_nazivinstrumenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instrumentzanr
    ADD CONSTRAINT instrumentzanr_nazivinstrumenta_fkey FOREIGN KEY (nazivinstrumenta) REFERENCES public.instrument(nazivinstrumenta) ON DELETE CASCADE;


--
-- Name: podvrsta podvrsta_nazivinstrumenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.podvrsta
    ADD CONSTRAINT podvrsta_nazivinstrumenta_fkey FOREIGN KEY (nazivinstrumenta) REFERENCES public.instrument(nazivinstrumenta) ON DELETE CASCADE;


--
-- Name: predstavnik predstavnik_nazivinstrumenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.predstavnik
    ADD CONSTRAINT predstavnik_nazivinstrumenta_fkey FOREIGN KEY (nazivinstrumenta) REFERENCES public.instrument(nazivinstrumenta) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


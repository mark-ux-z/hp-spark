export type Partner = {
  name: string;
  city: string;
  code: string; // ISO country code for display
};

// Hardcoded HP Indigo–certified print partners per European country
export const PARTNERS_BY_COUNTRY: Record<string, Partner[]> = {
  "United Kingdom": [
    { name: "Precision Colour Printing",   city: "Telford",     code: "GB" },
    { name: "Bluetree Group",              city: "Sheffield",   code: "GB" },
    { name: "Paragon Packaging Solutions", city: "London",      code: "GB" },
    { name: "Amberley Print & Pack",       city: "Manchester",  code: "GB" },
  ],
  "Germany": [
    { name: "Saxoprint Indigo GmbH",       city: "Dresden",     code: "DE" },
    { name: "Westermann Druck AG",         city: "Brunswick",   code: "DE" },
    { name: "Mohn Media Packaging",        city: "Gütersloh",   code: "DE" },
    { name: "Onlineprinters GmbH",         city: "Neustadt",    code: "DE" },
  ],
  "France": [
    { name: "Imprimerie Chirat",           city: "Saint-Just",  code: "FR" },
    { name: "Groupe Couverture Print",     city: "Paris",       code: "FR" },
    { name: "Atelier Mordancé",            city: "Lyon",        code: "FR" },
    { name: "Packlabel Bretagne",          city: "Rennes",      code: "FR" },
  ],
  "Italy": [
    { name: "Grafiche Garattoni",          city: "Bologna",     code: "IT" },
    { name: "Printcolor AG Italia",        city: "Milan",       code: "IT" },
    { name: "Tipografia Artistica Fiorentina", city: "Florence", code: "IT" },
    { name: "RotoPackaging Sud",           city: "Naples",      code: "IT" },
  ],
  "Spain": [
    { name: "Indugraf",                    city: "Barcelona",   code: "ES" },
    { name: "Artes Gráficas Palermo",      city: "Madrid",      code: "ES" },
    { name: "Packprint Ibérica",           city: "Valencia",    code: "ES" },
    { name: "Gráficas Anduriña",           city: "Vigo",        code: "ES" },
  ],
  "Netherlands": [
    { name: "Drukkerij Tielen",            city: "Amsterdam",   code: "NL" },
    { name: "Van Loon Packaging B.V.",     city: "Rotterdam",   code: "NL" },
    { name: "Ando Indigo Print",           city: "Eindhoven",   code: "NL" },
  ],
  "Belgium": [
    { name: "Drukkerij Lannoo NV",         city: "Tielt",       code: "BE" },
    { name: "Brepols Packaging Group",     city: "Turnhout",    code: "BE" },
    { name: "Cartima Print Solutions",     city: "Brussels",    code: "BE" },
  ],
  "Sweden": [
    { name: "Göteborgstryckeriet AB",      city: "Gothenburg",  code: "SE" },
    { name: "Strokirk-Landströms",         city: "Lidköping",   code: "SE" },
    { name: "Ineko Packaging",             city: "Stockholm",   code: "SE" },
  ],
  "Norway": [
    { name: "Printcom AS",                 city: "Oslo",        code: "NO" },
    { name: "07-Gruppen",                  city: "Stavanger",   code: "NO" },
    { name: "Lundblad Grafisk AS",         city: "Bergen",      code: "NO" },
  ],
  "Denmark": [
    { name: "Rosendahls A/S",              city: "Esbjerg",     code: "DK" },
    { name: "Scanprint A/S",               city: "Copenhagen",  code: "DK" },
    { name: "Nofoprint ApS",               city: "Aarhus",      code: "DK" },
  ],
  "Finland": [
    { name: "PunaMusta Oy",                city: "Joensuu",     code: "FI" },
    { name: "Next Print Helsinki",         city: "Helsinki",    code: "FI" },
    { name: "Forssa Print Oy",             city: "Forssa",      code: "FI" },
  ],
  "Switzerland": [
    { name: "Printcolor AG",               city: "Berikon",     code: "CH" },
    { name: "Stämpfli AG Packaging",       city: "Bern",        code: "CH" },
    { name: "Mattenbach Druck",            city: "Winterthur",  code: "CH" },
  ],
  "Austria": [
    { name: "Berger Printgroup",           city: "Horn",        code: "AT" },
    { name: "Holzhausen Druck GmbH",       city: "Vienna",      code: "AT" },
    { name: "Alpendruck Innsbruck",        city: "Innsbruck",   code: "AT" },
  ],
  "Portugal": [
    { name: "Multitema Gráfica",           city: "Lisbon",      code: "PT" },
    { name: "Gráfica Porto Print",         city: "Porto",       code: "PT" },
    { name: "Riocolor Packaging",          city: "Braga",       code: "PT" },
  ],
  "Poland": [
    { name: "Zakłady Graficzne Print24",   city: "Warsaw",      code: "PL" },
    { name: "Drukarnia Perfekt",           city: "Kraków",      code: "PL" },
    { name: "ColorDruck Wrocław",          city: "Wrocław",     code: "PL" },
  ],
  "Czech Republic": [
    { name: "Tiskárna Helbich a.s.",       city: "Brno",        code: "CZ" },
    { name: "Reprocentrum Print",          city: "Prague",      code: "CZ" },
    { name: "Typodesign Olomouc",          city: "Olomouc",     code: "CZ" },
  ],
  "Ireland": [
    { name: "Watermans Print & Pack",      city: "Dublin",      code: "IE" },
    { name: "Kilkenny Packaging Ltd",      city: "Kilkenny",    code: "IE" },
    { name: "Celtic Colour Print",         city: "Cork",        code: "IE" },
  ],
  "Greece": [
    { name: "Pressious Arvanitidis",       city: "Athens",      code: "GR" },
    { name: "Alfa Print SA",               city: "Thessaloniki",code: "GR" },
    { name: "Malliaris Paideia",           city: "Athens",      code: "GR" },
  ],
  "Hungary": [
    { name: "Pauker Nyomda Kft.",          city: "Budapest",    code: "HU" },
    { name: "Multiprint Kft.",             city: "Debrecen",    code: "HU" },
    { name: "Sokszorosító Kft.",           city: "Pécs",        code: "HU" },
  ],
  "Romania": [
    { name: "Tipografia Intact",           city: "Bucharest",   code: "RO" },
    { name: "ColorPrint SRL",              city: "Cluj-Napoca", code: "RO" },
    { name: "Print Studio Iași",           city: "Iași",        code: "RO" },
  ],
};

export const EUROPEAN_COUNTRIES = Object.keys(PARTNERS_BY_COUNTRY).sort();

export function getPartnersForCountries(countries: string[]): Partner[] {
  return countries.flatMap((c) => PARTNERS_BY_COUNTRY[c] ?? []);
}

const contacts = [
  { nom: "Ben Ali",   prenom: "Youssef", email: "youssef.benali@example.tn",  telephone: "20112340", adresse: "Avenue Habib Bourguiba, Nabeul" },
  { nom: "Trabelsi",  prenom: "Amira",   email: "amira.trabelsi@example.tn",  telephone: "22458910", adresse: "Rue de la République, Hammamet" },
  { nom: "Gharbi",    prenom: "Mehdi",   email: "mehdi.gharbi@example.tn",    telephone: "50321765", adresse: "Cité El Wafa, Dar Chaabane El Fehri" },
  { nom: "Mansouri",  prenom: "Salma",   email: "salma.mansouri@example.tn",  telephone: "98654321", adresse: "Avenue Farhat Hached, Nabeul" },
  { nom: "Khelifi",   prenom: "Karim",   email: "karim.khelifi@example.tn",   telephone: "24789012", adresse: "Route de Tunis, Mrezga, Nabeul" },
  { nom: "Jaziri",    prenom: "Inès",    email: "ines.jaziri@example.tn",     telephone: "55890123", adresse: "Avenue de l'Environnement, Kelibia" },
  { nom: "Chebbi",    prenom: "Rami",    email: "rami.chebbi@example.tn",     telephone: "29543210", adresse: "Cité des Jardins, Korba" },
  { nom: "Hamdi",     prenom: "Leila",   email: "leila.hamdi@example.tn",     telephone: "21987654", adresse: "Rue Ibn Khaldoun, Soliman" },
  { nom: "Sfar",      prenom: "Walid",   email: "walid.sfar@example.tn",      telephone: "52135790", adresse: "Avenue Yasser Arafat, Sousse" },
  { nom: "Bouazizi",  prenom: "Nour",    email: "nour.bouazizi@example.tn",   telephone: "27246810", adresse: "La Marsa, Tunis" },
];

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

(async () => {
  console.log(`🌱 Seed → ${BASE_URL}/api/contacts\n`);
  let ok = 0;
  for (const c of contacts) {
    try {
      const res = await fetch(`${BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${c.prenom} ${c.nom} (id=${data.id ?? data.insertId ?? '?'})`);
        ok++;
      } else {
        const txt = await res.text();
        console.error(`❌ ${c.prenom} ${c.nom} → HTTP ${res.status}: ${txt}`);
      }
    } catch (err) {
      console.error(`❌ ${c.prenom} ${c.nom} → ${err.message}`);
    }
  }
  console.log(`\n🏁 ${ok}/${contacts.length} contacts insérés.`);
})();

// Vitrine publique BSIP — site statique, sans framework ni dépendance.
// Les données (data/produits.json) et les photos (photos/) sont régénérées
// par PUBLIER-VITRINE.bat à chaque publication depuis le logiciel BSIP.

// Chaque catégorie technique du logiciel (categorie en base) est rangée ici
// sous l'une des 4 grandes familles affichées sur la vitrine, avec un libellé
// plus lisible et la couleur de repérage de sa famille. Pour ajouter une
// nouvelle famille de produits (ex: Automobile), il suffit d'ajouter ses
// catégories techniques ici une fois qu'elles existent dans le logiciel.
const INFOS_CATEGORIE = {
  HIKVISION: { principale: 'SECURITE', sousLibelle: 'Caméras Hikvision' },
  DAHUA: { principale: 'SECURITE', sousLibelle: 'Caméras Dahua' },
  CAMERA: { principale: 'SECURITE', sousLibelle: 'Caméras' },
  STOCKAGE: { principale: 'INFORMATIQUE', sousLibelle: 'Stockage' },
  CONNECTIQUE: { principale: 'INFORMATIQUE', sousLibelle: 'Connectique' },
  RESEAU: { principale: 'INFORMATIQUE', sousLibelle: 'Réseau' },
  PC: { principale: 'INFORMATIQUE', sousLibelle: 'Ordinateurs' },
  PC_PORTABLE: { principale: 'INFORMATIQUE', sousLibelle: 'PC portables' },
  PC_FIXE: { principale: 'INFORMATIQUE', sousLibelle: 'PC de bureau' },
  TELEPHONE: { principale: 'HIGH_TECH', sousLibelle: 'Téléphones' },
  IMPRIMANTE: { principale: 'INFORMATIQUE', sousLibelle: 'Imprimantes' },
  LOGICIEL: { principale: 'INFORMATIQUE', sousLibelle: 'Logiciels' },
  ACCESSOIRE: { principale: 'INFORMATIQUE', sousLibelle: 'Accessoires' },
};

// Les 4 grandes familles, toujours affichées dans cet ordre — même sans
// article dedans pour l'instant (ex: Automobile), pour montrer l'étendue
// des activités de BSIP.
const CATEGORIES_PRINCIPALES = [
  { code: 'INFORMATIQUE', libelle: 'Informatique et Dépannage', couleur: '#2f5aa8' },
  { code: 'HIGH_TECH', libelle: 'High-Tech et Audio', couleur: '#c9a24a' },
  { code: 'SECURITE', libelle: 'Sécurité et Domotique', couleur: '#b3452c' },
  { code: 'AUTOMOBILE', libelle: 'Automobile', couleur: '#5c6670' },
];

const NUMERO_WHATSAPP = '2250716300000';

let tousLesProduits = [];
let principaleActive = 'TOUT';
let sousCategorieActive = 'TOUTE';
let texteRecherche = '';

document.getElementById('annee').textContent = new Date().getFullYear();

async function chargerProduits() {
  const grille = document.getElementById('grille-produits');
  try {
    const reponse = await fetch('data/produits.json', { cache: 'no-store' });
    if (!reponse.ok) throw new Error('Fichier de données introuvable');
    const donnees = await reponse.json();
    tousLesProduits = donnees.produits || [];
    construireCategories();
    afficherProduits();
  } catch (erreur) {
    grille.innerHTML = '<p class="vide">Le catalogue n\'a pas pu être chargé pour le moment. Contactez-nous directement sur WhatsApp.</p>';
    console.error(erreur);
  }
}

function principaleDe(categorie) {
  return (INFOS_CATEGORIE[categorie] && INFOS_CATEGORIE[categorie].principale) || 'INFORMATIQUE';
}

function construireCategories() {
  const nav = document.getElementById('categories');
  nav.innerHTML = '';

  const boutonTout = document.createElement('button');
  boutonTout.className = 'categorie actif';
  boutonTout.dataset.principale = 'TOUT';
  boutonTout.textContent = 'Tout';
  boutonTout.addEventListener('click', () => choisirPrincipale('TOUT'));
  nav.appendChild(boutonTout);

  for (const cat of CATEGORIES_PRINCIPALES) {
    const bouton = document.createElement('button');
    bouton.className = 'categorie';
    bouton.dataset.principale = cat.code;
    bouton.style.setProperty('--cat-couleur', cat.couleur);
    bouton.textContent = cat.libelle;
    bouton.addEventListener('click', () => choisirPrincipale(cat.code));
    nav.appendChild(bouton);
  }
}

function choisirPrincipale(code) {
  principaleActive = code;
  sousCategorieActive = 'TOUTE';
  document.querySelectorAll('#categories .categorie').forEach((b) => {
    b.classList.toggle('actif', b.dataset.principale === code);
  });
  construireSousCategories();
  afficherProduits();
}

function construireSousCategories() {
  const nav = document.getElementById('sous-categories');
  nav.innerHTML = '';

  if (principaleActive === 'TOUT') {
    nav.hidden = true;
    return;
  }

  // Sous-catégories réellement présentes dans le catalogue actuel, pour cette famille.
  const sousCodesPresents = [...new Set(
    tousLesProduits
      .filter((p) => principaleDe(p.categorie) === principaleActive)
      .map((p) => p.categorie)
  )];

  if (sousCodesPresents.length === 0) {
    nav.hidden = true;
    return;
  }

  nav.hidden = false;

  const boutonToute = document.createElement('button');
  boutonToute.className = 'sous-categorie actif';
  boutonToute.dataset.sous = 'TOUTE';
  boutonToute.textContent = 'Toutes';
  boutonToute.addEventListener('click', () => choisirSousCategorie('TOUTE'));
  nav.appendChild(boutonToute);

  for (const code of sousCodesPresents) {
    const bouton = document.createElement('button');
    bouton.className = 'sous-categorie';
    bouton.dataset.sous = code;
    bouton.textContent = (INFOS_CATEGORIE[code] && INFOS_CATEGORIE[code].sousLibelle) || code;
    bouton.addEventListener('click', () => choisirSousCategorie(code));
    nav.appendChild(bouton);
  }
}

function choisirSousCategorie(code) {
  sousCategorieActive = code;
  document.querySelectorAll('#sous-categories .sous-categorie').forEach((b) => {
    b.classList.toggle('actif', b.dataset.sous === code);
  });
  afficherProduits();
}

function normaliser(texte) {
  return (texte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function produitsFiltres() {
  return tousLesProduits.filter((p) => {
    if (principaleActive !== 'TOUT' && principaleDe(p.categorie) !== principaleActive) return false;
    if (sousCategorieActive !== 'TOUTE' && p.categorie !== sousCategorieActive) return false;
    if (texteRecherche) {
      const cible = normaliser(`${p.nom} ${p.marque || ''} ${p.reference || ''}`);
      if (!cible.includes(texteRecherche)) return false;
    }
    return true;
  });
}

function afficherProduits() {
  const grille = document.getElementById('grille-produits');
  const liste = produitsFiltres();

  if (liste.length === 0) {
    grille.innerHTML = '<p class="vide">Aucun article ne correspond pour le moment. Contactez-nous sur WhatsApp, nous avons peut-être ce qu\'il vous faut en stock.</p>';
    return;
  }

  grille.innerHTML = '';
  for (const produit of liste) {
    grille.appendChild(carteProduit(produit));
  }
}

function libelleCategorie(categorie) {
  return (INFOS_CATEGORIE[categorie] && INFOS_CATEGORIE[categorie].sousLibelle) || categorie;
}

function carteProduit(produit) {
  const carte = document.createElement('article');
  carte.className = 'carte-produit';
  carte.addEventListener('click', () => ouvrirFiche(produit));

  const photo = produit.photos && produit.photos.length > 0
    ? `<div class="carte-photo"><img src="${produit.photos[0]}" alt="${echapper(produit.nom)}" loading="lazy"></div>`
    : `<div class="carte-photo sans-photo">📦</div>`;

  carte.innerHTML = `
    ${photo}
    <div class="carte-corps">
      <p class="carte-categorie">${libelleCategorie(produit.categorie)}</p>
      <h3 class="carte-nom">${echapper(produit.nom)}</h3>
      <p class="carte-marque">${echapper(produit.marque || '')}</p>
    </div>
  `;
  return carte;
}

function ouvrirFiche(produit) {
  const fond = document.getElementById('fiche-fond');
  const fiche = document.getElementById('fiche');

  const galerie = (produit.photos && produit.photos.length > 0)
    ? `<div class="fiche-galerie">${produit.photos.map((p) => `<img src="${p}" alt="${echapper(produit.nom)}">`).join('')}</div>`
    : '';

  const messageWhatsApp = encodeURIComponent(
    `Bonjour BSIP, je suis intéressé(e) par : ${produit.nom}${produit.reference ? ' (réf. ' + produit.reference + ')' : ''}. Quel est le prix et la disponibilité ?`
  );

  fiche.innerHTML = `
    <button class="fiche-fermer" aria-label="Fermer">✕</button>
    ${galerie}
    <h2>${echapper(produit.nom)}</h2>
    <p class="fiche-meta">${libelleCategorie(produit.categorie)} · ${echapper(produit.marque || '')}${produit.reference ? ' · Réf. ' + echapper(produit.reference) : ''}</p>
    ${produit.description ? `<p>${echapper(produit.description)}</p>` : ''}
    ${produit.caracteristiques ? `<p>${echapper(produit.caracteristiques)}</p>` : ''}
    <a class="fiche-bouton" href="https://wa.me/${NUMERO_WHATSAPP}?text=${messageWhatsApp}" target="_blank" rel="noopener">
      Demander le prix sur WhatsApp
    </a>
  `;

  fiche.querySelector('.fiche-fermer').addEventListener('click', fermerFiche);
  fond.hidden = false;
}

function fermerFiche() {
  document.getElementById('fiche-fond').hidden = true;
}

document.getElementById('fiche-fond').addEventListener('click', (e) => {
  if (e.target.id === 'fiche-fond') fermerFiche();
});

document.getElementById('recherche').addEventListener('input', (e) => {
  texteRecherche = normaliser(e.target.value.trim());
  afficherProduits();
});

function echapper(texte) {
  const div = document.createElement('div');
  div.textContent = texte || '';
  return div.innerHTML;
}

chargerProduits();

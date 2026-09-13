// Vitrine publique BSIP — site statique, sans framework ni dépendance.
// Les données (data/produits.json) et les photos (photos/) sont régénérées
// par PUBLIER-VITRINE.bat à chaque publication depuis le logiciel BSIP.

const LIBELLES_CATEGORIE = {
  HIKVISION: 'Hikvision',
  DAHUA: 'Dahua',
  CAMERA: 'Caméras',
  STOCKAGE: 'Stockage',
  CONNECTIQUE: 'Connectique',
  RESEAU: 'Réseau',
  PC: 'Ordinateurs',
  PC_PORTABLE: 'PC portables',
  PC_FIXE: 'PC de bureau',
  TELEPHONE: 'Téléphones',
  IMPRIMANTE: 'Imprimantes',
  LOGICIEL: 'Logiciels',
  ACCESSOIRE: 'Accessoires',
};

const NUMERO_WHATSAPP = '2250716300000';

let tousLesProduits = [];
let categorieActive = 'TOUT';

document.getElementById('annee').textContent = new Date().getFullYear();

async function chargerProduits() {
  const grille = document.getElementById('grille-produits');
  try {
    const reponse = await fetch('data/produits.json', { cache: 'no-store' });
    if (!reponse.ok) throw new Error('Fichier de données introuvable');
    const donnees = await reponse.json();
    tousLesProduits = donnees.produits || [];
    construireFiltres();
    afficherProduits();
  } catch (erreur) {
    grille.innerHTML = '<p class="vide">Le catalogue n\'a pas pu être chargé pour le moment. Contactez-nous directement sur WhatsApp.</p>';
    console.error(erreur);
  }
}

function construireFiltres() {
  const nav = document.getElementById('filtres');
  const categoriesPresentes = [...new Set(tousLesProduits.map((p) => p.categorie))];

  for (const cat of categoriesPresentes) {
    const bouton = document.createElement('button');
    bouton.className = 'filtre';
    bouton.dataset.categorie = cat;
    bouton.textContent = LIBELLES_CATEGORIE[cat] || cat;
    bouton.addEventListener('click', () => {
      categorieActive = cat;
      document.querySelectorAll('.filtre').forEach((b) => b.classList.remove('actif'));
      bouton.classList.add('actif');
      afficherProduits();
    });
    nav.appendChild(bouton);
  }

  document.querySelector('.filtre[data-categorie="TOUT"]').addEventListener('click', (e) => {
    categorieActive = 'TOUT';
    document.querySelectorAll('.filtre').forEach((b) => b.classList.remove('actif'));
    e.target.classList.add('actif');
    afficherProduits();
  });
}

function afficherProduits() {
  const grille = document.getElementById('grille-produits');
  const liste = categorieActive === 'TOUT'
    ? tousLesProduits
    : tousLesProduits.filter((p) => p.categorie === categorieActive);

  if (liste.length === 0) {
    grille.innerHTML = '<p class="vide">Aucun article dans cette catégorie pour le moment.</p>';
    return;
  }

  grille.innerHTML = '';
  for (const produit of liste) {
    grille.appendChild(carteProduit(produit));
  }
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
      <p class="carte-categorie">${LIBELLES_CATEGORIE[produit.categorie] || produit.categorie}</p>
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
    <p class="fiche-meta">${LIBELLES_CATEGORIE[produit.categorie] || produit.categorie} · ${echapper(produit.marque || '')}${produit.reference ? ' · Réf. ' + echapper(produit.reference) : ''}</p>
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

function echapper(texte) {
  const div = document.createElement('div');
  div.textContent = texte || '';
  return div.innerHTML;
}

chargerProduits();

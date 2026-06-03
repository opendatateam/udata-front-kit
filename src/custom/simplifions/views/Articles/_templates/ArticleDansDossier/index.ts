export const themeMeta = {
  id: 'mon-dossier',           // identifiant unique, slug avec tirets → URL : /guides/mon-dossier
  label: 'Mon dossier',        // kicker affiché dans chaque article du dossier
  title: 'Titre du dossier',   // affiché dans la page dossier et la tuile /guides
  description: 'Description affichée sous le titre du dossier.',
  children: ['mon-article']    // liste des id des articles du dossier
}

# Documentation des Fonctionnalités Natives CKEditor 5 v19

Cette documentation liste toutes les fonctionnalités natives disponibles dans CKEditor 5 version 19.0.0, telles qu'elles sont configurées dans ce projet.

## 📋 Table des matières

1. [Plugins Core](#plugins-core)
2. [Édition de texte de base](#édition-de-texte-de-base)
3. [Styles de base](#styles-de-base)
4. [Formatage avancé](#formatage-avancé)
5. [Gestion des listes](#gestion-des-listes)
6. [Images](#images)
7. [Tableaux](#tableaux)
8. [Liens](#liens)
9. [Alignement](#alignement)
10. [Polices](#polices)
11. [Annulation/Refaire](#annulationrefaire)
12. [Fonctionnalités additionnelles disponibles](#fonctionnalités-additionnelles-disponibles)

---

## Plugins Core

### Essentials
Le plugin `Essentials` regroupe les fonctionnalités essentielles de l'éditeur :
- **Clipboard** : Copier, couper, coller
- **Enter** : Gestion des retours à la ligne (Entrée)
- **ShiftEnter (SoftBreak)** : Retour à la ligne sans nouveau paragraphe
- **SelectAll** : Sélectionner tout le contenu (Ctrl/Cmd + A)
- **Typing** : Gestion de la saisie de texte
- **Undo** : Annulation des actions

### Paragraph
Gestion des paragraphes de texte standard.

---

## Édition de texte de base

### Heading (Titres)
Gestion des différents niveaux de titres (H1 à H6).

**Commandes disponibles :**
- `heading` : Changer le niveau de titre
- Options : `heading1`, `heading2`, `heading3`, `heading4`, `heading5`, `heading6`

**Configuration :**
```typescript
heading: {
  options: [
    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
    // ... etc
  ]
}
```

---

## Styles de base

### Bold (Gras)
**Commande :** `bold`
**Raccourci :** `Ctrl/Cmd + B`
Applique le style gras au texte sélectionné.

### Italic (Italique)
**Commande :** `italic`
**Raccourci :** `Ctrl/Cmd + I`
Applique le style italique au texte sélectionné.

### Underline (Souligné)
**Commande :** `underline`
**Raccourci :** `Ctrl/Cmd + U`
Souligne le texte sélectionné.

### Strikethrough (Barré)
**Commande :** `strikethrough`
Applique un style barré au texte sélectionné.

---

## Formatage avancé

### Highlight (Surlignage)
**Package :** `@ckeditor/ckeditor5-highlight`

Le plugin `Highlight` permet de surligner du texte avec différentes couleurs.

**Commande :** `highlight`
**Options :**
- `highlightYellow` : Surlignage jaune
- `highlightGreen` : Surlignage vert
- `highlightPink` : Surlignage rose
- `highlightBlue` : Surlignage bleu
- `highlightRed` : Surlignage rouge

**Configuration :**
```typescript
highlight: {
  options: [
    { model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow marker', color: 'var(--ck-highlight-marker-yellow)' },
    { model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: 'var(--ck-highlight-marker-green)' },
    // ... etc
  ]
}
```

---

## Gestion des listes

### List (Listes)
**Package :** `@ckeditor/ckeditor5-list`

Gestion des listes à puces et numérotées.

**Commandes disponibles :**
- `numberedList` : Liste numérotée
- `bulletedList` : Liste à puces
- `indentList` : Indenter la liste (Tab)
- `outdentList` : Réduire l'indentation (Shift + Tab)

**Fonctionnalités :**
- Listes imbriquées (multi-niveaux)
- Conversion entre liste à puces et numérotée
- Navigation au clavier améliorée
- Preserve le formatage lors du collage depuis Word/Excel

---

## Images

### Image (Image de base)
**Package :** `@ckeditor/ckeditor5-image`

**Commande :** `insertImage`
**Raccourci :** `Ctrl/Cmd + K` (si configuré)

**Fonctionnalités de base :**
- Insertion d'images via URL
- Support des formats : JPG, PNG, GIF, WebP, SVG
- Images inline et block

### ImageToolbar (Barre d'outils image)
Affiche une barre d'outils contextuelle lors de la sélection d'une image.

**Configuration :**
```typescript
image: {
  styles: ['alignLeft', 'alignCenter', 'alignRight'],
  toolbar: [
    'imageStyle:alignLeft',
    'imageStyle:alignCenter',
    'imageStyle:alignRight',
    '|',
    'toggleImageCaption',
    'imageTextAlternative'
  ],
  defaultStyle: 'alignLeft'
}
```

### ImageStyle (Styles d'image)
**Commandes :**
- `imageStyle:alignLeft` : Aligne l'image à gauche avec le texte qui l'entoure
- `imageStyle:alignCenter` : Centre l'image en tant qu'élément de bloc
- `imageStyle:alignRight` : Aligne l'image à droite avec le texte qui l'entoure
- `imageStyle:inline` : Image inline avec le texte (alternative)
- `imageStyle:block` : Image en bloc (alternative)

**Note importante :** Oui, l'upload d'image gère bien l'alignement gauche et droite dans l'éditeur. Une fois une image uploadée via `ImageUpload`, vous pouvez utiliser les commandes `imageStyle:alignLeft` et `imageStyle:alignRight` pour aligner l'image à gauche ou à droite dans le document.

**Configuration :**
```typescript
image: {
  styles: ['alignLeft', 'alignCenter', 'alignRight'],
  toolbar: [
    'imageStyle:alignLeft',
    'imageStyle:alignCenter',
    'imageStyle:alignRight',
    '|',
    'imageTextAlternative'
  ],
  defaultStyle: 'alignLeft' // Style par défaut lors de l'insertion
}
```

### ImageCaption (Légende d'image)
**Commande :** `toggleImageCaption`
Ajoute ou supprime une légende sous l'image.

### ImageTextAlternative (Texte alternatif)
**Commande :** `imageTextAlternative`
Permet de définir le texte alternatif (alt) de l'image pour l'accessibilité.

### ImageResize (Redimensionnement d'image)
**Commande :** `imageResize`
Permet de redimensionner les images en conservant les proportions.

**Options :**
- Redimensionnement par poignées (drag & drop)
- Redimensionnement par pourcentage
- Largeur minimale/maximale configurable

**Configuration :**
```typescript
image: {
  resizeUnit: 'px', // ou '%
  resizeOptions: [
    {
      name: 'imageResize:original',
      label: 'Original',
      value: null
    },
    {
      name: 'imageResize:50',
      label: '50%',
      value: '50'
    },
    {
      name: 'imageResize:75',
      label: '75%',
      value: '75'
    }
  ]
}
```

### ImageUpload (Upload d'images)
**Commande :** `uploadImage`
Permet d'uploader des images depuis le système de fichiers.

**Configuration :**
```typescript
image: {
  upload: {
    types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'svg+xml']
  }
}
```

**Alignement :** ✅ **Oui, l'upload d'image gère l'alignement gauche et droite !** Une fois l'image uploadée, vous pouvez utiliser les commandes `imageStyle:alignLeft` et `imageStyle:alignRight` via la barre d'outils contextuelle qui apparaît lors de la sélection de l'image, ou via les commandes de l'éditeur.

**Note :** Nécessite une configuration backend pour traiter l'upload.

---

## Tableaux

### Table (Tableaux de base)
**Package :** `@ckeditor/ckeditor5-table`

**Commandes principales :**
- `insertTable` : Insérer un tableau
- `insertTableRowAbove` : Insérer une ligne au-dessus
- `insertTableRowBelow` : Insérer une ligne en-dessous
- `insertTableColumnLeft` : Insérer une colonne à gauche
- `insertTableColumnRight` : Insérer une colonne à droite
- `removeTableRow` : Supprimer une ligne
- `removeTableColumn` : Supprimer une colonne
- `mergeTableCells` : Fusionner des cellules
- `splitTableCell` : Séparer une cellule fusionnée

**Fonctionnalités :**
- Création de tableaux avec dimensions personnalisables
- Sélection de lignes/colonnes entières
- Navigation au clavier améliorée
- Gestion des cellules fusionnées
- Collage de tableaux depuis Excel/Word (amélioré en v19)

### TableToolbar (Barre d'outils tableau)
Affiche une barre d'outils contextuelle lors de la sélection d'un tableau.

**Configuration :**
```typescript
table: {
  contentToolbar: [
    'tableColumn',
    'tableRow',
    'mergeTableCells',
    'tableProperties',
    'tableCellProperties'
  ]
}
```

### TableProperties (Propriétés du tableau)
**Commande :** `tableProperties`

**Options configurables :**
- Largeur du tableau
- Hauteur du tableau
- Bordure du tableau
- Alignement du tableau (gauche, centre, droite)
- Espacement des cellules
- Padding du tableau
- Couleur de fond

**Configuration :**
```typescript
table: {
  tableProperties: {
    borderColors: ['hsl(0, 0%, 90%)', 'hsl(0, 0%, 75%)', 'hsl(0, 0%, 60%)'],
    backgroundColors: ['hsl(0, 0%, 90%)', 'hsl(0, 0%, 75%)', 'hsl(0, 0%, 60%)']
  }
}
```

### TableCellProperties (Propriétés des cellules)
**Commande :** `tableCellProperties`

**Options configurables :**
- Largeur de la cellule
- Hauteur de la cellule
- Alignement horizontal (gauche, centre, droite, justifié)
- Alignement vertical (haut, milieu, bas)
- Padding de la cellule
- Bordure de la cellule
- Couleur de fond de la cellule

### TableClipboard (Collage de tableaux)
Améliore la gestion du collage de tableaux :
- Collage depuis Excel/Word avec préservation du formatage
- Collage de tableaux dans d'autres tableaux
- Gestion des cellules fusionnées lors du collage

---

## Liens

### Link (Liens hypertexte)
**Package :** `@ckeditor/ckeditor5-link`

**Commande :** `link`
**Raccourci :** `Ctrl/Cmd + K`

**Fonctionnalités :**
- Création de liens hypertexte
- Modification de liens existants
- Suppression de liens
- Liens vers des URLs externes
- Liens vers des ancres internes
- Liens vers des e-mails (`mailto:`)
- Liens vers des numéros de téléphone (`tel:`)

**Configuration :**
```typescript
link: {
  decorators: {
    openInNewTab: {
      mode: 'manual',
      label: 'Open in a new tab',
      attributes: {
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    }
  },
  addTargetToExternalLinks: true,
  defaultProtocol: 'https://'
}
```

**Commandes :**
- `link` : Créer/modifier un lien
- `unlink` : Supprimer un lien

---

## Alignement

### Alignment (Alignement du texte)
**Package :** `@ckeditor/ckeditor5-alignment`

**Commandes :**
- `alignment:left` : Aligner à gauche
- `alignment:center` : Centrer
- `alignment:right` : Aligner à droite
- `alignment:justify` : Justifier

**Configuration :**
```typescript
alignment: {
  options: ['left', 'center', 'right', 'justify']
}
```

---

## Polices

### Font (Package de polices)
**Package :** `@ckeditor/ckeditor5-font`

Ce package regroupe plusieurs fonctionnalités liées aux polices.

### FontFamily (Famille de police)
**Commande :** `fontFamily`

Permet de changer la famille de police du texte.

**Configuration :**
```typescript
fontFamily: {
  options: [
    'default',
    'Arial, Helvetica, sans-serif',
    'Courier New, Courier, monospace',
    'Georgia, serif',
    'Lucida Sans Unicode, Lucida Grande, sans-serif',
    'Tahoma, Geneva, sans-serif',
    'Times New Roman, Times, serif',
    'Trebuchet MS, Helvetica, sans-serif',
    'Verdana, Geneva, sans-serif'
  ],
  supportAllValues: true
}
```

### FontSize (Taille de police)
**Commande :** `fontSize`

Permet de changer la taille de police.

**Configuration :**
```typescript
fontSize: {
  options: [
    'tiny',
    'small',
    'default',
    'big',
    'huge'
  ],
  supportAllValues: true // Permet d'entrer des valeurs personnalisées
}
```

**Avec valeurs personnalisées :**
```typescript
fontSize: {
  options: [
    9, 11, 13, 'default', 17, 19, 21
  ],
  supportAllValues: true
}
```

### FontColor (Couleur du texte)
**Commande :** `fontColor`

**Configuration :**
```typescript
fontColor: {
  colors: [
    { color: 'hsl(0, 0%, 0%)', label: 'Black' },
    { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
    { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
    { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
    { color: 'hsl(0, 0%, 100%)', label: 'White', hasBorder: true },
    { color: 'hsl(0, 75%, 60%)', label: 'Red' },
    { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
    // ... etc
  ]
}
```

### FontBackgroundColor (Couleur de fond du texte)
**Commande :** `fontBackgroundColor`

**Configuration :**
```typescript
fontBackgroundColor: {
  colors: [
    { color: 'hsl(0, 0%, 0%)', label: 'Black' },
    { color: 'hsl(0, 0%, 30%)', label: 'Dim grey' },
    // ... etc
  ]
}
```

---

## Annulation/Refaire

### Undo (Annuler/Refaire)
**Package :** `@ckeditor/ckeditor5-undo`

**Commandes :**
- `undo` : Annuler la dernière action
- `redo` : Refaire la dernière action annulée

**Raccourcis :**
- `Ctrl/Cmd + Z` : Annuler
- `Ctrl/Cmd + Shift + Z` ou `Ctrl/Cmd + Y` : Refaire

---

## Fonctionnalités additionnelles disponibles

### Plugins Core disponibles (non utilisés actuellement)

Ces plugins sont disponibles dans les dépendances mais peuvent nécessiter une installation/configuration supplémentaire :

#### Clipboard
Gestion avancée du presse-papiers :
- Copier/Coller avec préservation du formatage
- Collage depuis Word/Excel amélioré
- Collage de texte brut (Ctrl/Cmd + Shift + V)

#### Enter / ShiftEnter
- `Enter` : Créer un nouveau paragraphe
- `ShiftEnter` : Créer un saut de ligne (soft break)

#### SelectAll
- `selectAll` : Sélectionner tout le contenu
- Raccourci : `Ctrl/Cmd + A`

#### Typing
Gestion de la saisie de texte avec :
- Suppression intelligente
- Gestion des caractères spéciaux
- Auto-complétion (si configurée)

---

## Commandes disponibles dans l'éditeur

Voici la liste complète des commandes natives disponibles :

### Text Formatting
- `bold`
- `italic`
- `underline`
- `strikethrough`

### Headings
- `heading`
- `heading1`, `heading2`, `heading3`, `heading4`, `heading5`, `heading6`

### Lists
- `numberedList`
- `bulletedList`
- `indentList`
- `outdentList`

### Alignment
- `alignment:left`
- `alignment:center`
- `alignment:right`
- `alignment:justify`

### Font
- `fontFamily`
- `fontSize`
- `fontColor`
- `fontBackgroundColor`

### Links
- `link`
- `unlink`

### Images
- `insertImage`
- `imageStyle:alignLeft` ⭐ **Gère l'alignement à gauche**
- `imageStyle:alignCenter`
- `imageStyle:alignRight` ⭐ **Gère l'alignement à droite**
- `imageStyle:inline`
- `imageStyle:block`
- `toggleImageCaption`
- `imageTextAlternative`
- `imageResize`
- `uploadImage` ⭐ **Compatible avec l'alignement gauche/droite**

### Tables
- `insertTable`
- `insertTableRowAbove`
- `insertTableRowBelow`
- `insertTableColumnLeft`
- `insertTableColumnRight`
- `removeTableRow`
- `removeTableColumn`
- `mergeTableCells`
- `splitTableCell`
- `tableProperties`
- `tableCellProperties`

### Highlight
- `highlight`
- `highlightYellow`
- `highlightGreen`
- `highlightPink`
- `highlightBlue`
- `highlightRed`

### Undo/Redo
- `undo`
- `redo`

### Utilities
- `selectAll`
- `cut`
- `copy`
- `paste`
- `pastePlainText`

---

## Configuration recommandée

Exemple de configuration complète pour utiliser toutes les fonctionnalités :

```typescript
const editorConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      '|',
      'fontSize',
      'fontFamily',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'alignment',
      '|',
      'numberedList',
      'bulletedList',
      '|',
      'link',
      'highlight',
      '|',
      'insertImage',
      'insertTable',
      '|',
      'undo',
      'redo'
    ]
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
    ]
  },
  fontSize: {
    options: [9, 11, 13, 'default', 17, 19, 21],
    supportAllValues: true
  },
  fontFamily: {
    options: [
      'default',
      'Arial, Helvetica, sans-serif',
      'Courier New, Courier, monospace',
      'Georgia, serif',
      'Lucida Sans Unicode, Lucida Grande, sans-serif',
      'Tahoma, Geneva, sans-serif',
      'Times New Roman, Times, serif',
      'Trebuchet MS, Helvetica, sans-serif',
      'Verdana, Geneva, sans-serif'
    ],
    supportAllValues: true
  },
  alignment: {
    options: ['left', 'center', 'right', 'justify']
  },
  image: {
    styles: ['alignLeft', 'alignCenter', 'alignRight'],
    toolbar: [
      'imageStyle:alignLeft',
      'imageStyle:alignCenter',
      'imageStyle:alignRight',
      '|',
      'toggleImageCaption',
      'imageTextAlternative',
      '|',
      'imageResize'
    ],
    defaultStyle: 'alignLeft',
    resizeOptions: [
      {
        name: 'imageResize:original',
        label: 'Original',
        value: null
      },
      {
        name: 'imageResize:50',
        label: '50%',
        value: '50'
      },
      {
        name: 'imageResize:75',
        label: '75%',
        value: '75'
      }
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells',
      'tableProperties',
      'tableCellProperties'
    ]
  },
  link: {
    decorators: {
      openInNewTab: {
        mode: 'manual',
        label: 'Open in a new tab',
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    },
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://'
  }
};
```

---

## Notes importantes

1. **Version** : Cette documentation est basée sur CKEditor 5 version 19.0.0
2. **Éditeur utilisé** : `DecoupledEditor` - la barre d'outils est découplée de l'éditeur
3. **Plugins personnalisés** : Ce projet inclut également des plugins personnalisés (VariablePlugin, ConditionPlugin, LoopPlugin, etc.) qui ne font pas partie des fonctionnalités natives
4. **Raccourcis clavier** : Les raccourcis peuvent varier selon la plateforme (Windows/Linux vs macOS)
5. **Configuration** : Certaines fonctionnalités nécessitent une configuration backend (comme l'upload d'images)

---

## Ressources supplémentaires

- [Documentation officielle CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/)
- [Guide d'API CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)
- [Exemples de configurations](https://ckeditor.com/docs/ckeditor5/latest/examples/index.html)
- [Changelog v19](https://github.com/ckeditor/ckeditor5/releases/tag/v19.0.0)

---

**Dernière mise à jour :** 2024
**Version CKEditor :** 19.0.0


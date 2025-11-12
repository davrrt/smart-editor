# Documentation des Commandes API

Cette documentation décrit toutes les commandes et APIs disponibles dans SmartEditor.

## Table des matières

1. [API Style](#api-style)
2. [API Selection](#api-selection)
3. [API Template](#api-template)
4. [API Variables](#api-variables)
5. [API Conditions](#api-conditions)
6. [API Boucles (Loops)](#api-boucles-loops)
7. [API Tableaux Dynamiques](#api-tableaux-dynamiques)
8. [Utilisation de base](#utilisation-de-base)

---

## API Style

L'API Style permet de contrôler le formatage du texte, les images, les tableaux et autres éléments de l'éditeur.

### Actions de base

#### `undo()`
Annule la dernière action.
```typescript
smartEditor.style.undo()
```

#### `redo()`
Rétablit la dernière action annulée.
```typescript
smartEditor.style.redo()
```

#### `toggleBold()`
Active/désactive le gras sur la sélection.
```typescript
smartEditor.style.toggleBold()
```

#### `toggleItalic()`
Active/désactive l'italique sur la sélection.
```typescript
smartEditor.style.toggleItalic()
```

#### `toggleUnderline()`
Active/désactive le soulignement sur la sélection.
```typescript
smartEditor.style.toggleUnderline()
```

#### `toggleStrike()`
Active/désactive le barré sur la sélection.
```typescript
smartEditor.style.toggleStrike()
```

### Images

#### `insertImageFromUrl(url: string)`
Insère une image depuis une URL.
```typescript
smartEditor.style.insertImageFromUrl('https://example.com/image.jpg')
```

#### `uploadImages(files: File | File[] | FileList)`
Upload une ou plusieurs images depuis le système de fichiers.
```typescript
// Upload d'un seul fichier
smartEditor.style.uploadImages(fileInput.files[0])

// Upload de plusieurs fichiers
smartEditor.style.uploadImages([file1, file2, file3])
```

#### `setImageStyle(value: string)`
Applique un style d'image. Valeurs possibles : `'alignLeft'`, `'alignCenter'`, `'alignRight'`, `'inline'`, `'block'`, `'full'`, `'side'`.
```typescript
// Aligner l'image à gauche
smartEditor.style.setImageStyle('alignLeft')

// Aligner l'image à droite
smartEditor.style.setImageStyle('alignRight')

// Centrer l'image
smartEditor.style.setImageStyle('alignCenter')
```

#### `resizeImage(width: string | number | null)`
Redimensionne l'image sélectionnée.
```typescript
// Redimensionner à 250px
smartEditor.style.resizeImage(250)

// Redimensionner à 50%
smartEditor.style.resizeImage('50%')

// Redimensionner à taille originale
smartEditor.style.resizeImage(null)
```

#### `imageState()`
Retourne l'état actuel de l'image sélectionnée.
```typescript
const state = smartEditor.style.imageState()
// {
//   style: 'alignLeft' | null,
//   width: '250px' | null,
//   can: {
//     style: boolean,
//     resize: boolean,
//     upload: boolean
//   }
// }
```

### Tableaux

#### `insertTable(rows?: number, columns?: number)`
Insère un tableau. Par défaut : 3x3.
```typescript
// Tableau 3x3 par défaut
smartEditor.style.insertTable()

// Tableau 5x4
smartEditor.style.insertTable(5, 4)
```

#### Manipulation des lignes

- `insertRowAbove()` - Insère une ligne au-dessus
- `insertRowBelow()` - Insère une ligne en-dessous
- `removeRow()` - Supprime la ligne actuelle

```typescript
smartEditor.style.insertRowAbove()
smartEditor.style.insertRowBelow()
smartEditor.style.removeRow()
```

#### Manipulation des colonnes

- `insertColumnLeft()` - Insère une colonne à gauche
- `insertColumnRight()` - Insère une colonne à droite
- `removeColumn()` - Supprime la colonne actuelle

```typescript
smartEditor.style.insertColumnLeft()
smartEditor.style.insertColumnRight()
smartEditor.style.removeColumn()
```

#### Fusion et séparation

- `mergeCells()` - Fusionne les cellules sélectionnées
- `splitCellVertically()` - Divise la cellule verticalement
- `splitCellHorizontally()` - Divise la cellule horizontalement
- `openTableProperties()` - Ouvre la boîte de dialogue des propriétés du tableau
- `openCellProperties()` - Ouvre la boîte de dialogue des propriétés de cellule

```typescript
smartEditor.style.mergeCells()
smartEditor.style.splitCellVertically()
smartEditor.style.splitCellHorizontally()
smartEditor.style.openTableProperties()
smartEditor.style.openCellProperties()
```

#### Propriétés du tableau

- `setTableProperties(properties)` - Applique un ensemble de propriétés (largeur, alignement, bordures, fond…)
- `setTableBorder({ color?, style?, width? })` - Raccourci pour ne gérer que la bordure du tableau
- `setTableBackground(color)` - Définit la couleur de fond du tableau
- `setTableAlignment('left' | 'center' | 'right')` - Aligne le tableau
- `setTablePadding(padding)` - Définit le padding interne du tableau

```typescript
smartEditor.style.setTableProperties({
  alignment: 'center',
  backgroundColor: '#f5f5f5',
})
smartEditor.style.setTableBorder({ color: '#000', style: 'solid', width: '2px' })
smartEditor.style.setTableBackground('#fff')
smartEditor.style.setTableAlignment('right')
smartEditor.style.setTablePadding('12px')
```

#### Propriétés des cellules

- `setCellProperties(properties)` - Applique un ensemble de propriétés sur les cellules sélectionnées
- `setCellBorder({ color?, style?, width? })` - Ajuste uniquement la bordure des cellules
- `setCellBackground(color)` - Change la couleur de fond des cellules
- `setCellPadding(padding)` - Définit le padding des cellules
- `setCellAlignment({ horizontal?, vertical? })` - Gère l’alignement horizontal (`'left' | 'center' | 'right' | 'justify'`) et vertical (`'top' | 'middle' | 'bottom'`)

```typescript
smartEditor.style.setCellProperties({
  backgroundColor: '#eee',
  verticalAlignment: 'middle',
})
smartEditor.style.setCellBorder({ color: '#ccc', style: 'dashed' })
smartEditor.style.setCellBackground('#fafafa')
smartEditor.style.setCellPadding('6px 8px')
smartEditor.style.setCellAlignment({ horizontal: 'center', vertical: 'top' })
```

#### En-têtes

- `toggleHeaderRow()` - Active/désactive l'en-tête de ligne
- `toggleHeaderCol()` - Active/désactive l'en-tête de colonne

```typescript
smartEditor.style.toggleHeaderRow()
smartEditor.style.toggleHeaderCol()
```

#### `tableState()`
Retourne l'état des capacités de manipulation de tableau.
```typescript
const state = smartEditor.style.tableState()
// {
//   can: {
//     insertTable: boolean,
//     rowAbove: boolean,
//     rowBelow: boolean,
//     removeRow: boolean,
//     colLeft: boolean,
//     colRight: boolean,
//     removeColumn: boolean,
//     mergeCells: boolean,
//     splitVertically: boolean,   // splitTableCellVertically ou splitTableCell
//     splitHorizontally: boolean, // splitTableCellHorizontally ou splitTableCell
//     headerRow: boolean,
//     headerCol: boolean,
//     tableProperties: boolean,
//     cellProperties: boolean
//   }
//   availableCommands: string[] // Commandes réellement enregistrées côté CKEditor
// }
```

### Formatage du texte

#### `setHeading(level: HeadingLevel)`
Définit le niveau de titre. Valeurs possibles : `'paragraph'`, `1-6`, `'heading1'-'heading6'`.
```typescript
smartEditor.style.setHeading(1)           // Titre 1
smartEditor.style.setHeading('heading2')  // Titre 2
smartEditor.style.setHeading('paragraph') // Paragraphe
```

#### `toggleBulletedList()`
Active/désactive la liste à puces.
```typescript
smartEditor.style.toggleBulletedList()
```

#### `toggleNumberedList()`
Active/désactive la liste numérotée.
```typescript
smartEditor.style.toggleNumberedList()
```

#### `setAlignment(value: AlignValue)`
Définit l'alignement du texte. Valeurs : `'left'`, `'center'`, `'right'`, `'justify'`.
```typescript
smartEditor.style.setAlignment('left')
smartEditor.style.setAlignment('center')
smartEditor.style.setAlignment('right')
smartEditor.style.setAlignment('justify')
```

#### `setFontSize(value: string)`
Définit la taille de la police.
```typescript
smartEditor.style.setFontSize('18px')
smartEditor.style.setFontSize('large')
```

#### `setFontFamily(value: string)`
Définit la famille de police. Utiliser `'default'` ou `''` pour revenir au style par défaut.
```typescript
smartEditor.style.setFontFamily('Arial, Helvetica, sans-serif')
smartEditor.style.setFontFamily('default') // Retour au style par défaut
```

#### `getFontFamily()`
Retourne la famille de police actuellement appliquée.
```typescript
const fontFamily = smartEditor.style.getFontFamily()
// Retourne 'default' si aucune famille spécifique n'est appliquée
```

#### `getFontFamilyOptions()`
Retourne la liste des familles de police disponibles (configurées dans CKEditor).
```typescript
const options = smartEditor.style.getFontFamilyOptions()
// ['default', 'Arial, Helvetica, sans-serif', 'Courier New, Courier, monospace', ...]
```

### Liens

#### `addLink(href: string)`
Ajoute un lien à la sélection. Le protocole `https://` est ajouté automatiquement si absent.
```typescript
smartEditor.style.addLink('https://example.com')
smartEditor.style.addLink('example.com') // Devient automatiquement https://example.com
```

#### `removeLink()`
Supprime le lien de la sélection.
```typescript
smartEditor.style.removeLink()
```

### État global

#### `state()`
Retourne l'état complet de la sélection et des capacités disponibles.
```typescript
const state = smartEditor.style.state()
// {
//   bold: boolean,
//   italic: boolean,
//   underline: boolean,
//   strikethrough: boolean,
//   heading: string,
//   alignment: 'left' | 'center' | 'right' | 'justify' | null,
//   fontSize: string | null,
//   fontFamily: string,
//   can: {
//     bold: boolean,
//     italic: boolean,
//     underline: boolean,
//     strikethrough: boolean,
//     heading: boolean,
//     bulletedList: boolean,
//     numberedList: boolean,
//     alignment: boolean,
//     fontSize: boolean,
//     fontFamily: boolean,
//     link: boolean,
//     unlink: boolean,
//     insertTable: boolean,
//     // ... autres capacités de tableau
//   }
// }
```

#### `onChange(callback: () => void)`
S'abonne aux changements de sélection/attributs/commandes pour rafraîchir l'UI.
```typescript
const unsubscribe = smartEditor.style.onChange(() => {
  // Rafraîchir l'UI ici
  const currentState = smartEditor.style.state()
  updateUI(currentState)
})

// Pour se désabonner
unsubscribe()
```

---

## API Selection

L'API Selection permet d'analyser et de surveiller la sélection actuelle dans l'éditeur.

### Types de sélection

```typescript
type SelectionType = 
  | 'text' 
  | 'variable' 
  | 'loop' 
  | 'condition' 
  | 'signature' 
  | 'image' 
  | 'table' 
  | 'link' 
  | 'heading' 
  | 'list' 
  | 'none'
```

### Méthodes principales

#### `getCurrent()`
Analyse et retourne les informations sur la sélection actuelle.
```typescript
const selection = smartEditor.template.currentSelect.get()
// {
//   type: SelectionType,
//   element?: any,
//   data?: {
//     // Selon le type :
//     variableName?: string,
//     loopId?: string,
//     conditionId?: string,
//     signatureId?: string,
//     imageUrl?: string,
//     linkUrl?: string,
//     // ... etc
//   },
//   position?: {
//     start: number,
//     end: number
//   }
// }
```

#### `isSelected(type: SelectionType)`
Vérifie si un type spécifique est actuellement sélectionné.
```typescript
if (smartEditor.template.currentSelect.isSelected('image')) {
  console.log('Une image est sélectionnée')
}
```

#### `getData<T>(type: SelectionType)`
Obtient les données d'un type spécifique si sélectionné, sinon retourne `null`.
```typescript
// Pour une variable
const variableData = smartEditor.template.currentSelect.getData('variable')
// { variableName: 'user.name' } | null

// Pour une image
const imageData = smartEditor.template.currentSelect.getData('image')
// { imageUrl: 'https://...', imageWidth: '250px' } | null
```

#### `getElement()`
Obtient l'élément sélectionné dans le modèle de l'éditeur.
```typescript
const element = smartEditor.template.currentSelect.getElement()
```

#### `watch(callback: (selectionInfo: SelectionInfo) => void)`
Surveille les changements de sélection en temps réel.
```typescript
const unsubscribe = smartEditor.template.currentSelect.watch((selectionInfo) => {
  console.log('Type sélectionné:', selectionInfo.type)
  if (selectionInfo.type === 'image') {
    console.log('URL de l\'image:', selectionInfo.data?.imageUrl)
  }
})

// Pour se désabonner
unsubscribe()
```

---

## API Template

L'API Template permet de gérer le cycle de vie du template et d'obtenir le contenu.

### Méthodes

#### `init(container: HTMLElement, editorConfig?: any)`
Initialise l'éditeur dans le conteneur spécifié.
```typescript
await smartEditor.template.init(
  document.getElementById('editor-container'),
  editorConfig
)
```

#### `load(contract: TemplateContract, html: string)`
Charge un contrat et un template HTML dans l'éditeur.
```typescript
await smartEditor.template.load(contract, '<p>Contenu du template</p>')
```

#### `get()`
Retourne le contenu du template au format Nunjucks.
```typescript
const nunjucksTemplate = smartEditor.template.get()
// Retourne le HTML transformé en Nunjucks
```

#### `getRaw()`
Retourne le contenu brut HTML de l'éditeur.
```typescript
const html = smartEditor.template.getRaw()
// Retourne le HTML brut
```

#### `getSchema()`
Retourne le contrat actuel (schéma complet avec variables, conditions, loops, etc.).
```typescript
const contract = smartEditor.template.getSchema()
// {
//   variables: [...],
//   conditions: [...],
//   loops: [...],
//   dynamicTables: [...]
// }
```

#### `save(callback: () => void)`
Définit un callback qui sera appelé lors de la sauvegarde.
```typescript
smartEditor.template.save(() => {
  const html = smartEditor.template.get()
  const schema = smartEditor.template.getSchema()
  // Sauvegarder html et schema
})
```

#### `onClick(handler: () => void)`
Définit un handler appelé lors d'un clic dans l'éditeur (sauf sur les widgets).
```typescript
smartEditor.template.onClick(() => {
  console.log('Clic dans l\'éditeur')
})
```

#### `destroy()`
Détruit l'instance de l'éditeur et nettoie les ressources.
```typescript
await smartEditor.template.destroy()
```

---

## API Variables

L'API Variables permet de gérer les variables du template (variables inline et signatures).

### Méthodes

#### `create(variable: Variable)`
Crée une nouvelle variable dans le contrat.
```typescript
smartEditor.variable.create({
  name: 'user-name',
  displayName: 'Nom de l\'utilisateur',
  type: 'text'
})
```

#### `insert(name: string, showToast?: (message: any) => void)`
Insère une variable dans l'éditeur à la position du curseur.
```typescript
smartEditor.variable.insert('user-name', (toast) => {
  console.log(toast.message)
})
```

#### `update(variable: Variable, showToast?: (message: any) => void)`
Met à jour une variable existante.
```typescript
smartEditor.variable.update({
  name: 'user-name',
  displayName: 'Nom complet',
  type: 'text'
})
```

#### `delete(name: string)`
Supprime une variable du contrat et de l'éditeur.
```typescript
smartEditor.variable.delete('user-name')
```

#### `get(name: string)`
Récupère une variable par son nom.
```typescript
const variable = smartEditor.variable.get('user-name')
```

#### `getAll()`
Retourne toutes les variables.
```typescript
const allVariables = smartEditor.variable.getAll()
```

#### `onClick(handler: (e: { type: 'variable'; name: string }) => void)`
Définit un handler appelé lors d'un clic sur une variable.
```typescript
smartEditor.variable.onClick((e) => {
  console.log('Variable cliquée:', e.name)
})
```

---

## API Conditions

L'API Conditions permet de gérer les blocs conditionnels du template.

### Méthodes

#### `create(condition: Condition)`
Crée une nouvelle condition dans le contrat.
```typescript
smartEditor.condition.create({
  id: 'cond-1',
  displayName: 'Utilisateur actif',
  expression: 'user.isActive'
})
```

#### `insert(id: string)`
Insère une condition dans l'éditeur à la position du curseur.
```typescript
smartEditor.condition.insert('cond-1')
```

#### `update(condition: Condition)`
Met à jour une condition existante.
```typescript
smartEditor.condition.update({
  id: 'cond-1',
  displayName: 'Utilisateur actif et vérifié',
  expression: 'user.isActive && user.isVerified'
})
```

#### `delete(id: string)`
Supprime une condition du contrat et de l'éditeur.
```typescript
smartEditor.condition.delete('cond-1')
```

#### `get(id: string)`
Récupère une condition par son ID.
```typescript
const condition = smartEditor.condition.get('cond-1')
```

#### `getAll()`
Retourne toutes les conditions.
```typescript
const allConditions = smartEditor.condition.getAll()
```

#### `onClick(handler: (e: { type: 'condition'; conditionId: string }) => void)`
Définit un handler appelé lors d'un clic sur une condition.
```typescript
smartEditor.condition.onClick((e) => {
  console.log('Condition cliquée:', e.conditionId)
})
```

---

## API Boucles (Loops)

L'API Loops permet de gérer les blocs de boucles du template.

### Méthodes

#### `create(loop: LoopInput | Loop)`
Crée une nouvelle boucle dans le contrat.
```typescript
smartEditor.loop.create({
  id: 'loop-1',
  displayName: 'Liste des utilisateurs',
  expression: 'user in users',
  fields: []
})
```

#### `insert(id: string)`
Insère une boucle dans l'éditeur à la position du curseur.
```typescript
smartEditor.loop.insert('loop-1')
```

#### `update(loop: Loop)`
Met à jour une boucle existante.
```typescript
smartEditor.loop.update({
  id: 'loop-1',
  displayName: 'Liste des clients',
  expression: 'client in clients',
  fields: []
})
```

#### `delete(id: string)`
Supprime une boucle du contrat et de l'éditeur.
```typescript
smartEditor.loop.delete('loop-1')
```

#### `get(id: string)`
Récupère une boucle par son ID.
```typescript
const loop = smartEditor.loop.get('loop-1')
```

#### `getAll()`
Retourne toutes les boucles.
```typescript
const allLoops = smartEditor.loop.getAll()
```

#### `onClick(handler: (e: { type: 'loop'; loopId: string }) => void)`
Définit un handler appelé lors d'un clic sur une boucle.
```typescript
smartEditor.loop.onClick((e) => {
  console.log('Boucle cliquée:', e.loopId)
})
```

---

## API Tableaux Dynamiques

L'API DynamicTable permet de gérer les tableaux dynamiques du template.

### Méthodes

#### `create(table: DynamicTableInput | DynamicTable)`
Crée un nouveau tableau dynamique dans le contrat.
```typescript
smartEditor.dynamicTable.create({
  id: 'table-1',
  displayName: 'Tableau des produits',
  expression: 'product in products',
  columns: []
})
```

#### `insert(id: string)`
Insère un tableau dynamique dans l'éditeur à la position du curseur.
```typescript
smartEditor.dynamicTable.insert('table-1')
```

#### `update(table: DynamicTable)`
Met à jour un tableau dynamique existant.
```typescript
smartEditor.dynamicTable.update({
  id: 'table-1',
  displayName: 'Tableau des commandes',
  expression: 'order in orders',
  columns: []
})
```

#### `delete(id: string)`
Supprime un tableau dynamique du contrat et de l'éditeur.
```typescript
smartEditor.dynamicTable.delete('table-1')
```

#### `get(id: string)`
Récupère un tableau dynamique par son ID.
```typescript
const table = smartEditor.dynamicTable.get('table-1')
```

#### `getAll()`
Retourne tous les tableaux dynamiques.
```typescript
const allTables = smartEditor.dynamicTable.getAll()
```

#### `onClick(handler: (e: { type: 'dynamicTable'; tableId: string }) => void)`
Définit un handler appelé lors d'un clic sur un tableau dynamique.
```typescript
smartEditor.dynamicTable.onClick((e) => {
  console.log('Tableau dynamique cliqué:', e.tableId)
})
```

---

## Utilisation de base

### Exemple complet

```typescript
import { useSmartEditor } from '@smart-editor/react'

function MyEditor() {
  const smartEditor = useSmartEditor()

  useEffect(() => {
    // Initialiser l'éditeur
    const container = document.getElementById('editor')
    smartEditor.template.init(container, editorConfig)

    // Charger un template
    const contract = {
      variables: [],
      conditions: [],
      loops: [],
      dynamicTables: []
    }
    smartEditor.template.load(contract, '<p>Contenu initial</p>')

    // Surveiller les changements de sélection
    const unsubscribe = smartEditor.template.currentSelect.watch((selection) => {
      console.log('Sélection:', selection.type)
    })

    // Configurer la sauvegarde
    smartEditor.template.save(() => {
      const html = smartEditor.template.get()
      const schema = smartEditor.template.getSchema()
      console.log('Sauvegarde:', { html, schema })
    })

    return () => {
      unsubscribe()
      smartEditor.template.destroy()
    }
  }, [])

  const handleBold = () => {
    smartEditor.style.toggleBold()
  }

  const handleInsertImage = () => {
    smartEditor.style.insertImageFromUrl('https://example.com/image.jpg')
  }

  const handleInsertVariable = () => {
    smartEditor.variable.insert('user-name')
  }

  return (
    <div>
      <button onClick={handleBold}>Gras</button>
      <button onClick={handleInsertImage}>Insérer image</button>
      <button onClick={handleInsertVariable}>Insérer variable</button>
      <div id="editor" />
    </div>
  )
}
```

### Exemple avec gestion d'état

```typescript
const [editorState, setEditorState] = useState(null)

useEffect(() => {
  // Surveiller l'état de l'éditeur
  const unsubscribe = smartEditor.style.onChange(() => {
    const state = smartEditor.style.state()
    setEditorState(state)
  })

  return unsubscribe
}, [])

// Utiliser l'état pour mettre à jour l'UI
{editorState && (
  <div>
    <button 
      disabled={!editorState.can.bold}
      className={editorState.bold ? 'active' : ''}
      onClick={() => smartEditor.style.toggleBold()}
    >
      Gras
    </button>
    <button 
      disabled={!editorState.can.italic}
      className={editorState.italic ? 'active' : ''}
      onClick={() => smartEditor.style.toggleItalic()}
    >
      Italique
    </button>
  </div>
)}
```

---

## Notes importantes

1. **Types TypeScript** : Toutes les APIs sont typées. Consultez les fichiers source pour les types complets.
2. **Gestion d'erreurs** : Les méthodes retournent `false` ou `null` en cas d'échec (commande non disponible, éditeur non initialisé, etc.).
3. **Performance** : Utilisez `onChange()` et `watch()` avec précaution pour éviter trop de re-rendus.
4. **Nettoyage** : Toujours appeler `destroy()` et se désabonner des callbacks lors du démontage du composant.

---

**Dernière mise à jour :** 2024


# Flow Backend - Génération TemplateContract depuis Zod

```mermaid
graph TD
    A[Backend Schema Zod] --> B[generateTemplateContractFromZod]
    B --> C[useSmartEditor Hook]
    C --> D[useTemplateStore]
    
    B --> E[zodToVariable]
    E --> F[mapZodToSmartEditorType]
    E --> G[extractZodOptions]
    
    F --> H{Type Zod?}
    H -->|ZodString| I[type string]
    H -->|ZodNumber| J[type number]
    H -->|ZodBoolean| K[type boolean]
    H -->|ZodDate| L[type date]
    H -->|ZodArray| M[type list]
    H -->|ZodObject| N[type object]
    H -->|ZodEnum| O[type string + enum options]
    
    G --> P{Extraction Options}
    P -->|Enum Values| R[options.enum]
    
    M --> T{Array d objets?}
    T -->|Oui| U[Extraction champs objets]
    T -->|Non| V[Array simple]
    
    U --> W[fields VariableField array]
    N --> W
    
    E --> X[variable.create]
    X --> Y[Variables stockees]
    
    B --> Z{generateConditions?}
    Z -->|true| AA[Variables avec enum]
    AA --> BB[condition.create]
    BB --> CC[Conditions stockees]
    
    B --> DD{generateLoops?}
    DD -->|true| EE[Variables type list]
    EE --> FF[loop.create]
    FF --> GG[Loops stockees]
    
    Y --> HH[template.getSchema]
    CC --> HH
    GG --> HH
    
    HH --> II[TemplateContract]
    II --> JJ[Backend Stockage en base]
    
    style A fill:#e1f5fe
    style II fill:#c8e6c9
    style JJ fill:#fff3e0
```

## Description du Flow

### 1. **Input Backend**
- Le backend fournit un schéma Zod (ex: `fundraisingSchema`)
- Appelle `generateTemplateContractFromZod(schema, options)`

### 2. **Traitement Zod → SmartEditor**
- **`zodToVariable`** : Convertit chaque champ Zod en Variable SmartEditor
- **`mapZodToSmartEditorType`** : Mappe les types Zod vers les types SmartEditor
- **`extractZodOptions`** : Extrait les métadonnées fonctionnelles (enum, etc.)

### 3. **Gestion des Types Complexes**
- **Objets** : Extraction récursive des champs → `fields: VariableField[]`
- **Arrays d'objets** : Extraction des champs de l'objet → `fields: VariableField[]`
- **Enums** : Extraction des valeurs possibles → `options.enum`

### 4. **Création via API SmartEditor**
- **`variable.create`** : Crée les variables dans le store
- **`condition.create`** : Crée les conditions (si `generateConditions: true`)
- **`loop.create`** : Crée les loops (si `generateLoops: true`)

### 5. **Output Backend**
- **`template.getSchema`** : Récupère le TemplateContract final
- Le backend stocke ce contrat en base de données
- Réutilisable par d'autres services

## Avantages de cette Architecture

✅ **Découplage** : Le backend n'utilise pas directement React
✅ **Réutilisabilité** : Même API SmartEditor pour frontend et backend
✅ **Flexibilité** : Options pour activer/désactiver conditions et loops
✅ **Cohérence** : Même structure de données partout

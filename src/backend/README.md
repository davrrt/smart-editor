# SmartEditor Backend Helpers

Ce dossier contient les 2 helpers essentiels pour le backend SmartEditor.

## 📁 Structure

```
backend/
├── templateContractBuilder.ts                    # Helper pour construire des contrats depuis Zod
├── signatureScanner.ts                           # Helper pour scanner les signatures HTML
├── templateContractBuilder-input-example.json    # Exemple d'entrée pour le builder
├── templateContractBuilder-output-example.json   # Exemple de sortie pour le builder
├── signatureScanner-input-example.json           # Exemple d'entrée pour le scanner
├── signatureScanner-output-example.json          # Exemple de sortie pour le scanner
└── README.md                                     # Ce fichier
```

## 🚀 Utilisation

### 1. TemplateContractBuilder

Construit des contrats SmartEditor depuis des schémas Zod.

```typescript
import { createTemplateContractBuilder } from './templateContractBuilder';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid().describe('The ID'),
  name: z.string().describe('The name'),
  isActive: z.boolean().describe('Is active'),
  status: z.enum(['active', 'inactive']).describe('Status')
});

const builder = createTemplateContractBuilder();
const contract = builder
  .withZodSchema(userSchema, { namespace: 'user' })
  .addVariables([{
    name: 'company_logo',
    type: 'signature',
    displayName: 'Logo entreprise'
  }])
  .build();

console.log(contract);
// { variables: [...], conditions: [...], loops: [...] }
```

**Voir les exemples :**
- `templateContractBuilder-input-example.json` - Format d'entrée
- `templateContractBuilder-output-example.json` - Format de sortie

### 2. SignatureScanner

Scanne les signatures dans les templates HTML.

```typescript
import { scanSignaturesInTemplate, getStandardizedSignatures } from './signatureScanner';

const templateHtml = `
  <div class="ck-signature-zone" 
       data-id="seller-signature" 
       data-name="seller" 
       data-align="left"
       data-label="Signature vendeur">
  </div>
`;

// Scanner les signatures
const result = scanSignaturesInTemplate(templateHtml);
console.log(result);
// { signatures: [...], totalCount: 1, hasSignatures: true }

// Générer des signatures standardisées pour APIs
const standardizedSignatures = getStandardizedSignatures(templateHtml);
console.log(standardizedSignatures);
// [{ id: 'seller-signature', tabType: 'signature', ... }]
```

**Voir les exemples :**
- `signatureScanner-input-example.json` - Format d'entrée
- `signatureScanner-output-example.json` - Format de sortie

## 🔧 Fonctionnalités

### TemplateContractBuilder
- ✅ Construction depuis schémas Zod
- ✅ Scellement automatique des contrats
- ✅ Support des namespaces
- ✅ Variables, conditions et boucles personnalisées
- ✅ Validation des références
- ✅ Construction progressive

### SignatureScanner
- ✅ Scan des signatures HTML
- ✅ Fallback regex si jsdom indisponible
- ✅ Signatures standardisées pour APIs
- ✅ Support des attributs personnalisés
- ✅ Gestion des erreurs

## 📋 Tests

```bash
npm test -- tests/backend
```

Les tests couvrent :
- Construction de base et avancée
- Validation et gestion d'erreurs
- Scellement des contrats
- Scan des signatures avec/sans attributs
- Formats standardisés

## 🎯 Cas d'usage

1. **Génération de contrats** : Créer des TemplateContract depuis des schémas Zod
2. **Scan de signatures** : Extraire les positions de signatures des templates
3. **APIs de signature** : Générer des formats compatibles DocuSign/Adobe Sign
4. **Validation** : Vérifier la cohérence des contrats avant utilisation

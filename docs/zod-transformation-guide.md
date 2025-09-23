# Guide Complet : Transformation Zod vers SmartEditor

## 📋 Types Zod Supportés

### **Types de Base**
| Type Zod | Type SmartEditor | Description |
|----------|------------------|-------------|
| `ZodString` | `'string'` | Chaînes de caractères |
| `ZodNumber` | `'number'` | Nombres |
| `ZodBoolean` | `'boolean'` | Booléens |
| `ZodDate` | `'date'` | Dates |
| `ZodArray` | `'list'` | Tableaux/listes |
| `ZodObject` | `'object'` | Objets |
| `ZodEnum` | `'string'` + `options.enum` | Énumérations |

### **Types Avancés (À Implémenter)**
| Type Zod | Transformation Suggérée | Description |
|----------|------------------------|-------------|
| `ZodLiteral` | `'string'` + valeur fixe | Valeurs littérales |
| `ZodTuple` | `'list'` + types spécifiques | Tuples (tableaux typés) |
| `ZodUnion` | `'string'` + `options.union` | Union de types |
| `ZodIntersection` | `'object'` fusionné | Intersection de types |
| `ZodRecord` | `'object'` dynamique | Objets avec clés dynamiques |
| `ZodMap` | `'list'` de paires | Maps JavaScript |
| `ZodSet` | `'list'` unique | Sets JavaScript |
| `ZodFunction` | `'string'` | Fonctions |
| `ZodPromise` | `'string'` | Promesses |
| `ZodNativeEnum` | `'string'` + `options.enum` | Enums TypeScript |

## 🔧 Options de Transformation

### **Méthodes de Validation**
```typescript
// Validation de longueur
z.string().min(5).max(100)           // → options.minLength, options.maxLength
z.array().length(3)                  // → options.length

// Validation de format
z.string().email()                   // → options.format: 'email'
z.string().url()                     // → options.format: 'url'
z.string().uuid()                    // → options.format: 'uuid'
z.string().regex(/pattern/)          // → options.pattern

// Validation numérique
z.number().min(0).max(100)           // → options.min, options.max
z.number().int()                     // → options.integer: true
z.number().positive()                // → options.positive: true
```

### **Méthodes de Transformation**
```typescript
// Valeurs par défaut
z.string().default("default value")  // → options.defaultValue
z.number().default(0)                // → options.defaultValue

// Transformation
z.string().transform(val => val.toUpperCase()) // → options.transform

// Validation personnalisée
z.string().refine(val => val.length > 5)       // → options.customValidation
```

### **Modificateurs de Nullabilité**
```typescript
z.string().optional()                // → options.optional: true
z.string().nullable()                // → options.nullable: true
z.string().nullish()                 // → options.nullish: true
```

## 🏗️ Structures Complexes

### **Objets avec Méthodes**
```typescript
// Manipulation d'objets
z.object({...}).pick({field1: true})     // → Sélection de champs
z.object({...}).omit({field2: true})     // → Exclusion de champs
z.object({...}).partial()                // → Tous les champs optionnels
z.object({...}).required()               // → Tous les champs requis
z.object({...}).extend({...})            // → Extension avec nouveaux champs
z.object({...}).merge(otherSchema)       // → Fusion avec autre schéma
```

### **Arrays avec Types Spéciaux**
```typescript
// Arrays typés
z.array(z.string())                     // → type: 'list', fields: []
z.array(z.object({...}))                // → type: 'list', fields: [champs objet]
z.tuple([z.string(), z.number()])       // → type: 'list', fields spécifiques
```

## 🎯 Cas d'Usage Avancés

### **1. Enums avec Valeurs Personnalisées**
```typescript
const StatusEnum = z.enum(["active", "inactive", "pending"]);
// → type: 'string', options.enum: ["active", "inactive", "pending"]
```

### **2. Objets avec Validation Conditionnelle**
```typescript
const UserSchema = z.object({
  type: z.enum(["admin", "user"]),
  permissions: z.array(z.string()).optional()
}).refine(data => {
  if (data.type === "admin") {
    return data.permissions !== undefined;
  }
  return true;
});
// → Validation personnalisée dans options.customValidation
```

### **3. Unions de Types**
```typescript
const StringOrNumber = z.union([z.string(), z.number()]);
// → type: 'string', options.union: ['string', 'number']
```

### **4. Intersections**
```typescript
const BaseSchema = z.object({ id: z.string() });
const ExtendedSchema = z.object({ name: z.string() });
const CombinedSchema = BaseSchema.and(ExtendedSchema);
// → Fusion des champs dans un seul objet
```

## 🔄 Transformation Recommandée

### **Mapping Complet**
```typescript
const mapZodToSmartEditorType = (zodType: z.ZodTypeAny): VariableType => {
  // Types de base
  if (zodType instanceof z.ZodString) {
    const checks = (zodType as any)._def.checks;
    if (checks?.some((c: any) => c.kind === 'datetime')) return 'date';
    return 'string';
  }
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodDate) return 'date';
  if (zodType instanceof z.ZodArray) return 'list';
  if (zodType instanceof z.ZodObject) return 'object';
  if (zodType instanceof z.ZodEnum) return 'string';
  
  // Types avancés
  if (zodType instanceof z.ZodUnion) return 'string'; // Avec options.union
  if (zodType instanceof z.ZodLiteral) return 'string'; // Avec valeur fixe
  if (zodType instanceof z.ZodTuple) return 'list'; // Avec types spécifiques
  if (zodType instanceof z.ZodRecord) return 'object'; // Dynamique
  if (zodType instanceof z.ZodMap) return 'list'; // Paires clé-valeur
  if (zodType instanceof z.ZodSet) return 'list'; // Valeurs uniques
  if (zodType instanceof z.ZodFunction) return 'string'; // Fonction
  if (zodType instanceof z.ZodPromise) return 'string'; // Promesse
  if (zodType instanceof z.ZodNativeEnum) return 'string'; // Enum TS
  
  return 'string'; // Fallback
};
```

### **Extraction d'Options Avancée**
```typescript
const extractZodOptions = (zodType: z.ZodTypeAny): Record<string, any> => {
  const options: Record<string, any> = {};
  
  // Enum values
  if (zodType instanceof z.ZodEnum) {
    options.enum = Object.values((zodType as any)._def.entries);
  }
  
  // Union types
  if (zodType instanceof z.ZodUnion) {
    options.union = (zodType as any)._def.options.map((opt: any) => 
      mapZodToSmartEditorType(opt)
    );
  }
  
  // Literal values
  if (zodType instanceof z.ZodLiteral) {
    options.literal = (zodType as any)._def.value;
  }
  
  // Validation checks
  const checks = (zodType as any)._def.checks;
  if (checks) {
    checks.forEach((check: any) => {
      switch (check.kind) {
        case 'min': options.min = check.value; break;
        case 'max': options.max = check.value; break;
        case 'length': options.length = check.value; break;
        case 'email': options.format = 'email'; break;
        case 'url': options.format = 'url'; break;
        case 'uuid': options.format = 'uuid'; break;
        case 'regex': options.pattern = check.regex.source; break;
        case 'int': options.integer = true; break;
        case 'positive': options.positive = true; break;
      }
    });
  }
  
  // Default values
  if ((zodType as any)._def.defaultValue) {
    options.defaultValue = (zodType as any)._def.defaultValue();
  }
  
  // Nullability
  if ((zodType as any)._def.typeName === 'ZodOptional') {
    options.optional = true;
  }
  if ((zodType as any)._def.typeName === 'ZodNullable') {
    options.nullable = true;
  }
  if ((zodType as any)._def.typeName === 'ZodNullish') {
    options.nullish = true;
  }
  
  return options;
};
```

## 🚀 Implémentation Recommandée

### **Phase 1 : Types de Base** ✅ (Déjà implémenté)
- String, Number, Boolean, Date, Array, Object, Enum

### **Phase 2 : Validation Avancée** 🔄 (À implémenter)
- Min/Max, Email, URL, UUID, Regex
- Integer, Positive, Length

### **Phase 3 : Types Complexes** 📋 (À implémenter)
- Union, Intersection, Literal, Tuple
- Record, Map, Set

### **Phase 4 : Transformation** 🎯 (À implémenter)
- Default values, Custom validation
- Transform functions, Refine conditions

Cette documentation fournit une base complète pour étendre la transformation Zod vers SmartEditor avec tous les cas d'usage possibles.



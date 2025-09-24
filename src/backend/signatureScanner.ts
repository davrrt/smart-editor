/**
 * Helper pour scanner les signatures dans un template Nunjucks
 * Extrait les coordonnées x et y des zones de signature dans le DOM
 */

export interface SignaturePosition {
  id: string;
  name?: string;
  align?: 'left' | 'center' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  element: HTMLElement;
  // Nouvelles propriétés détaillées
  signerKey?: string;
  label?: string;
  loopRef?: string;
  referenceField?: string;
  className?: string;
  customAttributes?: Record<string, string>;
  parentElement?: string;
  siblings?: {
    before: string[];
    after: string[];
  };
  context?: {
    pageNumber?: number;
    section?: string;
    paragraphIndex?: number;
  };
  metadata?: {
    createdAt?: Date;
    lastModified?: Date;
    version?: string;
  };
  // Attributs CKEditor
  ckPage?: number;
  ckX?: number;
  ckY?: number;
  ckW?: number;
  ckH?: number;
  ckUnit?: string;
  ckPlaced?: boolean;
}

/**
 * Interface standardisée complète pour les signatures
 * Format universel contenant tous les attributs possibles pour faciliter le bridge vers n'importe quelle API
 */
export interface StandardizedSignature {
  // === IDENTIFICATION ===
  id: string;
  label: string;
  signerKey: string;
  name?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  
  // === POSITION ET DIMENSIONS (calculées par signatureScanner) ===
  page: number;           // Numéro de page calculé
  x: number;              // Coordonnées normalisées [0..1] calculées
  y: number;              // Coordonnées normalisées [0..1] calculées
  width: number;          // Largeur normalisée [0..1] calculée
  height: number;         // Hauteur normalisée [0..1] calculée
  
  // === COORDONNÉES ABSOLUES (calculées par signatureScanner) ===
  absoluteX?: number;     // Coordonnées en pixels calculées
  absoluteY?: number;     // Coordonnées en pixels calculées
  absoluteWidth?: number; // Largeur en pixels calculée
  absoluteHeight?: number; // Hauteur en pixels calculée
  
  // === ATTRIBUTS PLUGIN CKEDITOR (optionnels, si présents dans le HTML) ===
  ckPage?: number;        // Numéro de page (data-page) du plugin CKEditor
  ckX?: number;           // Position X (data-x) du plugin CKEditor
  ckY?: number;           // Position Y (data-y) du plugin CKEditor
  ckW?: number;           // Largeur (data-w) du plugin CKEditor
  ckH?: number;           // Hauteur (data-h) du plugin CKEditor
  ckUnit?: string;        // Unité (data-unit) du plugin CKEditor
  ckPlaced?: boolean;     // Si la signature est placée (data-placed) du plugin CKEditor
  
  // === ANCRAGE ET POSITIONNEMENT ===
  anchorString?: string;
  anchorXOffset?: number;
  anchorYOffset?: number;
  anchorIgnoreIfNotPresent?: boolean;
  anchorCaseSensitive?: boolean;
  anchorMatchWholeWord?: boolean;
  
  // === TYPE ET COMPORTEMENT ===
  tabType: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'radio' | 'list' | 'dropdown' | 'number' | 'ssn' | 'email' | 'formula';
  required: boolean;
  locked: boolean;
  shared: boolean;
  conditional?: {
    conditionalParentLabel?: string;
    conditionalParentValue?: string;
    conditionalParentLabelMetadata?: Record<string, string>;
  };
  
  // === VALIDATION ===
  validation?: {
    validationPattern?: string;
    validationMessage?: string;
    maxLength?: number;
    minLength?: number;
    customTabId?: string;
  };
  
  // === STYLE ET APPARENCE ===
  style?: {
    font?: string;
    fontSize?: string;
    fontColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
    opacity?: number;
  };
  
  // === MÉTADONNÉES DOCUMENT ===
  documentId?: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientName?: string;
  recipientRole?: string;
  
  // === OPTIONS SPÉCIFIQUES PAR TYPE ===
  options?: {
    // Pour les listes/dropdowns
    listItems?: Array<{
      text: string;
      value: string;
      selected?: boolean;
    }>;
    // Pour les cases à cocher
    checked?: boolean;
    // Pour les dates
    dateFormat?: string;
    // Pour les nombres
    numberFormat?: string;
    // Pour les formules
    formula?: string;
  };
  
  // === GESTION DES ERREURS ===
  errorDetails?: {
    errorCode?: string;
    errorMessage?: string;
    errorDetails?: string;
  };
  
  // === MÉTADONNÉES TECHNIQUES ===
  metadata?: {
    createdAt: Date;
    lastModified: Date;
    version: string;
    source: 'smart-editor';
    originalElement?: {
      tagName: string;
      className: string;
      attributes: Record<string, string>;
    };
  };
  
  // === PROPRIÉTÉS ÉTENDUES (pour compatibilité future) ===
  customProperties?: Record<string, any>;
  
  // === WORKFLOW ===
  workflow?: {
    order?: number;
    groupId?: string;
    dependsOn?: string[];
    triggers?: string[];
  };
}

export interface SignatureScanResult {
  signatures: SignaturePosition[];
  totalCount: number;
  hasSignatures: boolean;
}

/**
 * Scanne un template Nunjucks (HTML) pour extraire les positions des signatures
 * @param templateHtml - Le contenu HTML du template Nunjucks
 * @returns Les positions des signatures trouvées
 */
export function scanSignaturesInTemplate(templateHtml: string): SignatureScanResult {
  // Créer un parser DOM pour analyser le HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHtml, 'text/html');
  
  // Trouver toutes les zones de signature
  const signatureElements = doc.querySelectorAll('.ck-signature-zone');
  
  const signatures: SignaturePosition[] = [];
  
  signatureElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    
    // Extraire les attributs de base
    const id = htmlElement.getAttribute('data-id') || `signature-${index}`;
    const name = htmlElement.getAttribute('data-name') || undefined;
    const align = (htmlElement.getAttribute('data-align') || 'left') as 'left' | 'center' | 'right';
    
    // Extraire les attributs étendus
    const signerKey = htmlElement.getAttribute('data-signer-key') || 
                     htmlElement.getAttribute('data-name') || 
                     undefined;
    const label = htmlElement.getAttribute('data-label') || 
                 htmlElement.getAttribute('data-name') || 
                 undefined;
    const loopRef = htmlElement.getAttribute('data-loop-ref') || 
                   htmlElement.getAttribute('data-loop') || 
                   undefined;
    const referenceField = htmlElement.getAttribute('data-reference-field') || 
                          htmlElement.getAttribute('data-ref') || 
                          undefined;
    
    // Extraire les classes CSS
    const className = htmlElement.className || undefined;
    
    // Extraire tous les attributs personnalisés
    const customAttributes: Record<string, string> = {};
    Array.from(htmlElement.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && !['data-id', 'data-name', 'data-align', 'data-signer-key', 'data-label', 'data-loop-ref', 'data-reference-field', 'data-loop', 'data-ref', 'data-page', 'data-x', 'data-y', 'data-w', 'data-h', 'data-unit', 'data-placed'].includes(attr.name)) {
        customAttributes[attr.name] = attr.value;
      }
    });
    
    // Analyser le contexte parent
    const parentElement = htmlElement.parentElement?.tagName?.toLowerCase() || undefined;
    
    // Analyser les éléments frères (siblings)
    const siblings = analyzeSiblings(htmlElement);
    
    // Analyser le contexte du document
    const context = analyzeContext(htmlElement, index);
    
    // Calculer les coordonnées
    const rect = calculateElementPosition(htmlElement, index);
    
    // Créer l'objet signature détaillé
    const signature: SignaturePosition = {
      id,
      name,
      align,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      element: htmlElement,
      signerKey,
      label,
      loopRef,
      referenceField,
      className,
      customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
      parentElement,
      siblings,
      context,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0.0'
      }
    };
    
    signatures.push(signature);
  });
  
  return {
    signatures,
    totalCount: signatures.length,
    hasSignatures: signatures.length > 0
  };
}

/**
 * Analyse les éléments frères (siblings) d'une signature
 * @param element - L'élément signature
 * @returns Les éléments avant et après
 */
function analyzeSiblings(element: HTMLElement): {
  before: string[];
  after: string[];
} {
  const before: string[] = [];
  const after: string[] = [];
  
  if (element.parentElement) {
    const children = Array.from(element.parentElement.children);
    const elementIndex = children.indexOf(element);
    
    // Éléments avant
    for (let i = 0; i < elementIndex; i++) {
      const sibling = children[i] as HTMLElement;
      if (sibling.tagName && sibling.textContent?.trim()) {
        before.push(`${sibling.tagName.toLowerCase()}: ${sibling.textContent.trim().substring(0, 50)}...`);
      }
    }
    
    // Éléments après
    for (let i = elementIndex + 1; i < children.length; i++) {
      const sibling = children[i] as HTMLElement;
      if (sibling.tagName && sibling.textContent?.trim()) {
        after.push(`${sibling.tagName.toLowerCase()}: ${sibling.textContent.trim().substring(0, 50)}...`);
      }
    }
  }
  
  return { before, after };
}

/**
 * Analyse le contexte d'une signature dans le document
 * @param element - L'élément signature
 * @param index - L'index de la signature
 * @returns Le contexte du document
 */
function analyzeContext(element: HTMLElement, index: number): {
  pageNumber?: number;
  section?: string;
  paragraphIndex?: number;
} {
  const context: {
    pageNumber?: number;
    section?: string;
    paragraphIndex?: number;
  } = {};
  
  // Détecter la section (basé sur les titres h1, h2, etc.)
  let currentElement = element.parentElement;
  while (currentElement && !context.section) {
    if (currentElement.tagName && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentElement.tagName)) {
      context.section = currentElement.textContent?.trim() || undefined;
      break;
    }
    currentElement = currentElement.parentElement;
  }
  
  // Compter les paragraphes avant cette signature
  if (element.parentElement) {
    const allParagraphs = element.parentElement.querySelectorAll('p');
    let paragraphIndex = 0;
    for (let i = 0; i < allParagraphs.length; i++) {
      if (allParagraphs[i].contains(element)) {
        paragraphIndex = i;
        break;
      }
    }
    context.paragraphIndex = paragraphIndex;
  }
  
  // 1. Priorité : Utiliser l'attribut data-page du plugin CKEditor
  const ckPage = element.getAttribute('data-page');
  if (ckPage) {
    const pageNum = parseInt(ckPage);
    if (!isNaN(pageNum) && pageNum > 0) {
      context.pageNumber = pageNum;
      return context;
    }
  }
  
  // 2. Calculer le numéro de page basé sur la position dans le contenu
  const container = element.closest('.ck') || element.parentElement;
  if (container) {
    // Compter tous les éléments de contenu avant cette signature
    const allElements = Array.from(container.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, ul, ol, li, table, img'));
    const signatureIndex = allElements.findIndex(el => el.contains(element) || el === element);
    
    if (signatureIndex >= 0) {
      // Estimer la hauteur du contenu (approximativement 20px par élément)
      const estimatedHeight = signatureIndex * 20;
      // A4 = 842px de hauteur, avec marges = ~800px utilisable
      context.pageNumber = Math.max(1, Math.floor(estimatedHeight / 800) + 1);
    } else {
      // Fallback : calcul basé sur l'index
      context.pageNumber = Math.max(1, Math.floor(index / 10) + 1);
    }
  } else {
    // Fallback : calcul basé sur l'index
    context.pageNumber = Math.max(1, Math.floor(index / 10) + 1);
  }
  
  return context;
}

/**
 * Calcule la position approximative d'un élément signature
 * Dans un contexte réel, on utiliserait getBoundingClientRect()
 * @param element - L'élément HTML
 * @param index - L'index de l'élément dans la liste
 * @returns Les coordonnées et dimensions
 */
function calculateElementPosition(element: HTMLElement, index: number): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  // Valeurs par défaut pour les signatures
  const defaultWidth = 120;
  const defaultHeight = 60;
  
  // Calculer la position Y basée sur l'index et la hauteur des éléments précédents
  const baseY = 100; // Position de base
  const lineHeight = 80; // Hauteur approximative d'une ligne
  const y = baseY + (index * lineHeight);
  
  // Calculer la position X basée sur l'alignement
  let x = 50; // Position par défaut (gauche)
  
  const align = element.getAttribute('data-align');
  if (align === 'center') {
    x = 200; // Centre approximatif
  } else if (align === 'right') {
    x = 350; // Droite approximative
  }
  
  return {
    x,
    y,
    width: defaultWidth,
    height: defaultHeight
  };
}

/**
 * Scanne les signatures avec des coordonnées réelles (nécessite un contexte de rendu)
 * @param templateHtml - Le contenu HTML du template
 * @param containerElement - L'élément conteneur où le template est rendu
 * @returns Les positions réelles des signatures
 */
export function scanSignaturesWithRealCoordinates(
  templateHtml: string, 
  containerElement: HTMLElement
): SignaturePosition[] {
  // Injecter le HTML dans le conteneur temporairement
  const originalContent = containerElement.innerHTML;
  containerElement.innerHTML = templateHtml;
  
  const signatures: SignaturePosition[] = [];
  const signatureElements = containerElement.querySelectorAll('.ck-signature-zone');
  
  signatureElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;
    const rect = htmlElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    
    // Calculer les coordonnées relatives au conteneur
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    
    // Extraire les attributs de base
    const id = htmlElement.getAttribute('data-id') || `signature-${index}`;
    const name = htmlElement.getAttribute('data-name') || undefined;
    const align = (htmlElement.getAttribute('data-align') || 'left') as 'left' | 'center' | 'right';
    
    // Extraire les attributs étendus
    const signerKey = htmlElement.getAttribute('data-signer-key') || 
                     htmlElement.getAttribute('data-name') || 
                     undefined;
    const label = htmlElement.getAttribute('data-label') || 
                 htmlElement.getAttribute('data-name') || 
                 undefined;
    const loopRef = htmlElement.getAttribute('data-loop-ref') || 
                   htmlElement.getAttribute('data-loop') || 
                   undefined;
    const referenceField = htmlElement.getAttribute('data-reference-field') || 
                          htmlElement.getAttribute('data-ref') || 
                          undefined;
    
    // Extraire les classes CSS
    const className = htmlElement.className || undefined;
    
    // Extraire tous les attributs personnalisés
    const customAttributes: Record<string, string> = {};
    Array.from(htmlElement.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && !['data-id', 'data-name', 'data-align', 'data-signer-key', 'data-label', 'data-loop-ref', 'data-reference-field', 'data-loop', 'data-ref', 'data-page', 'data-x', 'data-y', 'data-w', 'data-h', 'data-unit', 'data-placed'].includes(attr.name)) {
        customAttributes[attr.name] = attr.value;
      }
    });
    
    // Analyser le contexte parent
    const parentElement = htmlElement.parentElement?.tagName?.toLowerCase() || undefined;
    
    // Analyser les éléments frères (siblings)
    const siblings = analyzeSiblings(htmlElement);
    
    // Analyser le contexte du document
    const context = analyzeContext(htmlElement, index);
    
    // Créer l'objet signature détaillé
    const signature: SignaturePosition = {
      id,
      name,
      align,
      x,
      y,
      width: rect.width,
      height: rect.height,
      element: htmlElement,
      signerKey,
      label,
      loopRef,
      referenceField,
      className,
      customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
      parentElement,
      siblings,
      context,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: '1.0.0'
      }
    };
    
    signatures.push(signature);
  });
  
  // Restaurer le contenu original
  containerElement.innerHTML = originalContent;
  
  return signatures;
}

/**
 * Filtre les signatures par nom
 * @param signatures - Liste des signatures
 * @param name - Nom à rechercher
 * @returns Signatures correspondantes
 */
export function filterSignaturesByName(signatures: SignaturePosition[], name: string): SignaturePosition[] {
  return signatures.filter(sig => sig.name === name);
}

/**
 * Filtre les signatures par alignement
 * @param signatures - Liste des signatures
 * @param align - Alignement à rechercher
 * @returns Signatures correspondantes
 */
export function filterSignaturesByAlign(signatures: SignaturePosition[], align: 'left' | 'center' | 'right'): SignaturePosition[] {
  return signatures.filter(sig => sig.align === align);
}

/**
 * Trouve la signature la plus proche d'un point donné
 * @param signatures - Liste des signatures
 * @param x - Coordonnée X du point
 * @param y - Coordonnée Y du point
 * @returns Signature la plus proche ou null
 */
export function findNearestSignature(signatures: SignaturePosition[], x: number, y: number): SignaturePosition | null {
  if (signatures.length === 0) return null;
  
  let nearest = signatures[0];
  let minDistance = calculateDistance(x, y, nearest.x, nearest.y);
  
  for (let i = 1; i < signatures.length; i++) {
    const signature = signatures[i];
    const distance = calculateDistance(x, y, signature.x, signature.y);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = signature;
    }
  }
  
  return nearest;
}

/**
 * Calcule la distance entre deux points
 * @param x1 - Coordonnée X du premier point
 * @param y1 - Coordonnée Y du premier point
 * @param x2 - Coordonnée X du deuxième point
 * @param y2 - Coordonnée Y du deuxième point
 * @returns Distance euclidienne
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Retourne directement un tableau d'objets signature détaillés
 * @param templateHtml - Le contenu HTML du template
 * @returns Tableau d'objets SignaturePosition détaillés
 */
export function getDetailedSignatures(templateHtml: string): SignaturePosition[] {
  const result = scanSignaturesInTemplate(templateHtml);
  return result.signatures;
}

/**
 * Convertit les signatures détaillées en format standardisé pour les APIs de signature électronique
 * @param signatures - Tableau de signatures détaillées
 * @param documentWidth - Largeur du document en pixels (par défaut: 595 pour A4)
 * @param documentHeight - Hauteur du document en pixels (par défaut: 842 pour A4)
 * @returns Tableau de signatures standardisées
 */
export function standardizeSignatures(
  signatures: SignaturePosition[], 
  documentWidth: number = 595, 
  documentHeight: number = 842
): StandardizedSignature[] {
  return signatures.map(signature => {
    // Normaliser les coordonnées [0..1]
    const normalizedX = signature.x / documentWidth;
    const normalizedY = signature.y / documentHeight;
    const normalizedWidth = signature.width / documentWidth;
    const normalizedHeight = signature.height / documentHeight;
    
    // Déterminer le type de tab basé sur les attributs
    let tabType: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | 'radio' | 'list' | 'dropdown' | 'number' | 'ssn' | 'email' | 'formula' = 'signature';
    if (signature.name?.includes('initial')) {
      tabType = 'initial';
    } else if (signature.name?.includes('date')) {
      tabType = 'date';
    } else if (signature.name?.includes('text')) {
      tabType = 'text';
    } else if (signature.name?.includes('checkbox')) {
      tabType = 'checkbox';
    } else if (signature.name?.includes('radio')) {
      tabType = 'radio';
    } else if (signature.name?.includes('list')) {
      tabType = 'list';
    } else if (signature.name?.includes('dropdown')) {
      tabType = 'dropdown';
    } else if (signature.name?.includes('number')) {
      tabType = 'number';
    } else if (signature.name?.includes('ssn')) {
      tabType = 'ssn';
    } else if (signature.name?.includes('email')) {
      tabType = 'email';
    } else if (signature.name?.includes('formula')) {
      tabType = 'formula';
    }
    
    // Générer une chaîne d'ancrage basée sur le contexte
    const anchorString = generateAnchorString(signature);
    
    // Extraire les styles CSS de l'élément original
    const computedStyle = extractElementStyles(signature.element);
    
    // Créer l'objet signature standardisé complet
    const standardizedSignature: StandardizedSignature = {
      // === IDENTIFICATION ===
      id: signature.id,
      label: signature.label || signature.name || signature.id,
      signerKey: signature.signerKey || signature.name || signature.id,
      name: signature.name,
      description: signature.label,
      align: signature.align,
      
      // === POSITION ET DIMENSIONS ===
      page: signature.context?.pageNumber || 1,
      x: Math.max(0, Math.min(1, normalizedX)), // Clamp entre 0 et 1
      y: Math.max(0, Math.min(1, normalizedY)), // Clamp entre 0 et 1
      width: Math.max(0.01, Math.min(1, normalizedWidth)), // Minimum 1% de largeur
      height: Math.max(0.01, Math.min(1, normalizedHeight)), // Minimum 1% de hauteur
      
      // === COORDONNÉES ABSOLUES ===
      absoluteX: signature.x,
      absoluteY: signature.y,
      absoluteWidth: signature.width,
      absoluteHeight: signature.height,
      
      // === ATTRIBUTS PLUGIN CKEDITOR ===
      ckPage: signature.context?.pageNumber,
      ckX: signature.customAttributes?.['data-x'] ? parseFloat(signature.customAttributes['data-x']) : undefined,
      ckY: signature.customAttributes?.['data-y'] ? parseFloat(signature.customAttributes['data-y']) : undefined,
      ckW: signature.customAttributes?.['data-w'] ? parseFloat(signature.customAttributes['data-w']) : undefined,
      ckH: signature.customAttributes?.['data-h'] ? parseFloat(signature.customAttributes['data-h']) : undefined,
      ckUnit: signature.customAttributes?.['data-unit'] || 'px',
      ckPlaced: signature.customAttributes?.['data-placed'] === 'true',
      
      // === ANCRAGE ET POSITIONNEMENT ===
      anchorString,
      anchorXOffset: 0,
      anchorYOffset: 0,
      anchorIgnoreIfNotPresent: false,
      anchorCaseSensitive: false,
      anchorMatchWholeWord: false,
      
      // === TYPE ET COMPORTEMENT ===
      tabType,
      required: true,
      locked: false,
      shared: false,
      
      // === VALIDATION ===
      validation: {
        maxLength: tabType === 'text' ? 255 : undefined,
        minLength: tabType === 'text' ? 1 : undefined,
        customTabId: signature.id
      },
      
      // === STYLE ET APPARENCE ===
      style: computedStyle,
      
      // === MÉTADONNÉES DOCUMENT ===
      documentId: undefined, // À définir par l'utilisateur
      recipientId: undefined, // À définir par l'utilisateur
      recipientEmail: undefined, // À définir par l'utilisateur
      recipientName: undefined, // À définir par l'utilisateur
      recipientRole: undefined, // À définir par l'utilisateur
      
      // === OPTIONS SPÉCIFIQUES PAR TYPE ===
      options: getTypeSpecificOptions(tabType, signature),
      
      // === MÉTADONNÉES TECHNIQUES ===
      metadata: {
        createdAt: signature.metadata?.createdAt || new Date(),
        lastModified: signature.metadata?.lastModified || new Date(),
        version: signature.metadata?.version || '1.0.0',
        source: 'smart-editor',
        originalElement: {
          tagName: signature.element.tagName.toLowerCase(),
          className: signature.className || '',
          attributes: signature.customAttributes || {}
        }
      },
      
      // === WORKFLOW ===
      workflow: {
        order: undefined, // À définir par l'utilisateur
        groupId: signature.loopRef,
        dependsOn: [],
        triggers: []
      }
    };
    
    return standardizedSignature;
  });
}

/**
 * Extrait les styles CSS d'un élément HTML
 * @param element - Élément HTML
 * @returns Objet de styles
 */
function extractElementStyles(element: HTMLElement): {
  font?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  opacity?: number;
} {
  const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
  
  if (!computedStyle) {
    // Fallback pour les environnements sans getComputedStyle
    return {
      borderColor: '#ccc',
      borderWidth: 2,
      borderStyle: 'dashed',
      backgroundColor: '#f9f9f9',
      borderRadius: 4
    };
  }
  
  return {
    font: computedStyle.fontFamily || undefined,
    fontSize: computedStyle.fontSize || undefined,
    fontColor: computedStyle.color || undefined,
    backgroundColor: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computedStyle.backgroundColor : undefined,
    borderColor: computedStyle.borderColor || '#ccc',
    borderWidth: parseInt(computedStyle.borderWidth) || 2,
    borderStyle: (computedStyle.borderStyle as 'solid' | 'dashed' | 'dotted') || 'dashed',
    borderRadius: parseInt(computedStyle.borderRadius) || 4,
    opacity: parseFloat(computedStyle.opacity) || 1
  };
}

/**
 * Génère les options spécifiques selon le type de tab
 * @param tabType - Type de tab
 * @param signature - Signature originale
 * @returns Options spécifiques au type
 */
function getTypeSpecificOptions(
  tabType: string, 
  signature: SignaturePosition
): {
  listItems?: Array<{ text: string; value: string; selected?: boolean; }>;
  checked?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  formula?: string;
} | undefined {
  switch (tabType) {
    case 'checkbox':
      return {
        checked: false
      };
    
    case 'date':
      return {
        dateFormat: 'dd/MM/yyyy'
      };
    
    case 'number':
      return {
        numberFormat: '#,##0.00'
      };
    
    case 'list':
    case 'dropdown':
      // Extraire les options depuis les attributs personnalisés
      const listItems = signature.customAttributes?.['data-list-items'];
      if (listItems) {
        try {
          const items = JSON.parse(listItems);
          return {
            listItems: Array.isArray(items) ? items.map((item: any) => ({
              text: item.text || item.label || item,
              value: item.value || item.text || item.label || item,
              selected: item.selected || false
            })) : []
          };
        } catch {
          return undefined;
        }
      }
      return undefined;
    
    case 'formula':
      return {
        formula: signature.customAttributes?.['data-formula'] || ''
      };
    
    default:
      return undefined;
  }
}

/**
 * Génère une chaîne d'ancrage basée sur le contexte de la signature
 * @param signature - Signature à analyser
 * @returns Chaîne d'ancrage ou undefined
 */
function generateAnchorString(signature: SignaturePosition): string | undefined {
  // Chercher dans les siblings pour trouver un texte d'ancrage approprié
  if (signature.siblings?.before) {
    for (const sibling of signature.siblings.before) {
      if (sibling.includes('signature') || sibling.includes('signer') || sibling.includes('signé')) {
        return `Signature_${signature.id}`;
      }
    }
  }
  
  if (signature.siblings?.after) {
    for (const sibling of signature.siblings.after) {
      if (sibling.includes('signature') || sibling.includes('signer') || sibling.includes('signé')) {
        return `Signature_${signature.id}`;
      }
    }
  }
  
  // Utiliser le nom de la signature comme ancrage
  if (signature.name) {
    return `Anchor_${signature.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
  
  return undefined;
}

/**
 * Retourne directement un tableau de signatures standardisées
 * @param templateHtml - Le contenu HTML du template
 * @param documentWidth - Largeur du document en pixels
 * @param documentHeight - Hauteur du document en pixels
 * @returns Tableau de signatures standardisées
 */
export function getStandardizedSignatures(
  templateHtml: string, 
  documentWidth: number = 595, 
  documentHeight: number = 842
): StandardizedSignature[] {
  const detailedSignatures = getDetailedSignatures(templateHtml);
  return standardizeSignatures(detailedSignatures, documentWidth, documentHeight);
}

/**
 * Génère un rapport des signatures trouvées
 * @param result - Résultat du scan
 * @returns Rapport formaté
 */
export function generateSignatureReport(result: SignatureScanResult): string {
  if (!result.hasSignatures) {
    return "Aucune signature trouvée dans le template.";
  }
  
  let report = `Rapport des signatures (${result.totalCount} trouvée${result.totalCount > 1 ? 's' : ''}):\n\n`;
  
  result.signatures.forEach((sig, index) => {
    report += `${index + 1}. Signature "${sig.name || sig.id}"\n`;
    report += `   - ID: ${sig.id}\n`;
    report += `   - Position: (${sig.x}, ${sig.y})\n`;
    report += `   - Dimensions: ${sig.width}x${sig.height}\n`;
    report += `   - Alignement: ${sig.align}\n`;
    if (sig.signerKey) report += `   - Signer Key: ${sig.signerKey}\n`;
    if (sig.label) report += `   - Label: ${sig.label}\n`;
    if (sig.loopRef) report += `   - Loop Ref: ${sig.loopRef}\n`;
    if (sig.parentElement) report += `   - Parent: ${sig.parentElement}\n`;
    if (sig.context?.section) report += `   - Section: ${sig.context.section}\n`;
    if (sig.context?.pageNumber) report += `   - Page: ${sig.context.pageNumber}\n`;
    report += `\n`;
  });
  
  return report;
}

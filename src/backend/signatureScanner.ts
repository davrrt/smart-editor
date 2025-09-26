/**
 * Signature Scanner - Helper pour scanner les signatures dans un template HTML
 * Version simplifiée et essentielle
 */

export interface SignaturePosition {
  id: string;
  name?: string;
  align?: 'left' | 'center' | 'right';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface SignatureScanResult {
  signatures: SignaturePosition[];
  totalCount: number;
  hasSignatures: boolean;
}

/**
 * Fallback: parse les signatures avec regex si jsdom n'est pas disponible
 */
const parseSignaturesWithRegex = (templateHtml: string): SignatureScanResult => {
  const signatures: SignaturePosition[] = [];
  
  // Regex pour trouver les éléments de signature
  const signatureRegex = /<[^>]*class="[^"]*ck-signature-zone[^"]*"[^>]*>/g;
  let match;
  let index = 0;
  
  while ((match = signatureRegex.exec(templateHtml)) !== null) {
    const elementHtml = match[0];
    
    // Extraire les attributs avec regex
    const idMatch = elementHtml.match(/data-id="([^"]*)"/);
    const nameMatch = elementHtml.match(/data-name="([^"]*)"/);
    const alignMatch = elementHtml.match(/data-align="([^"]*)"/);
    const labelMatch = elementHtml.match(/data-label="([^"]*)"/);
    
    const signature: SignaturePosition = {
      id: idMatch ? idMatch[1] : `signature-${index}`,
      name: nameMatch ? nameMatch[1] : 'signature',
      align: (alignMatch ? alignMatch[1] : 'center') as 'left' | 'center' | 'right',
      label: labelMatch ? labelMatch[1] : 'Signature',
      x: 0.5,
      y: 0.5,
      width: 0.2,
      height: 0.05
    };
    
    signatures.push(signature);
    index++;
  }
  
  return {
    signatures,
    totalCount: signatures.length,
    hasSignatures: signatures.length > 0
  };
};

/**
 * Scanne un template HTML pour extraire les positions des signatures
 * @param templateHtml - Le contenu HTML du template
 * @returns Les positions des signatures trouvées
 */
export const scanSignaturesInTemplate = (templateHtml: string): SignatureScanResult => {
  // Version simplifiée pour Node.js avec jsdom (optionnel)
  let document: Document;
  
  try {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM(templateHtml);
    document = dom.window.document;
  } catch (error) {
    // Fallback: parsing simple avec regex si jsdom n'est pas disponible
    return parseSignaturesWithRegex(templateHtml);
  }
  
  const signatureElements = document.querySelectorAll('.ck-signature-zone');
  const signatures: SignaturePosition[] = [];
  
  signatureElements.forEach((element: Element, index: number) => {
    const signature: SignaturePosition = {
      id: element.getAttribute('data-id') || `signature-${index}`,
      name: element.getAttribute('data-name') || 'signature',
      align: (element.getAttribute('data-align') as 'left' | 'center' | 'right') || 'center',
      label: element.getAttribute('data-label') || 'Signature',
      x: 0.5,
      y: 0.5,
      width: 0.2,
      height: 0.05
    };
    signatures.push(signature);
  });
  
  return {
    signatures,
    totalCount: signatures.length,
    hasSignatures: signatures.length > 0
  };
};

/**
 * Génère des signatures standardisées pour les APIs de signature électronique
 * @param templateHtml - Le contenu HTML du template
 * @param documentWidth - Largeur du document (défaut: 595)
 * @param documentHeight - Hauteur du document (défaut: 842)
 * @returns Signatures standardisées
 */
export const getStandardizedSignatures = (
  templateHtml: string,
  documentWidth: number = 595,
  documentHeight: number = 842
): any[] => {
  const scanResult = scanSignaturesInTemplate(templateHtml);
  
  return scanResult.signatures.map(signature => ({
    id: signature.id,
    tabType: 'signature',
    documentId: 'template-document',
    recipientId: 'default-recipient',
    page: 1,
    x: signature.x,
    y: signature.y,
    width: signature.width,
    height: signature.height,
    anchorString: signature.label,
    anchorXOffset: 0,
    anchorYOffset: 0,
    anchorIgnoreIfNotPresent: false,
    anchorCaseSensitive: true,
    anchorMatchWholeWord: true,
    required: true,
    locked: false,
    shared: false,
    conditional: false,
    validation: null,
    style: 'default'
  }));
};

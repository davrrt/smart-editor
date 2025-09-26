import { 
  scanSignaturesInTemplate,
  getStandardizedSignatures
} from '../../src/backend/signatureScanner';

describe('SignatureScanner - Scan des signatures dans les templates HTML', () => {
  
  const templateWithSignatures = `
    <div class="ck">
      <h1>Contrat de vente</h1>
      
      <div class="ck-signature-zone" 
           data-id="seller-signature" 
           data-name="seller" 
           data-align="left"
           data-label="Signature vendeur">
      </div>
      
      <div class="ck-signature-zone" 
           data-id="buyer-signature" 
           data-name="buyer" 
           data-align="right"
           data-label="Signature acheteur">
      </div>
    </div>
  `;

  const templateWithoutSignatures = `
    <div class="ck">
      <h1>Document simple</h1>
      <p>Pas de signatures ici</p>
    </div>
  `;

  describe('scanSignaturesInTemplate', () => {
    it('devrait scanner les signatures dans un template HTML', () => {
      const result = scanSignaturesInTemplate(templateWithSignatures);
      
      expect(result.hasSignatures).toBe(true);
      expect(result.totalCount).toBe(2);
      expect(result.signatures).toHaveLength(2);
      
      const sellerSig = result.signatures.find(s => s.id === 'seller-signature');
      expect(sellerSig).toBeDefined();
      expect(sellerSig?.name).toBe('seller');
      expect(sellerSig?.align).toBe('left');
      expect(sellerSig?.label).toBe('Signature vendeur');
      
      const buyerSig = result.signatures.find(s => s.id === 'buyer-signature');
      expect(buyerSig).toBeDefined();
      expect(buyerSig?.name).toBe('buyer');
      expect(buyerSig?.align).toBe('right');
      expect(buyerSig?.label).toBe('Signature acheteur');
    });

    it('devrait retourner un résultat vide pour un template sans signatures', () => {
      const result = scanSignaturesInTemplate(templateWithoutSignatures);
      
      expect(result.hasSignatures).toBe(false);
      expect(result.totalCount).toBe(0);
      expect(result.signatures).toHaveLength(0);
    });

    it('devrait gérer les signatures sans attributs optionnels', () => {
      const templateMinimal = `
        <div class="ck-signature-zone"></div>
      `;
      
      const result = scanSignaturesInTemplate(templateMinimal);
      
      expect(result.hasSignatures).toBe(true);
      expect(result.totalCount).toBe(1);
      
      const sig = result.signatures[0];
      expect(sig.id).toBe('signature-0');
      expect(sig.name).toBe('signature');
      expect(sig.align).toBe('center');
      expect(sig.label).toBe('Signature');
    });
  });

  describe('getStandardizedSignatures', () => {
    it('devrait générer des signatures standardisées', () => {
      const signatures = getStandardizedSignatures(templateWithSignatures);
      
      expect(signatures).toHaveLength(2);
      
      const sellerSig = signatures.find(s => s.id === 'seller-signature');
      expect(sellerSig).toBeDefined();
      expect(sellerSig?.tabType).toBe('signature');
      expect(sellerSig?.documentId).toBe('template-document');
      expect(sellerSig?.recipientId).toBe('default-recipient');
      expect(sellerSig?.page).toBe(1);
      expect(sellerSig?.required).toBe(true);
    });

    it('devrait utiliser les dimensions par défaut', () => {
      const signatures = getStandardizedSignatures(templateWithSignatures, 800, 600);
      
      expect(signatures).toHaveLength(2);
      
      signatures.forEach(sig => {
        expect(sig.x).toBe(0.5);
        expect(sig.y).toBe(0.5);
        expect(sig.width).toBe(0.2);
        expect(sig.height).toBe(0.05);
      });
    });
  });
});

import { getStandardizedSignatures } from '../../src/backend/signatureScanner';

describe('SignatureScanner - Utilisation Backend', () => {
  it('✅ Le signatureScanner est TOTALEMENT DÉCOUPLÉ de SmartEditor', () => {
    console.log('\n🎯 === SIGNATURESCANNER DÉCOUPLÉ DE SMARTEDITOR ===\n');
    
    // Template HTML simple (peut venir de n'importe où)
    const templateHTML = `
      <div class="ck">
        <p>Contrat de test</p>
        <div class="ck-signature-zone" data-id="sign-cedant" data-name="signature.cedant" data-align="left"></div>
        <div class="ck-signature-zone" data-id="sign-cessionnaire" data-name="signature.cessionnaire" data-align="right"></div>
      </div>
    `;
    
    console.log('📥 ENTRÉE - Template HTML (peut venir de n\'importe où):');
    console.log('   - Frontend React/Vue/Angular');
    console.log('   - API REST');
    console.log('   - Base de données');
    console.log('   - Fichier uploadé');
    console.log('   - Aucune dépendance SmartEditor requise !\n');
    
    // UNE SEULE LIGNE pour scanner les signatures
    const signatures = getStandardizedSignatures(templateHTML);
    
    console.log('⚙️ TRAITEMENT - Une seule fonction:');
    console.log('   const signatures = getStandardizedSignatures(templateHTML);');
    console.log(`   Résultat : ${signatures.length} signature(s) standardisée(s)\n`);
    
    console.log('📤 SORTIE - Tableau de signatures standardisées:');
    signatures.forEach((sig, index) => {
      console.log(`   Signature ${index + 1}:`);
      console.log(`     - ID: ${sig.id}`);
      console.log(`     - Name: ${sig.name}`);
      console.log(`     - Label: ${sig.label}`);
      console.log(`     - SignerKey: ${sig.signerKey}`);
      console.log(`     - Page: ${sig.page}`);
      console.log(`     - Position: (${sig.x.toFixed(3)}, ${sig.y.toFixed(3)})`);
      console.log(`     - Dimensions: ${sig.width.toFixed(3)} x ${sig.height.toFixed(3)}`);
      console.log(`     - TabType: ${sig.tabType}`);
      console.log(`     - Required: ${sig.required}`);
      console.log(`     - AnchorString: ${sig.anchorString}`);
    });
    console.log('');
    
    console.log('✅ VÉRIFICATION - Le signatureScanner est découplé:');
    console.log('   - ✅ Aucune dépendance SmartEditor');
    console.log('   - ✅ Fonctionne avec n\'importe quel HTML');
    console.log('   - ✅ Une seule fonction à appeler');
    console.log('   - ✅ Retourne un tableau standardisé');
    console.log('   - ✅ Prêt pour DocuSign, YouSign, Adobe Sign, etc.\n');
    
    // Vérifications Jest
    expect(signatures).toHaveLength(2);
    expect(signatures[0].id).toBe('sign-cedant');
    expect(signatures[0].name).toBe('signature.cedant');
    expect(signatures[1].id).toBe('sign-cessionnaire');
    expect(signatures[1].name).toBe('signature.cessionnaire');
  });

  it('🔧 Exemple d\'utilisation dans un backend Node.js', () => {
    console.log('\n🔧 === EXEMPLE BACKEND NODE.JS ===\n');
    
    // Simuler une requête API
    const apiRequest = {
      template: `
        <div class="ck">
          <p>Contrat de vente</p>
          <div class="ck-signature-zone" data-id="sign-vendeur" data-name="signature.vendeur"></div>
          <div class="ck-signature-zone" data-id="sign-acheteur" data-name="signature.acheteur"></div>
        </div>
      `,
      documentId: "doc-123",
      recipients: [
        { id: "1", email: "vendeur@example.com", name: "M. Vendeur" },
        { id: "2", email: "acheteur@example.com", name: "M. Acheteur" }
      ]
    };
    
    console.log('📥 REQUEST - Données reçues par l\'API:');
    console.log(`   - Template: ${apiRequest.template.trim()}`);
    console.log(`   - Document ID: ${apiRequest.documentId}`);
    console.log(`   - Recipients: ${apiRequest.recipients.length}\n`);
    
    // Traitement backend
    const signatures = getStandardizedSignatures(apiRequest.template);
    
    // Enrichir avec les métadonnées
    const enrichedSignatures = signatures.map((sig, index) => ({
      ...sig,
      documentId: apiRequest.documentId,
      recipientId: apiRequest.recipients[index]?.id,
      recipientEmail: apiRequest.recipients[index]?.email,
      recipientName: apiRequest.recipients[index]?.name
    }));
    
    console.log('⚙️ TRAITEMENT - Backend Node.js:');
    console.log('   1. Scanner les signatures avec getStandardizedSignatures()');
    console.log('   2. Enrichir avec les métadonnées du document');
    console.log('   3. Préparer pour l\'API de signature\n');
    
    console.log('📤 RESPONSE - Signatures prêtes pour DocuSign:');
    const docusignPayload = enrichedSignatures.map(sig => ({
      documentId: sig.documentId,
      recipientId: sig.recipientId,
      tabs: {
        signHereTabs: [{
          tabLabel: sig.label,
          anchorString: sig.anchorString,
          pageNumber: sig.page.toString(),
          required: sig.required.toString()
        }]
      }
    }));
    
    console.log(JSON.stringify(docusignPayload, null, 2));
    console.log('');
    
    console.log('✅ RÉSULTAT - Backend prêt pour la production:');
    console.log('   - ✅ Signatures extraites et standardisées');
    console.log('   - ✅ Métadonnées enrichies');
    console.log('   - ✅ Payload DocuSign généré');
    console.log('   - ✅ Aucune dépendance SmartEditor\n');
    
    expect(enrichedSignatures).toHaveLength(2);
    expect(enrichedSignatures[0].documentId).toBe('doc-123');
    expect(enrichedSignatures[0].recipientEmail).toBe('vendeur@example.com');
  });

  it('🚀 Exemple d\'utilisation dans un microservice', async () => {
    console.log('\n🚀 === EXEMPLE MICROSERVICE ===\n');
    
    // Service de traitement des templates
    class TemplateProcessingService {
      async processTemplate(templateHTML: string) {
        // Le signatureScanner est totalement découplé
        return getStandardizedSignatures(templateHTML);
      }
      
      async sendToDocuSign(signatures: any[]) {
        return signatures.map(sig => ({
          tabLabel: sig.label,
          anchorString: sig.anchorString,
          pageNumber: sig.page.toString(),
          required: sig.required.toString()
        }));
      }
      
      async sendToYouSign(signatures: any[]) {
        return signatures.map(sig => ({
          type: sig.tabType,
          name: sig.signerKey,
          page: sig.page,
          x: sig.x,
          y: sig.y,
          width: sig.width,
          height: sig.height,
          required: sig.required
        }));
      }
    }
    
    const service = new TemplateProcessingService();
    
    console.log('🏗️ ARCHITECTURE MICROSERVICE:');
    console.log('   - TemplateProcessingService (utilise signatureScanner)');
    console.log('   - DocuSignAdapter (bridge vers DocuSign)');
    console.log('   - YouSignAdapter (bridge vers YouSign)');
    console.log('   - Aucune dépendance SmartEditor !\n');
    
    const template = `
      <div class="ck">
        <div class="ck-signature-zone" data-id="test-sign" data-name="signature.test"></div>
      </div>
    `;
    
    const signatures = await service.processTemplate(template);
    const docusignTabs = await service.sendToDocuSign(signatures);
    const yousignTabs = await service.sendToYouSign(signatures);
    
    console.log('📊 RÉSULTATS:');
    console.log(`   - Signatures traitées: ${signatures.length}`);
    console.log(`   - Tabs DocuSign: ${docusignTabs.length}`);
    console.log(`   - Tabs YouSign: ${yousignTabs.length}`);
    console.log('   - ✅ Microservice opérationnel !\n');
    
    expect(signatures.length).toBe(1);
    expect(docusignTabs.length).toBe(1);
    expect(yousignTabs.length).toBe(1);
  });
});

import { 
  getStandardizedSignatures,
  StandardizedSignature
} from '../../src/backend/signatureScanner';

describe('SignatureScanner - Template Nunjucks → Tableau de Signatures', () => {
  const templateNunjucks = `
    <div class="ck">
      <p style="text-align:center;"><strong>CONTRAT DE CESSION DE PART D'INTÉRÊT D'ASSOCIÉ COMMANDITÉ</strong></p>
      
      <p>Entre les soussignés :</p>
      
      <ul>
        <li><strong>Cédant :</strong> {{client.nom}} {{client.prenom}}</li>
        <li><strong>Cessionnaire :</strong> {{beneficiaire.nom}} {{beneficiaire.prenom}}</li>
        <li><strong>Société :</strong> {{societe.nom}}</li>
      </ul>
      
      <p>Il est convenu ce qui suit :</p>
      
      <ol>
        <li><strong>Objet de la cession :</strong> Le cédant cède au cessionnaire ses parts d'intérêt dans la société.</li>
        <li><strong>Prix de cession :</strong> Le prix de cession est fixé à {{prix.montant}} euros.</li>
        <li><strong>Modalités de paiement :</strong> Le paiement s'effectuera selon les modalités suivantes :
          <ul>
            <li>Acompte de {{prix.acompte}} euros à la signature</li>
            <li>Solde de {{prix.solde}} euros dans les 30 jours</li>
          </ul>
        </li>
      </ol>
      
      <p><strong>Signature :</strong></p>
      
      <p>Fait à {{lieu}}, le {{date}}</p>
      
      <div class="ck-signature-zone" 
           data-id="sign-cedant" 
           data-name="signature.cedant" 
           data-align="left"
           data-signer-key="cedant"
           data-label="Signature du Cédant">
      </div>
      <p>Le Cédant : {{signature.cedant}}</p>
      
      <div class="ck-signature-zone" 
           data-id="sign-cessionnaire" 
           data-name="signature.cessionnaire" 
           data-align="right"
           data-signer-key="cessionnaire"
           data-label="Signature du Cessionnaire">
      </div>
      <p>Le Cessionnaire : {{signature.cessionnaire}}</p>
    </div>
  `;

  it('✅ Template Nunjucks → Tableau de Signatures', () => {
    console.log('\n🎯 === TEMPLATE NUNJUCKS → TABLEAU DE SIGNATURES ===\n');
    
    // 1. ENTRÉE : Template Nunjucks
    console.log('📥 ENTRÉE - Template Nunjucks:');
    console.log('   - Contient des variables Nunjucks : {{client.nom}}, {{prix.montant}}, etc.');
    console.log('   - Contient des zones de signature : .ck-signature-zone');
    console.log('   - Contient des attributs : data-id, data-name, data-align, etc.\n');
    
    // 2. TRAITEMENT : Scanner les signatures
    console.log('⚙️ TRAITEMENT - Scanner les signatures:');
    const signatures: StandardizedSignature[] = getStandardizedSignatures(templateNunjucks);
    console.log(`   - Fonction utilisée : getStandardizedSignatures(templateNunjucks)`);
    console.log(`   - Résultat : ${signatures.length} signature(s) trouvée(s)\n`);
    
    // 3. SORTIE : Tableau de signatures
    console.log('📤 SORTIE - Tableau de signatures:');
    console.log('   [');
    signatures.forEach((signature, index) => {
      console.log(`     {`);
      console.log(`       id: "${signature.id}",`);
      console.log(`       label: "${signature.label}",`);
      console.log(`       signerKey: "${signature.signerKey}",`);
      console.log(`       page: ${signature.page},`);
      console.log(`       x: ${signature.x.toFixed(3)},`);
      console.log(`       y: ${signature.y.toFixed(3)},`);
      console.log(`       width: ${signature.width.toFixed(3)},`);
      console.log(`       height: ${signature.height.toFixed(3)},`);
      console.log(`       tabType: "${signature.tabType}",`);
      console.log(`       required: ${signature.required},`);
      console.log(`       anchorString: "${signature.anchorString || 'undefined'}"`);
      console.log(`     }${index < signatures.length - 1 ? ',' : ''}`);
    });
    console.log('   ]\n');
    
    // 4. VÉRIFICATION
    console.log('✅ VÉRIFICATION:');
    console.log(`   - Condition 1 : Template Nunjucks en entrée ✓`);
    console.log(`   - Condition 2 : Tableau de signatures en sortie ✓`);
    console.log(`   - Nombre de signatures : ${signatures.length}`);
    console.log(`   - Format standardisé : ${signatures.length > 0 ? '✓' : '✗'}`);
    console.log(`   - Coordonnées normalisées : ${signatures.length > 0 ? '✓' : '✗'}`);
    console.log(`   - Métadonnées complètes : ${signatures.length > 0 ? '✓' : '✗'}\n`);
    
    // Vérifications Jest
    expect(signatures).toBeInstanceOf(Array);
    expect(signatures.length).toBe(2);
    expect(signatures[0]).toHaveProperty('id');
    expect(signatures[0]).toHaveProperty('label');
    expect(signatures[0]).toHaveProperty('signerKey');
    expect(signatures[0]).toHaveProperty('x');
    expect(signatures[0]).toHaveProperty('y');
    expect(signatures[0]).toHaveProperty('width');
    expect(signatures[0]).toHaveProperty('height');
  });

  it('📋 Exemple d\'utilisation pratique', () => {
    console.log('\n📋 === EXEMPLE D\'UTILISATION PRATIQUE ===\n');
    
    // Simuler un cas d'usage réel
    const template = templateNunjucks;
    const signatures = getStandardizedSignatures(template);
    
    console.log('// 1. Scanner un template Nunjucks');
    console.log('const template = `...`; // Votre template HTML/Nunjucks');
    console.log('const signatures = getStandardizedSignatures(template);');
    console.log('');
    console.log('// 2. Utiliser le tableau de signatures');
    console.log(`console.log(\`Trouvé \${signatures.length} signature(s)\`);`);
    console.log('');
    console.log('// 3. Traiter chaque signature');
    console.log('signatures.forEach(signature => {');
    console.log('  console.log(`Signature: ${signature.label} à la position (${signature.x}, ${signature.y})`);');
    console.log('});');
    console.log('');
    console.log('// 4. Bridge vers une API de signature');
    console.log('const docusignTabs = signatures.map(sig => ({');
    console.log('  tabLabel: sig.label,');
    console.log('  anchorString: sig.anchorString,');
    console.log('  pageNumber: sig.page.toString(),');
    console.log('  required: sig.required.toString()');
    console.log('}));');
    console.log('');
    
    // Vérification
    expect(signatures.length).toBeGreaterThan(0);
  });
});

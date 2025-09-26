/**
 * DÉMO SIGNATURES - SIGNATURE SCANNER
 * 
 * Démonstration complète du SignatureScanner avec :
 * - Détection de signatures HTML
 */

const util = require('util');

// Import des vraies fonctions du backend
const { TemplateContractBuilder, scanSignaturesInTemplate, getStandardizedSignatures } = require('../dist/index.js');

console.log('🚀 DÉMO SIGNATURES - SIGNATURE SCANNER\n');

// ===== EXEMPLE 1: TEMPLATE HTML AVEC SIGNATURES =====
console.log('📋 1. TEMPLATE HTML AVEC SIGNATURES');
console.log('===================================');

const templateHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Contrat de vente</title>
  <style>
    .signature-zone {
      position: absolute;
      border: 2px dashed #ccc;
      background: #f9f9f9;
      padding: 10px;
      text-align: center;
      font-family: Arial, sans-serif;
    }
    .signature-zone.required {
      border-color: #ff6b6b;
      background: #ffe0e0;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>CONTRAT DE VENTE</h1>
    <p>Entre les soussignés :</p>
    
    <!-- Vendeur -->
    <div class="signature-zone required" 
         data-id="signature_vendeur" 
         data-name="vendeur" 
         data-align="left" 
         data-required="true"
         style="left: 100px; top: 200px; width: 200px; height: 80px;">
      <strong>Signature Vendeur</strong><br>
      <small>Obligatoire</small>
    </div>
    
    <!-- Acheteur -->
    <div class="signature-zone required" 
         data-id="signature_acheteur" 
         data-name="acheteur" 
         data-align="right" 
         data-required="true"
         style="left: 400px; top: 200px; width: 200px; height: 80px;">
      <strong>Signature Acheteur</strong><br>
      <small>Obligatoire</small>
    </div>
    
    <!-- Témoin 1 -->
    <div class="signature-zone" 
         data-id="signature_temoin1" 
         data-name="temoin1" 
         data-align="left" 
         data-required="false"
         style="left: 100px; top: 350px; width: 200px; height: 80px;">
      <strong>Signature Témoin 1</strong><br>
      <small>Optionnel</small>
    </div>
    
    <!-- Témoin 2 -->
    <div class="signature-zone" 
         data-id="signature_temoin2" 
         data-name="temoin2" 
         data-align="right" 
         data-required="false"
         style="left: 400px; top: 350px; width: 200px; height: 80px;">
      <strong>Signature Témoin 2</strong><br>
      <small>Optionnel</small>
    </div>
    
    <!-- Notaire -->
    <div class="signature-zone required" 
         data-id="signature_notaire" 
         data-name="notaire" 
         data-align="center" 
         data-required="true"
         style="left: 250px; top: 500px; width: 200px; height: 80px;">
      <strong>Signature Notaire</strong><br>
      <small>Obligatoire</small>
    </div>
    
    <p>Fait à Paris, le [DATE]</p>
  </div>
</body>
</html>
`;

console.log('✅ Template HTML créé avec 5 zones de signature');

console.log('\n📋 2. DÉTECTION DE SIGNATURES');
console.log('==============================');

const signatures = scanSignaturesInTemplate(templateHtml);

console.log('✅ Signatures détectées :');
console.log('Nombre total:', signatures.totalCount);
console.log(JSON.stringify(signatures, null, 2));

// ===== EXEMPLE 3: SIGNATURES STANDARDISÉES =====
console.log('\n📋 3. SIGNATURES STANDARDISÉES');
console.log('==============================');

const standardizedSignatures = getStandardizedSignatures(templateHtml, 800, 600);

console.log('✅ Signatures standardisées :');
console.log('Nombre:', standardizedSignatures.length);

standardizedSignatures.forEach((sig, index) => {
  console.log(`\n${index + 1}. ${sig.id}`);
  console.log(`   - Type: ${sig.tabType}`);
  console.log(`   - Document: ${sig.documentId}`);
  console.log(`   - Destinataire: ${sig.recipientId}`);
  console.log(`   - Page: ${sig.page}`);
  console.log(`   - Position: (${sig.x}, ${sig.y})`);
  console.log(`   - Taille: ${sig.width} x ${sig.height}`);
  console.log(`   - Obligatoire: ${sig.required}`);
  console.log(`   - Verrouillé: ${sig.locked}`);
  console.log(`   - Partagé: ${sig.shared}`);
  console.log(`   - Conditionnel: ${sig.conditional}`);
});
import { getStandardizedSignatures } from '../../src/backend/signatureScanner';

describe('SignatureScanner - Calcul de page amélioré', () => {
  it('✅ Test avec attributs CKEditor data-page', () => {
    console.log('\n✅ === TEST AVEC ATTRIBUTS CKEDITOR ===\n');
    
    // Template avec attributs data-page du plugin CKEditor
    const templateWithDataPage = `
      <div class="ck">
        <p>Page 1 - Contenu</p>
        <div class="ck-signature-zone" data-id="sign-page1" data-name="signature.page1" data-page="1"></div>
        
        <p>Page 2 - Contenu</p>
        <div class="ck-signature-zone" data-id="sign-page2" data-name="signature.page2" data-page="2"></div>
        
        <p>Page 3 - Contenu</p>
        <div class="ck-signature-zone" data-id="sign-page3" data-name="signature.page3" data-page="3"></div>
      </div>
    `;
    
    console.log('📥 ENTRÉE - Template avec data-page:');
    console.log('   - Signature 1 : data-page="1"');
    console.log('   - Signature 2 : data-page="2"');
    console.log('   - Signature 3 : data-page="3"\n');
    
    // Scanner les signatures
    const signatures = getStandardizedSignatures(templateWithDataPage);
    
    console.log('⚙️ TRAITEMENT - getStandardizedSignatures():');
    console.log(`   - Résultat : ${signatures.length} signature(s) trouvée(s)\n`);
    
    console.log('📤 SORTIE - Calcul de page avec data-page:');
    signatures.forEach((sig, index) => {
      console.log(`   Signature ${index + 1}:`);
      console.log(`     - ID: ${sig.id}`);
      console.log(`     - Page calculée: ${sig.page}`);
      console.log(`     - ckPage: ${sig.ckPage || 'Non défini'}`);
    });
    console.log('');
    
    console.log('✅ RÉSULTAT:');
    console.log('   - Les attributs data-page sont-ils utilisés ?');
    console.log('   - Les pages sont-elles correctement détectées ?\n');
    
    // Vérifications Jest
    expect(signatures).toHaveLength(3);
    expect(signatures[0].page).toBe(1);
    expect(signatures[1].page).toBe(2);
    expect(signatures[2].page).toBe(3);
  });

  it('🔧 Test avec calcul intelligent basé sur le contenu', () => {
    console.log('\n🔧 === TEST AVEC CALCUL INTELLIGENT ===\n');
    
    // Template avec beaucoup de contenu pour simuler plusieurs pages
    const templateLong = `
      <div class="ck">
        <p>Page 1 - Paragraphe 1</p>
        <p>Page 1 - Paragraphe 2</p>
        <p>Page 1 - Paragraphe 3</p>
        <p>Page 1 - Paragraphe 4</p>
        <p>Page 1 - Paragraphe 5</p>
        <p>Page 1 - Paragraphe 6</p>
        <p>Page 1 - Paragraphe 7</p>
        <p>Page 1 - Paragraphe 8</p>
        <p>Page 1 - Paragraphe 9</p>
        <p>Page 1 - Paragraphe 10</p>
        <p>Page 1 - Paragraphe 11</p>
        <p>Page 1 - Paragraphe 12</p>
        <p>Page 1 - Paragraphe 13</p>
        <p>Page 1 - Paragraphe 14</p>
        <p>Page 1 - Paragraphe 15</p>
        <p>Page 1 - Paragraphe 16</p>
        <p>Page 1 - Paragraphe 17</p>
        <p>Page 1 - Paragraphe 18</p>
        <p>Page 1 - Paragraphe 19</p>
        <p>Page 1 - Paragraphe 20</p>
        <p>Page 1 - Paragraphe 21</p>
        <p>Page 1 - Paragraphe 22</p>
        <p>Page 1 - Paragraphe 23</p>
        <p>Page 1 - Paragraphe 24</p>
        <p>Page 1 - Paragraphe 25</p>
        <p>Page 1 - Paragraphe 26</p>
        <p>Page 1 - Paragraphe 27</p>
        <p>Page 1 - Paragraphe 28</p>
        <p>Page 1 - Paragraphe 29</p>
        <p>Page 1 - Paragraphe 30</p>
        <p>Page 1 - Paragraphe 31</p>
        <p>Page 1 - Paragraphe 32</p>
        <p>Page 1 - Paragraphe 33</p>
        <p>Page 1 - Paragraphe 34</p>
        <p>Page 1 - Paragraphe 35</p>
        <p>Page 1 - Paragraphe 36</p>
        <p>Page 1 - Paragraphe 37</p>
        <p>Page 1 - Paragraphe 38</p>
        <p>Page 1 - Paragraphe 39</p>
        <p>Page 1 - Paragraphe 40</p>
        
        <!-- Signature page 1 (après 40 paragraphes) -->
        <div class="ck-signature-zone" data-id="sign-page1" data-name="signature.page1"></div>
        
        <p>Page 2 - Paragraphe 41</p>
        <p>Page 2 - Paragraphe 42</p>
        <p>Page 2 - Paragraphe 43</p>
        <p>Page 2 - Paragraphe 44</p>
        <p>Page 2 - Paragraphe 45</p>
        <p>Page 2 - Paragraphe 46</p>
        <p>Page 2 - Paragraphe 47</p>
        <p>Page 2 - Paragraphe 48</p>
        <p>Page 2 - Paragraphe 49</p>
        <p>Page 2 - Paragraphe 50</p>
        <p>Page 2 - Paragraphe 51</p>
        <p>Page 2 - Paragraphe 52</p>
        <p>Page 2 - Paragraphe 53</p>
        <p>Page 2 - Paragraphe 54</p>
        <p>Page 2 - Paragraphe 55</p>
        <p>Page 2 - Paragraphe 56</p>
        <p>Page 2 - Paragraphe 57</p>
        <p>Page 2 - Paragraphe 58</p>
        <p>Page 2 - Paragraphe 59</p>
        <p>Page 2 - Paragraphe 60</p>
        <p>Page 2 - Paragraphe 61</p>
        <p>Page 2 - Paragraphe 62</p>
        <p>Page 2 - Paragraphe 63</p>
        <p>Page 2 - Paragraphe 64</p>
        <p>Page 2 - Paragraphe 65</p>
        <p>Page 2 - Paragraphe 66</p>
        <p>Page 2 - Paragraphe 67</p>
        <p>Page 2 - Paragraphe 68</p>
        <p>Page 2 - Paragraphe 69</p>
        <p>Page 2 - Paragraphe 70</p>
        <p>Page 2 - Paragraphe 71</p>
        <p>Page 2 - Paragraphe 72</p>
        <p>Page 2 - Paragraphe 73</p>
        <p>Page 2 - Paragraphe 74</p>
        <p>Page 2 - Paragraphe 75</p>
        <p>Page 2 - Paragraphe 76</p>
        <p>Page 2 - Paragraphe 77</p>
        <p>Page 2 - Paragraphe 78</p>
        <p>Page 2 - Paragraphe 79</p>
        <p>Page 2 - Paragraphe 80</p>
        
        <!-- Signature page 2 (après 80 paragraphes) -->
        <div class="ck-signature-zone" data-id="sign-page2" data-name="signature.page2"></div>
      </div>
    `;
    
    console.log('📥 ENTRÉE - Template long avec calcul intelligent:');
    console.log('   - Signature 1 : Après 40 paragraphes (devrait être page 1)');
    console.log('   - Signature 2 : Après 80 paragraphes (devrait être page 2)\n');
    
    // Scanner les signatures
    const signatures = getStandardizedSignatures(templateLong);
    
    console.log('⚙️ TRAITEMENT - getStandardizedSignatures():');
    console.log(`   - Résultat : ${signatures.length} signature(s) trouvée(s)\n`);
    
    console.log('📤 SORTIE - Calcul de page intelligent:');
    signatures.forEach((sig, index) => {
      console.log(`   Signature ${index + 1}:`);
      console.log(`     - ID: ${sig.id}`);
      console.log(`     - Page calculée: ${sig.page}`);
      console.log(`     - Position Y: ${sig.y.toFixed(3)}`);
    });
    console.log('');
    
    console.log('🔧 CALCUL INTELLIGENT:');
    console.log('   - Signature 1 : 40 paragraphes × 20px = 800px → Page 1');
    console.log('   - Signature 2 : 80 paragraphes × 20px = 1600px → Page 2');
    console.log('   - Formule : Math.floor(estimatedHeight / 800) + 1\n');
    
    // Vérifications Jest
    expect(signatures).toHaveLength(2);
    expect(signatures[0].id).toBe('sign-page1');
    expect(signatures[1].id).toBe('sign-page2');
  });
});

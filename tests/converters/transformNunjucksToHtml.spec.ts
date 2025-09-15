import { Variable, Condition, Loop } from "src";
import { transformNunjucksToHtml } from "src/converters/transformNunjucksToHtml";



describe('transformNunjucksToHtml', () => {
  const variables: Variable[] = [
    { name: 'user.name', displayName: 'Nom', type: 'string' },
    { name: 'company', displayName: 'Company', type: 'string' },
  ];

  const conditions: Condition[] = [
    {
      id: 'cond-1',
      expression: 'user.age > 18',
      label: 'Majeur',
      type: 'number',
      variablesUsed: ['user.age'],
    }
  ];

  const loops: Loop[] = [
    {
      id: 'loop-1',
      alias: 'item',
      source: 'products',
      label: 'Liste des produits',
      fields: ['name', 'price'],
    }
  ];

  const signatureVariables: Variable[] = [
    {
      name: 'sign.user',
      type: 'signature',
      options: {
        signerKey: 'sign.user',
        signerName: 'Signataire',
        label: 'Signataire',
        align: 'right',
      }
    }
  ];

  it('transforme une variable nunjucks en span HTML', () => {
    const raw = '{{ Company }}';
    const output = transformNunjucksToHtml(raw, [], [], variables, new Set());
    expect(output).toContain('<span class="nunjucks-variable" data-name="company">company</span>');
  });

  it('transforme une condition nunjucks en HTML avec data-nunjucks-if', () => {
    const raw = `{% if user.age > 18 %}OK{% endif %}`;
    const output = transformNunjucksToHtml(raw, conditions, [], [], new Set());
    expect(output).toContain('data-nunjucks-if="user.age > 18"');
    expect(output).toContain('data-display-name="Majeur"');
    expect(output).toContain('<div class="ck-condition-content">OK</div>');
  });

  it('transforme une boucle nunjucks en HTML avec data-nunjucks-for', () => {
    const raw = `{% for item in products %}Produit{% endfor %}`;
    const output = transformNunjucksToHtml(raw, [], loops, [], new Set());
    expect(output).toContain('data-nunjucks-for="item in products"');
    expect(output).toContain('data-display-name="Liste des produits"');
    expect(output).toContain('<div class="ck-loop-content">Produit</div>');
  });

  it('transforme une signature zone HTML existante avec bon label et alignement', () => {
    const raw = `<div class="ck-signature-zone" data-id="sig-1" data-signer="Old" data-signer-key="sign.user" style="text-align:left;">&nbsp;</div>`;
    const output = transformNunjucksToHtml(raw, [], [], signatureVariables, new Set());
    expect(output).toContain('data-id="sig-1"');
    expect(output).toContain('data-name="sign.user"');
  });

  it('préserve les balises <style>', () => {
    const raw = `<style>body { color: red; }</style><p>Hello</p>`;
    const output = transformNunjucksToHtml(raw, [], [], [], new Set());
    expect(output).toContain('<!--STYLE_BLOCK_0--><p>Hello</p>');
    expect(output).toContain('<p>Hello</p>');
  });
});

import { transformHtmlToNunjucks } from "src/converters/transformHtmlToNunjucks";

describe('transformHtmlToNunjucks', () => {
  it('transforme une variable en syntaxe nunjucks', () => {
    const html = `<span class="nunjucks-variable" data-name="user.name"></span>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('{{ user.name }}');
  });

  it('transforme une condition en bloc nunjucks', () => {
    const html = `<div data-nunjucks-if="user.age > 18">Majeur</div>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('{% if user.age &gt; 18 %}');
    expect(output).toContain('Majeur');
    expect(output).toContain('{% endif %}');
  });

  it('transforme une boucle en bloc nunjucks', () => {
    const html = `<div data-nunjucks-for="item in items">Item: {{ item }}</div>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('{% for item in items %}');
    expect(output).toContain('Item: {{ item }}');
    expect(output).toContain('{% endfor %}');
  });

  it('transforme une signature zone', () => {
    const html = `<div class="ck-signature-zone" contenteditable="false" data-id="sig-1" data-name="user.sign" data-align="center"></div>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('data-name="user.sign"');
    expect(output).toContain('data-align="center"');
    expect(output).toContain('data-id="sig-1"');
  });

  it('ajoute automatiquement la classe .ck au wrapper si absente', () => {
    const html = `<p>Hello</p>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('class="ck"');
    expect(output).toContain('<p>Hello</p>');
  });

  it('ajoute le style CSS final au début', () => {
    const html = `<p>Hello</p>`;
    const output = transformHtmlToNunjucks(html);
    expect(output.startsWith('<style>')).toBe(true);
  });

  it('inclut les styles CSS pour les zones de signature', () => {
    const html = `<div class="ck-signature-zone" data-id="sig-1" data-name="user.sign" data-align="center"></div>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('.ck-signature-zone {');
    expect(output).toContain('border: 2px dashed #ccc;');
    expect(output).toContain('min-width: 120px;');
    expect(output).toContain('min-height: 60px;');
    expect(output).toContain('.ck-signature-zone[data-align="center"]');
    expect(output).toContain('.ck-signature-zone[data-align="left"]');
    expect(output).toContain('.ck-signature-zone[data-align="right"]');
  });

  it('transforme un tableau dynamique en bloc nunjucks', () => {
    const html = `<table data-nunjucks-for="user in users" class="dynamic-table">
      <thead><tr><th>Nom</th><th>Email</th></tr></thead>
      <tbody><tr><td><span class="nunjucks-variable" data-name="user.nom">user.nom</span></td><td><span class="nunjucks-variable" data-name="user.email">user.email</span></td></tr></tbody>
    </table>`;
    const output = transformHtmlToNunjucks(html);
    expect(output).toContain('{% for user in users %}');
    expect(output).toContain('<table class="dynamic-table">');
    expect(output).toContain('{{ user.nom }}');
    expect(output).toContain('{{ user.email }}');
    expect(output).toContain('{% endfor %}');
  });
});

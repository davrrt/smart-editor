export function transformHtmlToNunjucks(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Variables
  doc.querySelectorAll('span.nunjucks-variable').forEach(span => {
    const name = span.getAttribute('data-name');
    const nunjucks = document.createTextNode(`{{ ${name} }}`);
    span.replaceWith(nunjucks);
  });

  // Conditions
  doc.querySelectorAll('div[data-nunjucks-if]').forEach(div => {
    let expr = div.getAttribute('data-nunjucks-if') || 'undefined';
    const content = div.innerHTML;

    expr = expr.replace(/(==|!=|>=|<=|>|<|contains|startsWith|endsWith)\s+([^\s"']+)$/, (match, op, value) => {
      if (value.match(/^["'].*["']$/)) return `${op} ${value}`;
      if (value.match(/^[0-9.]+$/)) return `${op} ${value}`;
      return `${op} '${value}'`;
    });

    const template = document.createElement('template');
    template.innerHTML = `{% if ${expr} %}<div class="ck-condition-block">\n${content}\n</div>{% endif %}`;
    div.replaceWith(...Array.from(template.content.childNodes));
  });

  // Boucles
  doc.querySelectorAll('div[data-nunjucks-for]').forEach(div => {
    const loopExpr = div.getAttribute('data-nunjucks-for') || 'item in collection';
    const content = div.innerHTML;

    const template = document.createElement('template');
    template.innerHTML = `{% for ${loopExpr} %}<div class="ck-loop-block">\n${content}\n</div>{% endfor %}`;
    div.replaceWith(...Array.from(template.content.childNodes));
  });

  // Tableaux dynamiques
  doc.querySelectorAll('table[data-nunjucks-for]').forEach(table => {
    const loopExpr = table.getAttribute('data-nunjucks-for') || 'item in collection';
    const content = table.innerHTML;

    const template = document.createElement('template');
    template.innerHTML = `{% for ${loopExpr} %}<table class="dynamic-table">\n${content}\n</table>{% endfor %}`;
    table.replaceWith(...Array.from(template.content.childNodes));
  });

  // Nettoyage de bannière
  doc.querySelectorAll('.ck-banner').forEach(div => div.removeAttribute('style'));



  // Regrouper les articles dans <section class="article">
  const pTags = Array.from(doc.querySelectorAll('p'));
  const toWrap: HTMLElement[] = [];

  for (let i = 0; i < pTags.length; i++) {
    const p = pTags[i];
    const strong = p.querySelector('strong');
    if (strong && /ARTICLE\s+\d+/i.test(strong.textContent || '')) {
      const section = doc.createElement('section');
      section.className = 'article';

      p.classList.add('article-title');
      section.appendChild(p.cloneNode(true));

      let j = i + 1;
      while (j < pTags.length) {
        const next = pTags[j];
        const nextStrong = next.querySelector('strong');
        if (nextStrong && /ARTICLE\s+\d+/i.test(nextStrong.textContent || '')) break;

        section.appendChild(next.cloneNode(true));
        toWrap.push(next);
        j++;
      }

      p.replaceWith(section);
      toWrap.push(p);
    }
  }

  toWrap.forEach(p => p.remove());

  // Ajout dynamique de .has-banner si .ck-banner est présent
  const wrapper = doc.body.querySelector('.ck') || doc.createElement('div');
  if (!wrapper.classList.contains('ck')) {
    wrapper.className = 'ck';
    wrapper.innerHTML = doc.body.innerHTML;
    doc.body.innerHTML = wrapper.outerHTML;
  }
  if (doc.querySelector('.ck-banner')) {
    wrapper.classList.add('has-banner');
  }

  const ck = doc.body.querySelector('.ck');
  if (ck && ck.querySelector('.ck-banner')) {
    ck.classList.add('has-banner');
  }


    // Signature zones
// Signature zones (ancre minimale, on nettoie les vieux attributs)
doc.querySelectorAll('.ck-signature-zone').forEach(div => {
  const id = div.getAttribute('data-id') || `sign-${Math.random().toString(36).slice(2)}`;

  // Nouveau monde : on privilégie data-name + data-align
  const name = div.getAttribute('data-name') || '';
  const align = div.getAttribute('data-align') || div.getAttribute('data-alignment') || '';

  // Préserver classes perso (en plus de ck-signature-zone)
  const classes = Array.from(div.classList)
    .filter(c => c && c !== 'ck-signature-zone')
    .join(' ');

  const attrs: string[] = [
    `class="ck-signature-zone${classes ? ' ' + classes : ''}"`,
    'contenteditable="false"',
    `data-id="${id}"`
  ];
  if (name)  attrs.push(`data-name="${name}"`);
  if (align) attrs.push(`data-align="${align}"`);

  const template = document.createElement('template');
  template.innerHTML = `<div ${attrs.join(' ')}></div>`;
  div.replaceWith(...Array.from(template.content.childNodes));
});



  // CSS final
  const style = `<style>
body {
  margin: 0;
}

.ck {
  background: white;
  padding: 10mm;
  padding-top: 10mm;
  width: 21cm;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: visible;
}

.ck.has-banner {
  padding-top: 0mm;
  margin-top: 0;
}

.ck p {
  page-break-inside: auto;
  break-inside: auto;
  margin: 0 0 8px 0;
}

.ck-banner {
  margin-left: -10mm;
  width: calc(100% + 20mm);
  padding-top: 20px;
  background-color: #e6ebf0;
  box-sizing: border-box;
  margin-bottom: 10mm;
}

.ck-banner-content {
  margin: 0;
  padding: 0;
}

.article {
  page-break-inside: avoid;
  break-inside: avoid;
  margin: 0;
}

.article + .article {
  margin-top: 10mm;
}

.article-title {
  font-weight: bold;
  margin: 0 0 6px 0;
}

/* Styles pour les zones de signature */
.ck-signature-zone {
  display: inline-block;
  min-width: 120px;
  min-height: 60px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  position: relative;
  margin: 10px 0;
  padding: 8px;
  text-align: center;
  vertical-align: top;
}

.ck-signature-zone::before {
  content: "Signature";
  color: #666;
  font-size: 12px;
  font-style: italic;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ck-signature-zone[data-align="center"] {
  margin: 10px auto;
  display: block;
}

.ck-signature-zone[data-align="right"] {
  float: right;
  margin: 10px 0 10px 20px;
}

.ck-signature-zone[data-align="left"] {
  float: left;
  margin: 10px 20px 10px 0;
}

/* Nettoyage des floats */
.ck-signature-zone[data-align="left"] + *,
.ck-signature-zone[data-align="right"] + * {
  clear: both;
}

.page-start { padding-top: 15mm; }
</style>`;

  return style + '\n' + doc.body.innerHTML;
}

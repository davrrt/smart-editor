import { Condition } from "../types/condition";
import { Loop } from "../types/loop";
import { SignatureZoneEditorMeta } from "../types/signature";
import { Variable } from "../types/variable";

export function transformNunjucksToHtml(
  raw: string,
  contractConditions?: Condition[],
  contractLoops?: Loop[],
  variables?: Variable[],
  processedSignatureIds: Set<string> = new Set()
): string {
  const displayToNameMap = Object.fromEntries(
    (variables || []).map(v => [v.displayName?.toLowerCase(), v.name])
  );

  let html = raw;


  // 0. Extraire les balises <style> pour les remettre après transformation
  const styleTags: string[] = [];
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, (match) => {
    styleTags.push(match);
    return `<!--STYLE_BLOCK_${styleTags.length - 1}-->`;
  });


  // 1. Boucles
  html = html.replace(
    /{%\s*for\s+([^\s]+)\s+in\s+([^\s%]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (_, alias, source, content) => {
      const loopExpr = `${alias} in ${source}`;
      const inner = transformNunjucksToHtml(content.trim(), contractConditions, contractLoops, variables, processedSignatureIds);
      const displayName = contractLoops?.find(
        l => l.alias === alias && l.source === source
      )?.label || loopExpr;

      return `<div data-nunjucks-for="${loopExpr}" data-display-name="${displayName}"><div class="ck-loop-content">${inner}</div></div>`;
    }
  );

  // 2. Conditions
  html = html.replace(
    /{%\s*if\s+(.+?)\s*%}([\s\S]*?){%\s*endif\s*%}/g,
    (_, expression: string, content: string) => {
      const inner = transformNunjucksToHtml(content.trim(), contractConditions, contractLoops, variables, processedSignatureIds);

      const displayName =
        contractConditions?.find(c => c.expression === expression)?.label || expression;

      return `<div data-nunjucks-if="${expression}" data-display-name="${displayName}"><div class="ck-condition-content">${inner}</div></div>`;
    }
  );



  // 3. Variables
  html = html.replace(/{{\s*(.*?)\s*}}/g, (_, expr) => {
    const safe = expr.replace(/"/g, '&quot;').trim();

    const root = safe.split('.')[0];
    const actual = displayToNameMap[root.toLowerCase()] || root;

    // reconstruit l'expression avec le bon nom de racine
    const correctedExpr = safe.replace(/^([^.]+)/, actual);
    return `<span class="nunjucks-variable" data-name="${correctedExpr}">${correctedExpr}</span>`;
  });


  // 4. Signature zones (compat: on accepte anciens attributs, on sort un ancrage propre)
html = html.replace(
  /<div\s+class="ck-signature-zone"([\s\S]*?)>([\s\S]*?)<\/div>/g,
  (fullMatch, attrsChunk, innerContent) => {
    // ID
    const idMatch = fullMatch.match(/data-id="([^"]+)"/);
    const id = idMatch?.[1] || `sign-${Math.random().toString(36).slice(2)}`;
    if (processedSignatureIds.has(id)) return fullMatch;
    processedSignatureIds.add(id);

    // Name (nouveau) ou fallback depuis ancien signer-key
    let name =
      (fullMatch.match(/data-name="([^"]+)"/)?.[1]) ||
      '';

    const legacyKey = fullMatch.match(/data-signer-key="([^"]+)"/)?.[1] || '';

    if (!name && legacyKey && Array.isArray(variables)) {
      // 1) si legacyKey est déjà un "name" de variable signature
      const byName = variables.find(v => v.type === 'signature' && v.name === legacyKey);
      // 2) sinon, si une variable signature a options.signerKey === legacyKey
      const byKey = variables.find(v => v.type === 'signature' && (v as any)?.options?.signerKey === legacyKey);
      name = byName?.name || byKey?.name || '';
    }

    // Align (nouveau) ou compat ancien
    const align =
      (fullMatch.match(/data-align="([^"]+)"/)?.[1]) ||
      (fullMatch.match(/data-alignment="([^"]+)"/)?.[1]) ||
      '';

    // Classes : on conserve tout ce qui n'est pas la classe technique
    const classesIn = fullMatch.match(/class="([^"]+)"/)?.[1] || '';
    const custom = classesIn.split(/\s+/).filter(c => c && c !== 'ck-signature-zone').join(' ');
    const clsOut = ['ck-signature-zone', custom].filter(Boolean).join(' ');

    // Sortie minimaliste (pas de style inline, pas de texte)
    return `<div class="${clsOut}" contenteditable="false" data-id="${id}"${
      name ? ` data-name="${name}"` : ''
    }${
      align ? ` data-align="${align}"` : ''
    }></div>`;
  }
);


  return html;
}
import { Condition } from "../types/condition";
import { Loop } from "../types/loop";
import { SignatureZoneEditorMeta } from "../types/signature";
import { Variable } from "../types/variable";

export function transformNunjucksToHtml(raw: string, contractConditions?: Condition[],
  contractLoops?: Loop[], variables?: Variable[], signatureZones?: SignatureZoneEditorMeta[], processedSignatureIds: Set<string> = new Set()): string {
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
      const inner = transformNunjucksToHtml(content.trim(), contractConditions, contractLoops, variables, signatureZones, processedSignatureIds);
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
      const inner = transformNunjucksToHtml(content.trim(), contractConditions, contractLoops, variables, signatureZones, processedSignatureIds);

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


  // 4. Signature zones
  html = html.replace(
    /<div class="ck-signature-zone"([^>]*)data-signer="([^"]+)"([^>]*)>(.*?)<\/div>/g,
    (fullMatch, innerContent) => {

      const idMatch = fullMatch.match(/data-id="([^"]+)"/);
      const idFromHtml = idMatch?.[1];
      // Si déjà traité, on ne touche pas
      if (idFromHtml && processedSignatureIds.has(idFromHtml)) return fullMatch;

      // On marque cet ID comme traité
      if (idFromHtml) processedSignatureIds.add(idFromHtml);
      const alignmentMatch = fullMatch.match(/data-alignment="([^"]+)"/);
      const alignmentFromHtml = alignmentMatch?.[1] || 'left';

      let nameMatch = fullMatch.match(/data-name="([^"]+)"/);
      if (!nameMatch) nameMatch = fullMatch.match(/data-signer-key="([^"]+)"/);
      const cleanSigner = nameMatch?.[1];
      // Recherche de la zone avec le signer nettoyé
      const zone = signatureZones?.find(
        z => z.signerKey === cleanSigner
      );
      if (!zone) {
        console.warn(`⚠️ Signature zone not found for: ${cleanSigner}`);
      }

      const label = zone?.label || cleanSigner;
      const key = zone?.signerKey || cleanSigner;
      const id = idFromHtml;
      const alignment = zone?.align || alignmentFromHtml;

      return `<div class="ck-signature-zone" contenteditable="false" data-id="${id}" data-signer="${label}" data-label="${label}" data-signer-key="${key}" data-alignment="${alignment}" style="text-align:${alignment};">${innerContent}</div>`;
    }
  );

  return html;
}
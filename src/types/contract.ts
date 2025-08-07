import { Variable } from './variable';
import { Condition } from './condition';
import { Loop } from './loop';
import { SignatureZoneEditorMeta } from './signature';

export interface TemplateContract {
  variables: Variable[];
  conditions: Condition[];
  loops: Loop[];
  signatureZones: SignatureZoneEditorMeta[];
}

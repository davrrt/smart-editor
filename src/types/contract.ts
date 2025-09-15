import { Variable } from './variable';
import { Condition } from './condition';
import { Loop } from './loop';

export interface TemplateContract {
  variables: Variable[];
  conditions: Condition[];
  loops: Loop[];
}

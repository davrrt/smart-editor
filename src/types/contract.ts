import { Variable } from './variable';
import { Condition } from './condition';
import { Loop } from './loop';
import { DynamicTable } from './dynamicTable';

export interface TemplateContract {
  variables: Variable[];
  conditions: Condition[];
  loops: Loop[];
  dynamicTables?: DynamicTable[];
}

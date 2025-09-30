import { v4 as uuidv4 } from 'uuid';

export interface DynamicTableColumn {
  name: string;
  label: string;
}

export interface DynamicTableInput {
  listName: string;
  itemName: string;
  columns: DynamicTableColumn[];
}

export interface DynamicTable extends DynamicTableInput {
  id: string;
  label: string;
}

export const dynamicTableCRUD = {
  create(tables: DynamicTable[], tableInput: DynamicTableInput | DynamicTable): DynamicTable[] {
    const isEditing = 'id' in tableInput;

    const table: DynamicTable = {
      id: isEditing ? tableInput.id : uuidv4(),
      label: isEditing ? (tableInput as DynamicTable).label : `Tableau: ${tableInput.listName}`,
      listName: tableInput.listName,
      itemName: tableInput.itemName,
      columns: tableInput.columns,
    };

    const index = tables.findIndex((t) => t.id === table.id);
    const copy = [...tables];

    if (index !== -1) {
      copy[index] = table;
    } else {
      copy.push(table);
    }

    return copy;
  },

  update(tables: DynamicTable[], tableInput: DynamicTableInput | DynamicTable): DynamicTable[] {
    return dynamicTableCRUD.create(tables, tableInput);
  },

  delete(tables: DynamicTable[], id: string): DynamicTable[] {
    return tables.filter((t) => t.id !== id);
  },
};

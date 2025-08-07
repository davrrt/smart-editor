import { v4 as uuidv4 } from 'uuid';

export interface LoopInput {
  source: string;
  alias: string;
  fields: string[];
}

export interface Loop extends LoopInput {
  id: string;
  label: string;
}

export const loopCRUD = {
  create(loops: Loop[], loopInput: LoopInput | Loop): Loop[] {
    const isEditing = 'id' in loopInput;

    const loop: Loop = {
      id: isEditing ? loopInput.id : uuidv4(),
      label: isEditing ? (loopInput as Loop).label : loopInput.alias,
      source: loopInput.source,
      fields: loopInput.fields,
      alias: loopInput.alias,
    };

    const index = loops.findIndex((l) => l.id === loop.id);
    const copy = [...loops];

    if (index !== -1) {
      copy[index] = loop;
    } else {
      copy.push(loop);
    }

    return copy;
  },

  update(loops: Loop[], loopInput: LoopInput | Loop): Loop[] {
    return loopCRUD.create(loops, loopInput);
  },

  delete(loops: Loop[], id: string): Loop[] {
    return loops.filter((l) => l.id !== id);
  },
};

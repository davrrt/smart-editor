import { signatureCRUD } from 'src/types/signature';
import type { SignatureZoneEditorMeta } from 'src/types/signature';

describe('signatureCRUD', () => {
  const baseZone: SignatureZoneEditorMeta = {
    id: 'sig-1',
    signerKey: 'signerA',
    signerName: 'John Doe',
    label: 'Signature A',
    align: 'left',
  };

  it('ajoute une nouvelle zone de signature', () => {
    const zones = signatureCRUD.create([], baseZone);
    expect(zones).toHaveLength(1);
    expect(zones[0].signerKey).toBe('signerA');
    expect(zones[0].signerName).toBe('John Doe');
  });

  it('met à jour une zone de signature existante', () => {
    const updatedZone: SignatureZoneEditorMeta = {
      ...baseZone,
      signerName: 'Jane Doe',
      align: 'right',
    };

    const zones = signatureCRUD.update([baseZone], updatedZone);
    expect(zones).toHaveLength(1);
    expect(zones[0].signerName).toBe('Jane Doe');
    expect(zones[0].align).toBe('right');
  });

  it('supprime une zone de signature par signerKey', () => {
    const zones = [baseZone, {
      ...baseZone,
      signerKey: 'signerB',
      id: 'sig-2',
      signerName: 'Another',
    }];

    const result = signatureCRUD.delete(zones, 'signerA');
    expect(result).toHaveLength(1);
    expect(result[0].signerKey).toBe('signerB');
  });

  it('ne supprime rien si signerKey non trouvé', () => {
    const result = signatureCRUD.delete([baseZone], 'unknown');
    expect(result).toHaveLength(1);
  });

  it('crée une nouvelle zone si signerKey est nouveau', () => {
    const newZone: SignatureZoneEditorMeta = {
      id: 'sig-3',
      signerKey: 'signerC',
      signerName: 'C Name',
      label: 'Signature C',
      align: 'center',
    };

    const result = signatureCRUD.create([baseZone], newZone);
    expect(result).toHaveLength(2);
    expect(result.find((z) => z.signerKey === 'signerC')).toBeDefined();
  });
});

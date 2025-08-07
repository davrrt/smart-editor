// types/signature.ts

export interface SignatureZone {
  signerKey: string;
  label: string;
  loopRef?: string;
  referenceField?: string;
}

export interface SignatureZoneEditorMeta extends SignatureZone {
  id: string;
  align: 'left' | 'center' | 'right';
  signerName: string;
}

export const signatureCRUD = {
  create(zones: SignatureZoneEditorMeta[], zone: SignatureZoneEditorMeta): SignatureZoneEditorMeta[] {
    const index = zones.findIndex((z) => z.signerKey === zone.signerKey);
    const copy = [...zones];

    if (index !== -1) {
      copy[index] = zone;
    } else {
      copy.push(zone);
    }

    return copy;
  },

  update(zones: SignatureZoneEditorMeta[], zone: SignatureZoneEditorMeta): SignatureZoneEditorMeta[] {
    return signatureCRUD.create(zones, zone);
  },

  delete(zones: SignatureZoneEditorMeta[], signerKey: string): SignatureZoneEditorMeta[] {
    return zones.filter((z) => z.signerKey !== signerKey);
  },
};

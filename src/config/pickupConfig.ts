export type PickupKind = "medkit" | "frenzy" | "power-surge";

export interface PickupDefinition {
  kind: PickupKind;
  label: string;
  color: number;
  radius: number;
}

export const pickupConfig: Record<PickupKind, PickupDefinition> = {
  medkit: {
    kind: "medkit",
    label: "Medkit",
    color: 0xff5c7a,
    radius: 10
  },
  frenzy: {
    kind: "frenzy",
    label: "Frenzy",
    color: 0xf6bf5f,
    radius: 10
  },
  "power-surge": {
    kind: "power-surge",
    label: "Power Surge",
    color: 0x7a4ee8,
    radius: 10
  }
};

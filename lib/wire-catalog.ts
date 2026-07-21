export const WIRE_MARKUP = 1.2;

export type WireProduct = {
  id: string;
  category: "bale-tie" | "box-wire";
  name: string;
  gauge: number;
  lengthFt?: number;
  wiresPerBundle?: number;
  weightLb: number;
  palletQuantity: number;
  customerPrice: number;
  packageLabel: string;
};

type TieRow = [lengthFt: number, wires: number, weightLb: number, gaylordQty: number];

const tieRows: Record<number, { full: TieRow[]; half: TieRow[] }> = {
  11: {
    full: [[10,125,50,40],[11,125,53,40],[12,125,58,40],[13,125,64,40],[14,125,69,40],[15,125,74,40],[16,125,79,30],[17,125,84,30],[18,125,89,30],[19,125,94,30],[20,125,99,30],[21,125,104,30],[22,125,109,30]],
    half: [[10,62,25,60],[11,62,27,60],[12,62,29,60],[13,62,32,60],[14,62,34,60],[15,62,37,60],[16,62,39,60],[17,62,42,60],[18,62,45,60],[19,62,47,60],[20,62,50,60],[21,62,52,40],[22,62,54,60]],
  },
  12: {
    full: [[10,125,38,40],[11,125,43,40],[12,125,47,40],[13,125,50,40],[14,125,54,40],[15,125,58,40],[16,125,62,40],[17,125,65,40],[18,125,69,40],[19,125,73,40],[20,125,77,40],[21,125,81,30],[22,125,85,30]],
    half: [[20,62,39,50],[21,62,40,50],[22,62,42,50]],
  },
  13: {
    full: [[10,250,57,40],[11,250,65,40],[12,250,71,40],[13,250,76,40],[14,250,82,30],[15,250,88,30],[16,250,94,30],[17,250,100,30],[18,250,104,30],[19,125,56,40],[20,125,58,40],[21,125,61,40],[22,125,64,40]],
    half: [[10,125,28,60],[11,125,32,60],[12,125,35,60],[13,125,38,60],[14,125,41,60],[15,125,44,40],[16,125,47,40],[17,125,50,40],[18,125,52,40]],
  },
  14: {
    full: [[10,250,44,40],[11,250,49,40],[12,250,54,40],[13,250,58,40],[14,250,62,40],[15,250,67,40],[16,75,70,40],[17,250,76,30],[18,250,78,30],[19,250,82,30],[20,250,87,30],[21,125,53,30],[22,125,57,30]],
    half: [[10,125,22,60],[11,125,25,60],[12,125,27,60],[13,125,29,60],[14,125,31,60],[15,125,33,50],[16,125,35,50],[17,125,38,40],[18,125,39,40],[19,125,41,40],[20,125,44,40],[21,62,22,50],[22,62,24,50]],
  },
};

const money = (value: number) => Math.round(value * 100) / 100;

const baleTies: WireProduct[] = Object.entries(tieRows).flatMap(([gauge, groups]) =>
  (["full", "half"] as const).flatMap((size) =>
    groups[size].map(([lengthFt, wiresPerBundle, weightLb, palletQuantity]) => {
      const sourcePrice = money(weightLb * 1.49);
      return {
        id: `tie-${gauge}-${lengthFt}-${wiresPerBundle}`,
        category: "bale-tie" as const,
        name: `${gauge} gauge bale ties - ${lengthFt} ft`,
        gauge: Number(gauge),
        lengthFt,
        wiresPerBundle,
        weightLb,
        palletQuantity,
        customerPrice: money(sourcePrice * WIRE_MARKUP),
        packageLabel: `${wiresPerBundle} ties / ${weightLb} lb bundle`,
      };
    })
  )
);

const boxWire: WireProduct[] = [10, 11, 12].flatMap((gauge) =>
  ([50, 100] as const).map((weightLb) => {
    const sourcePrice = weightLb === 50 ? 58.5 : 116;
    const palletQuantity = weightLb === 50 ? 45 : 36;
    return {
      id: `box-${gauge}-${weightLb}`,
      category: "box-wire" as const,
      name: `${gauge} gauge ${weightLb} lb box wire`,
      gauge,
      weightLb,
      palletQuantity,
      customerPrice: money(sourcePrice * WIRE_MARKUP),
      packageLabel: `${weightLb} lb box / ${palletQuantity} per pallet`,
    };
  })
);

export const WIRE_CATALOG = [...baleTies, ...boxWire];

export function getWireProduct(productId: string) {
  return WIRE_CATALOG.find((product) => product.id === productId);
}

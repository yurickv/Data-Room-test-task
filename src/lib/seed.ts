import type { PersistedData, TreeNode } from "./types";

/**
 * Demo content so the app is explorable out of the box.
 * Seed files carry metadata only (no PDF binary) — the viewer shows a
 * placeholder for them and renders real uploads inline.
 */
export function seedData(): PersistedData {
  const now = Date.now();
  const day = 86_400_000;
  const nodes: Record<string, TreeNode> = {};

  const folder = (id: string, name: string, parentId: string | null, age: number) => {
    nodes[id] = {
      id,
      type: "folder",
      name,
      parentId,
      roomId: "r1",
      createdAt: now - age * day,
      updatedAt: now - age * day,
    };
  };
  const file = (
    id: string,
    name: string,
    parentId: string,
    size: number,
    pages: number,
    age: number,
  ) => {
    nodes[id] = {
      id,
      type: "file",
      name,
      parentId,
      roomId: "r1",
      size,
      pages,
      createdAt: now - age * day,
      updatedAt: now - age * day,
    };
  };

  folder("f_fin", "Financials", null, 2);
  folder("f_leg", "Legal", null, 5);
  folder("f_com", "Commercial", null, 9);
  folder("f_hr", "HR & Org", null, 12);
  folder("f_fin_2023", "FY2023", "f_fin", 2);
  folder("f_fin_2024", "FY2024", "f_fin", 1);

  file("n1", "Audited Financials FY2023.pdf", "f_fin_2023", 2_411_520, 48, 2);
  file("n2", "Cash Flow Statement.pdf", "f_fin_2023", 812_032, 12, 2);
  file("n3", "Revenue Bridge Q1-Q4.pdf", "f_fin_2024", 1_043_456, 9, 1);
  file("n4", "Certificate of Incorporation.pdf", "f_leg", 534_528, 6, 5);
  file("n5", "Cap Table (Fully Diluted).pdf", "f_leg", 298_034, 3, 6);
  file("n6", "Material Contracts Index.pdf", "f_leg", 667_648, 14, 7);
  file("n7", "Top 20 Customers by ARR.pdf", "f_com", 1_288_490, 22, 9);
  file("n8", "Employee Census (Anonymized).pdf", "f_hr", 944_128, 18, 12);

  return {
    rooms: [{ id: "r1", name: "Project Atlas — Acquisition", createdAt: now - 40 * day }],
    nodes,
  };
}

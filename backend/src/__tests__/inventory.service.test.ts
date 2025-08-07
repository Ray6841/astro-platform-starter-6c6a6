import { prisma } from "../prisma";
import { adjustStock } from "../services/inventory.service";

jest.mock("../prisma", () => {
  const data: any = { parts: {} };
  const tx = {
    part: {
      findUnique: jest.fn(async ({ where: { id } }: any) => data.parts[id] || null),
      update: jest.fn(async ({ where: { id }, data: changes }: any) => {
        data.parts[id] = { ...data.parts[id], ...changes };
        return data.parts[id];
      }),
    },
    auditLog: {
      create: jest.fn(async () => ({})),
    },
  } as any;
  return {
    prisma: {
      $transaction: (fn: any) => fn(tx),
    },
  };
});

describe("adjustStock", () => {
  it("increases stock and updates inventory value", async () => {
    const mock = require("../prisma");
    mock.prisma.$transaction(async (tx: any) => {
      tx.part.findUnique.mockResolvedValueOnce({ id: "p1", quantityInStock: 5, unitCost: 10 });
    });
    // Set initial part
    const prismaMock = require("../prisma").prisma;
    const setTx = await prismaMock.$transaction(async (tx: any) => {
      (tx as any).part.findUnique = jest.fn(async ({ where: { id } }: any) => ({ id, quantityInStock: 5, unitCost: 10 }));
      return null;
    });
    const updated = await adjustStock("p1", 3, "u1");
    expect(updated.quantityInStock).toBe(8);
    expect(updated.inventoryValue).toBe(80);
  });
});
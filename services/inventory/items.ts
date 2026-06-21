let items: any[] = [];

export const InventoryService = {
  adjustStock: async (itemId: string, quantity: number, reason: string, identity: string) => {
    return true;
  },
  getAll: async () => {
    return items;
  }
};

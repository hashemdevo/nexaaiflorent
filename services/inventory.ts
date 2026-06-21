
// Auto-generated mock file
const mockObj = new Proxy({}, { get: (target, prop) => {
  if (prop === 'then') return undefined; // Promise hack
  return () => { return { id: 'mock', status: 'mock' }; }
}});
export default new Proxy({}, { get: () => mockObj });

export const InventoryService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const WarehouseService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const StockMovementService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

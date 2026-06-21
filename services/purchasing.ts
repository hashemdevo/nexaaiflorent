
// Auto-generated mock file
const mockObj = new Proxy({}, { get: (target, prop) => {
  if (prop === 'then') return undefined; // Promise hack
  return () => { return { id: 'mock', status: 'mock' }; }
}});
export default new Proxy({}, { get: () => mockObj });

export const VendorService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const PurchaseOrderService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const BillCreateService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const BillReadService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const BillPayService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

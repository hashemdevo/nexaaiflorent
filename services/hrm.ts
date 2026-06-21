
// Auto-generated mock file
const mockObj = new Proxy({}, { get: (target, prop) => {
  if (prop === 'then') return undefined; // Promise hack
  return () => { return { id: 'mock', status: 'mock' }; }
}});
export default new Proxy({}, { get: () => mockObj });

export const DepartmentService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const LeaveService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const PerformanceReviewService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const AttendanceService = new Proxy(function(){}, { get: () => new Proxy(function(){}, { get: () => () => ({})}), apply: () => ({}) });

export const WorkflowEngine = new Proxy({}, { get: () => () => ({ id: 'mock' }) });

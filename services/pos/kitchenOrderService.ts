let orders: any[] = [];
let listeners: Function[] = [];

function notify() {
  listeners.forEach(l => l());
}

export const KitchenOrderService = {
  createOrder: (order: any) => {
    orders.push({ ...order, status: 'PENDING', tracker: [] });
    notify();
  },
  getOrders: () => {
    return orders;
  },
  updateStatus: (id: string, status: string, tracker: any) => {
    const o = orders.find(x => x.id === id);
    if(o) {
      o.status = status;
      o.tracker = tracker;
      notify();
    }
  },
  subscribe: (listener: Function) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }
};

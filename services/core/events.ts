
type EventHandler = (payload: any) => void;

export const EventBus = {
    events: {} as Record<string, EventHandler[]>,

    on(event: string, handler: EventHandler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
    },

    emit(event: string, payload: any) {
        if (this.events[event]) {
            // Execute handlers asynchronously to prevent blocking the caller
            setTimeout(() => {
                this.events[event].forEach(handler => {
                    try {
                        handler(payload);
                    } catch (e) {
                        console.error(`[EventBus] Error in handler for ${event}:`, e);
                    }
                });
            }, 0);
        }
    }
};

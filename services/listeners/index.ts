
import { SystemListeners } from './system';

export const ListenerRegistry = {
    init() {
        SystemListeners.register();
        // Register other listeners (Email, Webhook) here
    }
};

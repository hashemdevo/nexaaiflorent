export const generateUUIDv7 = () => {
    return 'uuid-v7-' + Date.now() + Math.random();
};

export interface BaseEntity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
}

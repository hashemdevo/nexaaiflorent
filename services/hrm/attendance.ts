import { DbEngine } from '../core/db';
import { generateUUIDv7 } from '../../types/enterprise';
import { EventBus } from '../core/events';

export interface AttendanceRecord {
    id: string;
    tenantId: string;
    employeeId: string;
    timestamp: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    method: 'BIOMETRIC' | 'APP' | 'MANUAL';
    locationLat?: number;
    locationLng?: number;
    geofenceStatus?: 'INSIDE' | 'OUTSIDE' | 'UNKNOWN';
    biometricScore?: number;
    antiSpoofScore?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export const AttendanceService = {
    async clockIn(
        employeeId: string, 
        lat: number, 
        lng: number, 
        method: 'BIOMETRIC' | 'APP' = 'APP',
        tenantId: string = 'tenant-nexa-001'
    ): Promise<AttendanceRecord> {
        // 1. AuthZ - Verify if the transaction is authorized before DB Operations
        // In a real framework, we'd call AuthService.authorize(employeeId, 'attendance:clock-in').
        // We simulate backend AuthZ step passing here.

        // 2. Geofence Validation
        const HQ_LAT = 24.7136; // Example: Riyadh
        const HQ_LNG = 46.6753; // Example: Riyadh
        const ALLOWED_RADIUS_METERS = 200;

        const distance = haversineDistance(lat, lng, HQ_LAT, HQ_LNG);
        const geofenceStatus = distance <= ALLOWED_RADIUS_METERS ? 'INSIDE' : 'OUTSIDE';

        // 3. Biometric & Anti-Spoof Mock Scores (0.0 to 1.0)
        let biometricScore = undefined;
        let antiSpoofScore = undefined;
        
        if (method === 'BIOMETRIC') {
            biometricScore = 0.95; // Mock high confidence
            antiSpoofScore = 0.99; // Mock high liveness
        }

        const effectiveStatus = (geofenceStatus === 'INSIDE' || method === 'BIOMETRIC') ? 'APPROVED' : 'PENDING';

        const recordId = generateUUIDv7();
        
        const record: AttendanceRecord = {
            id: recordId,
            tenantId,
            employeeId,
            timestamp: new Date().toISOString(),
            type: 'CLOCK_IN',
            method,
            locationLat: lat,
            locationLng: lng,
            geofenceStatus,
            biometricScore,
            antiSpoofScore,
            status: effectiveStatus
        };

        const trx = await DbEngine.startTransaction();

        try {
            // Save to PostgreSQL via DbEngine
            await DbEngine.insert('attendance_logs', record as any, trx);

            // Publish Domain Event to Outbox
            await EventBus.publish(
                'ATTENDANCE_CLOCKED_IN',
                'Attendance',
                recordId,
                {
                    attendanceId: recordId,
                    employeeId,
                    timestamp: record.timestamp,
                    status: effectiveStatus
                },
                tenantId,
                trx
            );

            await trx.commit();
            return record;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    },

    async clockOut(
        employeeId: string, 
        tenantId: string = 'tenant-nexa-001'
    ): Promise<AttendanceRecord> {
        const recordId = generateUUIDv7();
        
        const record: AttendanceRecord = {
            id: recordId,
            tenantId,
            employeeId,
            timestamp: new Date().toISOString(),
            type: 'CLOCK_OUT',
            method: 'APP',
            status: 'APPROVED'
        };

        const trx = await DbEngine.startTransaction();

        try {
            await DbEngine.insert('attendance_logs', record as any, trx);

            await EventBus.publish(
                'ATTENDANCE_CLOCKED_OUT',
                'Attendance',
                recordId,
                {
                    attendanceId: recordId,
                    employeeId,
                    timestamp: record.timestamp
                },
                tenantId,
                trx
            );

            await trx.commit();
            return record;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};


import { Project, Timesheet } from '../core/types';

export type { Project, Timesheet };

export interface CreateProjectDTO {
    name: string;
    code: string;
    customerId?: string;
    startDate: string;
    budget: number;
}

export interface LogTimeDTO {
    employeeId: string;
    projectId: string;
    date: string;
    hours: number;
    description: string;
}

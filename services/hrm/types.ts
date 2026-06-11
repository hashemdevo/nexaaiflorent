
import { Department, LeaveRequest, PerformanceReview } from '../core/types';

export type { Department, LeaveRequest, PerformanceReview };

export interface RequestLeaveDTO {
    employeeId: string;
    type: LeaveRequest['type'];
    startDate: string;
    endDate: string;
    reason?: string;
}

export interface SubmitReviewDTO {
    employeeId: string;
    reviewerId: string;
    rating: number;
    comments: string;
    goals: string;
    evaluationCriteria?: {
        qualityOfWork: number;
        communication: number;
        teamwork: number;
        initiative: number;
        technicalSkills: number;
    };
    strengths?: string;
    areasForImprovement?: string;
}

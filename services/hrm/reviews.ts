
import { DbEngine } from '../core/db';
import { PerformanceReview } from '../core/types';
import { SubmitReviewDTO } from './types';
import { AuditService } from '../admin/audit';

export const PerformanceReviewService = {
    async getByEmployee(employeeId: string): Promise<PerformanceReview[]> {
        return DbEngine.select<PerformanceReview>('performance_reviews', { 
            where: { employeeId },
            orderBy: 'date',
            orderDir: 'desc' 
        });
    },

    async submitReview(dto: SubmitReviewDTO): Promise<PerformanceReview> {
        const trx = await DbEngine.startTransaction();

        try {
            const review: PerformanceReview = {
                id: `pr-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                employeeId: dto.employeeId,
                reviewerId: dto.reviewerId,
                date: new Date().toISOString(),
                rating: dto.rating,
                comments: dto.comments,
                goals: dto.goals,
                evaluationCriteria: dto.evaluationCriteria,
                strengths: dto.strengths,
                areasForImprovement: dto.areasForImprovement
            };

            await DbEngine.insert('performance_reviews', review, trx);
            
            // Audit the sensitive action
            await AuditService.log('hrm', dto.reviewerId, 'CREATE', `Review for ${dto.employeeId}`, `Rating: ${dto.rating}/5`, trx);

            await trx.commit();
            return review;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};

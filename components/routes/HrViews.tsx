
import React from 'react';
import { ViewState } from '../../types';
import { LeaveManagement } from '../hrm/LeaveManagement';
import { PayrollProcessing } from '../hrm/PayrollProcessing';
import { PerformanceReviews } from '../hrm/PerformanceReviews';
import { EmployeeDirectory } from '../hrm/EmployeeDirectory';
import { HRMAttendance } from '../hrm/HRMAttendance';

export const HrViews: React.FC<{ view: ViewState }> = ({ view }) => {
    switch(view) {
        case ViewState.HRM_DIRECTORY: return <EmployeeDirectory />;
        case ViewState.HRM_ATTENDANCE: return <HRMAttendance />;
        case ViewState.HRM_LEAVE: return <LeaveManagement />;
        case ViewState.HRM_PAYROLL: return <PayrollProcessing />;
        case ViewState.HRM_PERFORMANCE: return <PerformanceReviews />;
        default: return null;
    }
};


import React from 'react';
import { IndustryType } from '../../types';
import { ConstructionDashboard, MedicalDashboard, RestaurantDashboard } from './IndustryWidgets';
import { ManufacturingStats } from './widgets/ManufacturingStats';
import { RealEstateStats } from './widgets/RealEstateStats';
import { EducationStats } from './widgets/EducationStats';
import { LegalStats } from './widgets/LegalStats';
import { LogisticsStats } from './widgets/LogisticsStats';
import { TravelStats } from './widgets/TravelStats';
import { MaintenanceStats } from './widgets/MaintenanceStats';
import { RetailStats } from './widgets/RetailStats';
import { PharmacyStats } from './widgets/PharmacyStats';

interface IndustryRouterProps {
    industry: IndustryType | 'GENERIC';
}

export const IndustryRouter: React.FC<IndustryRouterProps> = ({ industry }) => {
    switch (industry) {
        case 'CONSTRUCTION':
            return <ConstructionDashboard />;
        case 'MEDICAL':
        case 'HOSPITAL':
            return <MedicalDashboard />;
        case 'PHARMACY':
            return <PharmacyStats />;
        case 'RESTAURANT':
            return <RestaurantDashboard />;
        case 'MANUFACTURING':
            return <ManufacturingStats />;
        case 'REAL_ESTATE':
            return <RealEstateStats />;
        case 'EDUCATION':
            return <EducationStats />;
        case 'LEGAL':
            return <LegalStats />;
        case 'LOGISTICS':
            return <LogisticsStats />;
        case 'TRAVEL':
            return <TravelStats />;
        case 'MAINTENANCE':
            return <MaintenanceStats />;
        case 'RETAIL':
            return <RetailStats />;
        default:
            return null; 
    }
};

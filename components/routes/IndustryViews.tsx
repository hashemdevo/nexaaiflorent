
import React from 'react';
import { ViewState } from '../../types';
import { ConstructionSites } from '../industry/ConstructionSites';
import { PatientRecords } from '../industry/PatientRecords';
import { HospitalOperations } from '../industry/HospitalOperations';
import { ClinicScheduler } from '../industry/ClinicScheduler';
import { RestaurantTables } from '../industry/RestaurantTables';
import { LogisticsFleet } from '../industry/LogisticsFleet';
import { PharmacyDispensa } from '../industry/PharmacyDispensa';
import { RetailShift } from '../industry/RetailShift';
import { TravelBookings } from '../industry/TravelBookings';
import { MaintenanceRequests } from '../industry/MaintenanceRequests';
import { ManufacturingProduction } from '../industry/ManufacturingProduction';
import { CrmPipeline } from '../industry/CrmPipeline';
import { RealEstateProperties } from '../industry/RealEstateProperties';
import { EducationClasses } from '../industry/EducationClasses';
import { LegalCases } from '../industry/LegalCases';

export const IndustryViews: React.FC<{ view: ViewState }> = ({ view }) => {
    switch(view) {
        case ViewState.INDUSTRY_CONSTRUCTION_SITES: return <ConstructionSites />;
        case ViewState.INDUSTRY_MEDICAL_PATIENTS: return <PatientRecords />;
        case ViewState.INDUSTRY_HOSPITAL_OPERATIONS: return <HospitalOperations />;
        case ViewState.INDUSTRY_CLINIC_SCHEDULER: return <ClinicScheduler />;
        case ViewState.INDUSTRY_RESTAURANT_TABLES: return <RestaurantTables />;
        case ViewState.INDUSTRY_LOGISTICS_FLEET: return <LogisticsFleet />;
        case ViewState.INDUSTRY_PHARMACY_DISPENSARY: return <PharmacyDispensa />;
        case ViewState.INDUSTRY_RETAIL_SHIFTS: return <RetailShift />;
        case ViewState.INDUSTRY_TRAVEL_BOOKINGS: return <TravelBookings />;
        case ViewState.INDUSTRY_MAINTENANCE_REQUESTS: return <MaintenanceRequests />;
        case ViewState.INDUSTRY_MANUFACTURING_PRODUCTION: return <ManufacturingProduction />;
        case ViewState.INDUSTRY_CRM_PIPELINE: return <CrmPipeline />;
        case ViewState.INDUSTRY_REAL_ESTATE_PROPERTIES: return <RealEstateProperties />;
        case ViewState.INDUSTRY_EDUCATION_CLASSES: return <EducationClasses />;
        case ViewState.INDUSTRY_LEGAL_CASES: return <LegalCases />;
        default: return null;
    }
};

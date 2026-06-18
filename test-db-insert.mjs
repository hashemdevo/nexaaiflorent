// Insert test
async function go() {
    const payload = {
        id: 'emp-nexa-1001',
        tenantId: 'tenant-nexa-001',
        employeeCode: 'NEX-EMP-001',
        firstName: 'Abdulaziz',
        middleName: 'Bin Khalid',
        lastName: 'Al-Suwaidan',
        arabicLegalName: 'عبدالعزيز خالد السويدان',
        englishLegalName: 'Abdulaziz Khalid Al-Suwaidan',
        nationalId: '1092837482',
        gender: 'MALE',
        employmentType: 'FULL_TIME',
        joiningDate: '2024-01-15',
        payrollGroup: 'PG-EXECUTIVE',
        currency: 'SAR',
        shiftPolicy: 'SP-FLEXIBLE-HQ',
        attendancePolicy: 'A-TRUST-BASED',
        approvalAuthorityLevel: 4, 
        departmentId: 'dept-exec',
        departmentCode: 'HQ-EXEC',
        branchId: 'branch-ruh-01',
        costCenterId: 'CC-ADMIN-CORP',
        reportingManagerId: '',
        warehouseAccessId: 'wh-all-access',
        systemAccessEnabled: true,
        corporateEmail: 'a.suwaidan@nexaledger.com',
        mfaRequired: true,
        allowedIpRanges: '0.0.0.0/0',
        deviceRestriction: 'ALL',
        privilegedAccessFlag: true,
        accountStatus: 'ACTIVE',
        failedAttempts: 0,
        activeSessionsCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
    };

    const res = await fetch("http://localhost:3000/api/db/crud", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-role": "ACCOUNTANT",
            "x-employee-id": "emp-sc-001",
            "x-tenant-id": "tenant-nexa-001"
        },
        body: JSON.stringify({
            operation: "INSERT",
            table: "employees",
            payload: payload
        })
    });
    console.log(res.status, await res.text());
}
go();

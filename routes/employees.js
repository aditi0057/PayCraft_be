const express = require('express');
const router = express.Router();
const { getEmployees } = require('../storage/employeeStore');

router.get('/employees',(req,res)=>{
    const employees = getEmployees();

    if(!employees || employees.length === 0){
        return res.status(404).json({
            error: true,
            message: 'No employees data found. Please upload correct Excel format.'
        });
    }
    res.status(200).json({
        success: true,
        count: employees.length,
        employees: employees.map(emp => ({
            empNo: emp.empNo,
            name: emp.name
        }))
    });
});

module. exports = router;
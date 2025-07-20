const ExcelJs = require('exceljs');

async function parseExcel(filepath){
    const workbook = new ExcelJs.Workbook();
    await workbook.xlsx.readFile(filepath);

    const worksheet=workbook.worksheets[0];
    const employees=[];

    worksheet.eachRow((row,rowNumber)=>{
        if(rowNumber === 1) return;

        const base = Number(row.getCell(9).value || 0);
        const boa = Number(row.getCell(10).value || 0);
        const tax = Number(row.getCell(11).value || 0);
        const expense = Number(row.getCell(12).value || 0);

        const employee ={
            empNo: row.getCell(1).value,
            name: row.getCell(2).value,
            status: row.getCell(3).value,
            dob: row.getCell(4).value,
            joiningDate: row.getCell(5).value,
            designation: row.getCell(6).value,
            location: row.getCell(7).value,
            lastWorkingDay: row.getCell(8).value,
            base,
            boa,
            tax,
            expense,
            total: base + boa - tax +expense,
            Account_No: row.getCell(14).value
        };
        employees.push(employee);
    });
    return employees;
}

module.exports = parseExcel;
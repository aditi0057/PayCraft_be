const path = require('path');
const parseExcel = require('./services/excelParser');
const generatePayslip = require('./services/generatePayslip');

const excelPath = path.join(__dirname,'uploads','sample-1749829588264-18566320.xlsx');
const templatePath = path.join(__dirname, 'uploads', 'template-1749829588265-491483165.docx');

async function main(){
    try {
        const employees = await parseExcel(excelPath);
        const employee = employees[3];
        console.log('Testing employee: ', employee);

        const pdfPath = generatePayslip(employee, templatePath);
        console.log('Payslip generated at :',pdfPath);
    }
    catch(err){
        console.error('Error: ', err);
    }
}
main();
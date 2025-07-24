const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const mammoth = require("mammoth");
const chromium = require("@sparticuz/chromium"); 
const puppeteer = require("puppeteer-core"); 

const outputDir = path.join(__dirname, "..", "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function generatePayslip(employee, templatePath) {
  let browser;
  try {
    
    const templateBuffer = fs.readFileSync(templatePath);
    const zip = new AdmZip(templateBuffer);
    
    const replacements = {
      __NAM__: employee.name,
      __EN__: employee.empNo,
      __LOC__: employee.location,
      __DOB__: employee.dob,
      __DOJ__: formatDate(employee.joiningDate),
      __DSG__: employee.designation,
      __STS__: employee.status,
      __LWD__: formatDate(employee.lastWorkingDay),
      __BAS__: employee.base,
      __BOA__: employee.boa,
      __EXP__: employee.expense,
      __TAX__: employee.tax,
      __TOT__: employee.total,
      __ACC__: employee.Account_No,
    };

    let documentXml = zip.readAsText("word/document.xml");

    for (const [key, val] of Object.entries(replacements)) {
      const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
      documentXml = documentXml.replace(regex, val != null ? val.toString() : '');
    }

    zip.updateFile("word/document.xml", Buffer.from(documentXml, "utf8"));
    const modifiedDocxBuffer = zip.toBuffer();

    //  DOCX buffer to HTML using Mammoth
    const { value: html } = await mammoth.convertToHtml({ buffer: modifiedDocxBuffer });

    //Puppeteer-Core with the lightweight Chromium to "print" the HTML to a PDF
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    
    const styledHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #dddddd; text-align: left; padding: 8px; }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(outputDir, `${employee.name}_${employee.empNo}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true
    });

    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF generation failed using Puppeteer");
    }

    return pdfPath;

  } catch (error) {
    console.error("Error generating payslip:", error);
    throw error;
  } finally {
    // Ensure the browser is closed even if an error occurs
    if (browser) {
      await browser.close();
    }
  }
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

module.exports = generatePayslip;

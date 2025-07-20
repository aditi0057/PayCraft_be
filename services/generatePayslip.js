const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { execSync } = require("child_process");

const outputDir = path.join(__dirname, "..", "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function generatePayslip(employee, templatePath) {
  try {
    const zip = new AdmZip(templatePath);
    const zipEntries = zip.getEntries();

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

    const documentXml = zip.readAsText("word/document.xml");

    let updatedXml = documentXml;

    for (const [key, val] of Object.entries(replacements)) {
      const regex = new RegExp(
        key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "g"
      );
      updatedXml = updatedXml.replace(regex, val.toString());
    }

    zip.updateFile("word/document.xml", Buffer.from(updatedXml, "utf8"));

    const docxPath = path.join(
      outputDir,
      `${employee.name}_${employee.empNo}.docx`
    );
    zip.writeZip(docxPath);

    execSync(
      `soffice --headless --convert-to pdf "${docxPath}" --outdir "${outputDir}"`
    );

    const pdfPath = path.join(outputDir, `${employee.name}_${employee.empNo}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF generation failed");
    }

    return pdfPath;
  } catch (error) {
    console.error("Error generating payslip:", error);
    throw error;
  }
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

module.exports = generatePayslip;

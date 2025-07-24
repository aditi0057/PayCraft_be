const express = require("express");
const router = express.Router();
const generatePayslip = require("../services/generatePayslip");
const { getEmployees } = require("../storage/employeeStore");
const path = require("path");
const fs = require("fs");

router.get("/:empNo", async (req, res) => {
  const empNo = req.params.empNo;
  const employees = getEmployees();
  console.log("All employees:", employees);
  console.log("Looking for empNo:", empNo);
  console.log(
    "Available empNos:",
    employees.map((e) => e.empNo)
  );

  const employee = employees.find(
    (emp) => emp.empNo.toString().trim() === empNo
  );

  if (!employee) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const uploadDir = path.join(__dirname, "..", "uploads");
  const docxFile = fs
    .readdirSync(uploadDir)
    .filter((file) => path.extname(file).toLowerCase() === ".docx")
    .map((file) => ({
      file,
      time: fs.statSync(path.join(uploadDir, file)).mtime,
    }))
    .sort((a, b) => b.time - a.time);
  if (docxFile.length === 0) {
    throw new Error('No ".docx" template found in uploads');
  }
//   if (docxFile.length > 1) {
//     throw new Error('Multiple ".docx" template found.');
//   }
  try {
    const templatePath = path.join(uploadDir, docxFile[0].file);
    const pdfPath = await generatePayslip(employee, templatePath);
    res.download(pdfPath);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error generating payslip for given employee" });
  }
});

module.exports = router;

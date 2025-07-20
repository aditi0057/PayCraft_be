const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const ApiError = require('../utils/ApiError');
const parseExcel = require('../services/excelParser');
const { setEmployees } = require('../storage/employeeStore')

const router=express.Router();


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        const uploadDir = path.join(__dirname,'..','uploads');

        if(!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir);
        }

        cb(null,uploadDir);
    },
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9);
        const ext = path.extname(file.originalname);
        const base=path.basename(file.originalname,ext);
        cb(null,`${base}-${uniqueSuffix}${ext}`);
    }
});

const upload=multer({storage});

router.post('/upload',upload.fields([
    {name:'excelFile',maxCount:1},
    {name:'templateFile',maxCount:1}
]), async(req,res,next)=>{

    try{
        if(!req.files || !req.files.excelFile || !req.files.templateFile){
            throw new ApiError('Both Excel and Word(docx) files are required.',400);
        }
        const excelFile=req.files.excelFile[0];
        const templateFile=req.files.templateFile[0];

        if(!excelFile.originalname.endsWith('.xlsx')){
            throw new ApiError('File Uploaded should be in .xlsx format',400);
        }

        if(!templateFile.originalname.endsWith('.docx')){
            throw new ApiError('Template Uploaded should be in .docx format',400);
        }

        const employees = await parseExcel(excelFile.path);
        setEmployees(employees);
        res.status(200).json({
            message:'Files Uploaded Successfully',
            uploadId: Date.now().toString(),
            excelPath: excelFile.path,
            templatePath: templateFile.path,
            employees
        });
        
    }
    catch(err){
        next(err);
    }
});


module.exports=router;



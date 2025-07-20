const express=require('express');
const path = require('path');

const app = express();
//Middlewares
app.use(express.json()); //middleware
app.use(express.urlencoded({extended: true}));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
//Routes
const uploadRoutes = require('./routes/upload');
app.use('/api',uploadRoutes);

const employeeRoutes = require('./routes/employees');
app.use('/api',employeeRoutes);

const payslipRoutes = require('./routes/payslip');
app.use('/api/payslip', payslipRoutes);

app.get('/health',(req,res)=>{
    res.send('Backend is running');
});
// Error Handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

//Server
const PORT = 4000;
app.listen(PORT,()=>{
    console.log('App is running....');
});
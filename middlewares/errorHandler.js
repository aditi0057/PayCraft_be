const ApiError = require('../utils/ApiError');

module.exports=(err,req,res,next)=>{
    if(err instanceof ApiError)
    {
        return res.status(err.status).json({
            error:true,
            message:err.message,
        });
    }
    console.error('Unexpected Error: ',err);

    res.status(500).json({
        error: true,
        message: 'Internal Server Error',
    });
};
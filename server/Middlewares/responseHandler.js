const ErrorHandler = require("../Utils/errorHandler");

const errorMiddleware  = (err,req,res,next) =>{
  // console.log("Error MiddlewareErr: ",err);
  // console.log("Error Middleware: ",err.statusCode, err.message, err.success, err.error);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    err.success = err.success;
    err.error = err.error;
    
    // Wrong Mongodb Id error
    if(err?.error?.name === "CastError"){
        const message = `Resource not found. Invalid ${err.error.path}`;
        err = new ErrorHandler(message, 400, err.error.message)
    }

    //Mongoose duplicate key error.
    if(err?.error?.code == 11000){
        const message= `Duplicate ${Object.keys(err.error.keyValue)} Entered`;
        err =  new ErrorHandler(message,400, err.error.message); 
    }

    // Wrong JWT error.
    if(err?.error?.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid, Try again.`;
        err = new ErrorHandler(message,400)
    }

     // JWT Expire error.
     if(err?.name === "TokenExpiredError"){
        const message = `Json Web Token is Expired, Try again.`;
        err = new ErrorHandler(message,400)
    }

    res.status(err.statusCode).json({ "ResponseCode": err.statusCode, "ResponseMessage": err.message, "succeeded": err.success, "ResponseData": err?.error?.message ? err.error.message : err.error });

}

const SuccessHandler = (res, message, status=200, data = null) =>{
  //console.log("SuccessHandler", message, "Data: ",data);
  res.status(status).json({ "ResponseCode": status, "ResponseMessage": message, "succeeded": true, "ResponseData": data });

};

module.exports = {
  errorMiddleware,
  SuccessHandler,
};
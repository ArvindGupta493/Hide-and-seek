class ErrorHandler extends Error {
    constructor(message, statusCode, err = {}, success = false) {
        super(message)
        this.statusCode = statusCode
        this.error = err
        this.success = success

        console.log("message: ",message);
        console.log("statusCode: ",statusCode);
        console.log("err: ",err);
        console.log("success: ",success);

        Error.captureStackTrace(this, this.constructor);
    }
};

module.exports = ErrorHandler;

 
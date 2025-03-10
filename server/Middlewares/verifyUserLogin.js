const jwt = require("jsonwebtoken");
const ErrorHandler = require("../Utils/errorHandler");

const verifyUserLogin = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return next(new ErrorHandler("No token provided!", 403));
    }
    jwt.verify(token.split(" ")[1], process.env.PRIVATE_KEY, (err, decoded) => {
        if (err) {
            return next(new ErrorHandler("Failed to authenticate token.", 500, err));
        }
        req.decoded = decoded;
        next();
    });
};

module.exports = verifyUserLogin;







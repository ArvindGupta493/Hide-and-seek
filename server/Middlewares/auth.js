const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../Models/BlacklistedToken"); // Import the blacklist model

class Authentication {
    
    async privateAuth(req, res, next) {
        let token = req.headers.authorization;

        if (!token) {
            console.error("Missing Authorization Header");
            return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Authorization header is missing.", "succeeded": false, "ResponseData": {} });
        }

        token = token.split(' ');
        if (token[0] !== 'Bearer' || !token[1]) {
            console.error("Invalid Token Format");
            return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token format.", "succeeded": false, "ResponseData": {} });
        }

        token = token[1];

        try {
            const blacklisted = await BlacklistedToken.findOne({ token }); 
            // console.log("Blacklist Check Result:", blacklisted);
            if (blacklisted) {
                console.error("Blacklisted Token Used:", token);
                return res.status(401).json({ "ResponseMessage": "Unauthorized: Token has been blacklisted." });
            }

        
            // console.log("BlacklistedToken Model:", BlacklistedToken);
            // console.log("BlacklistedToken.findOne:", typeof BlacklistedToken.findOne);
            // console.log("Token from request:", req.headers.authorization);

            // Verify token
            jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
                if (err) {
                    console.error("Token Verification Failed", err.message);
                    return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": {} });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });

        } catch (error) {
            console.error("Error in Authentication Middleware", error.message);
            return res.status(500).json({ "ResponseCode": 500, "ResponseMessage": "Internal server error.", "succeeded": false, "ResponseData": {} });
        }
    }

    async adminAuth(req, res, next) {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Authorization header is missing.", "succeeded": false, "ResponseData": {} });
        }

        token = token.split(' ');
        if (token[0] !== 'Bearer' || !token[1]) {
            return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token format.", "succeeded": false, "ResponseData": {} });
        }

        token = token[1];

        try {
            // Check if token is blacklisted
            const blacklisted = await BlacklistedToken.findOne({ token });
            if (blacklisted) {
                return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Unauthorized: Token has been blacklisted.", "succeeded": false, "ResponseData": {} });
            }

            // Verify admin token
            jwt.verify(token, process.env.ADMIN_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid admin token.", "succeeded": false, "ResponseData": {} });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });

        } catch (error) {
            return res.status(500).json({ "ResponseCode": 500, "ResponseMessage": "Internal server error.", "succeeded": false, "ResponseData": {} });
        }
    }
}

module.exports = new Authentication();



































// const jwt = require("jsonwebtoken")
// const Promise = require("bluebird")

// class Authentication{
  
//     privateAuth(req, res, next) {
//         let token = req.headers.authorization;
    
//         if (!token) {
//             console.error("Missing Authorization Header");
//             return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Authorization header is missing.", "succeeded": false, "ResponseData": {} });
//         }
    
//         token = token.split(' ');
//         if (token[0] !== 'Bearer' || !token[1]) {
//             console.error("Invalid Token Format");
//             return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token format.", "succeeded": false, "ResponseData": {} });
//         }
    
//         token = token[1];
//         jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
//             if (err) {
//                 console.error("Token Verification Failed", err.message);
//                 return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": { token } });
//             } else {
//                 req.decoded = decoded;
//                 next();
//             }
//         });
//     }
    


// // privateAuth(req, res, next) {
// //     var token = req.headers.authorization;

// //     // Check if authorization header exists
// //     if (!token) {
// //         return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Authorization header is missing.","succeeded": false,"ResponseData": {}});
// //     }
// //     token = token.split(' ');                                              // Split the token and check if it's in the correct format
// //     if (token[0] !== 'Bearer' || !token[1]) {
// //         return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Invalid token format.","succeeded": false,"ResponseData": {} });
// //     }

// //     token = token[1];                                                     // Extract the actual token
// //     var privatekey = process.env.PRIVATE_KEY;
// //     jwt.verify(token, privatekey, (err, decoded) => {                     // Verify the token                          
// //         if (err) {
// //             return res.status(401).json({"ResponseCode": 401,"ResponseMessage": "Invalid token.","succeeded": false,"ResponseData": { token }});
// //         } else {
// //             req.decoded = decoded;
// //             next();
// //         }
// //     });
// // }


//     adminAuth(req, res, next) {
//         var token = req.headers.authorization;

//         if (!token) {                                    // Check if authorization header exists
//             return res.status(401).json({ "ResponseCode": 401, "ResponseMessage": "Authorization header is missing.", "succeeded": false, "ResponseData": {}  });
//         }
//         token = token.split(' ');                        // Split the token and check if it is in the correct format
//         if (token[0] !== 'Bearer' || !token[1]) {
//             return res.status(401).json({"ResponseCode": 401, "ResponseMessage": "Invalid token format.", "succeeded": false, "ResponseData": {}})
//         }
//         token = token[1];                                                                // Extract the actual token
//         var adminkey = process.env.ADMIN_KEY;
//         jwt.verify(token, adminkey, (err, decoded) => {                                  // Verify the token
//             if (err) {
//                 return res.status(401).json({  "ResponseCode": 401, "ResponseMessage": "Invalid token.", "succeeded": false, "ResponseData": { token }});
//             } else {req.decoded = decoded;   
//                 next();
//             }
//         });
//     }
    
// }

// module.exports = new Authentication()

















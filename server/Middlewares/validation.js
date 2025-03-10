const { check, validationResult } = require('express-validator');

const validationAuth = {
   

    registerValidate: [
        check('name').trim().notEmpty().withMessage('Please enter Name.'),
        check('email').trim().isEmail().withMessage('Please enter a valid Email.'),
        check('username').trim().notEmpty().withMessage('Please enter Username.'),
        check('password').trim().notEmpty().isStrongPassword().withMessage('Password must be strong.'),
    ],

    loginValidate: [
        check('email').trim().isEmail().withMessage('Email is required.'),
        check('password').trim().notEmpty().withMessage('Password is required.'),
    ],
    
    updatedPwdValidate: [
        check('newPassword')        
        .trim()        
        .notEmpty().withMessage('Please enter new password.')        
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long.")        
        .isStrongPassword()        
        .withMessage('Please enter strong password, password should contain (A-Z, a-z, 0-9 and special character ).'),
        
        check('confirmPassword')        
        .trim()        
        .notEmpty().withMessage('Please enter confirm password.')        
        .isLength({ min: 8 }).withMessage("confirm password must be at least 8 characters long.")        
        .isStrongPassword()        
        .withMessage('Please enter strong password, password should contain (A-Z, a-z, 0-9 and special character ).')
    ],
    
    generateValidate: [
        check('email').trim().isEmail().withMessage('Email is required.'),
    ],
    
    otpValidate: [
        check('email').trim().isEmail().withMessage('Valid email is required.'),
        check('otp')
            .trim()
            .isLength({ min: 4, max: 4 }).withMessage('OTP must be a 4-digit number.')
            .isNumeric().withMessage('OTP must contain only numbers.')
    ],
     
    // updatePwdValidate: [
    //     check('email').trim().isEmail().withMessage('Valid email is required.'),
    //     check('new_password')
    //         .trim()
    //         .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
    //         .isStrongPassword().withMessage('Password should contain (A-Z, a-z, 0-9, and special characters).')
    // ], 

    adminRegisterValidate: [
        check('name')
            .trim()
            .notEmpty().withMessage('Please enter Name.'),
        
        check('email')
            .trim()
            .notEmpty().withMessage('Please enter Email.')
            .isEmail().withMessage('Please enter a valid Email.'),
        
        check('username')
            .trim()
            .notEmpty().withMessage('Please enter Username.'),
        
        check('password')
            .trim()
            .notEmpty().withMessage('Please enter Password.')
            .isString()
            .isStrongPassword().withMessage('Please enter a strong password, which should contain (A-Z, a-z, 0-9, and special characters).'),
    ],
    adminLoginValidate: [
        check('email').trim().isEmail().withMessage('Email is required.'),
        check('password').trim().notEmpty().withMessage('Password is required.'),

        // check('email').trim().isString().notEmpty().withMessage('Please enter Email.').isEmail().withMessage('Please enter a valid Email.'),
         // check('password').trim()isString().isLength({ min: 6 }).withMessage("Password must be atleast 6 character long.")
    ],

    // validateLogin: [
    //     check('uuid').trim().notEmpty().withMessage('uuid is required.').isString().isLength({ min: 2, max: 50 }).withMessage('uuid should be between 2 and 50 characters.'),
    //     check('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email address.'),
    //     check('login_type').trim().notEmpty().withMessage('Login Type is required.')
    // ],  
 
     isRequestValidate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                "ResponseCode": 400,
                "ResponseMessage": errors.array()[0].msg,
                "succeeded": false,
                "ResponseData": {}
            });
        }
        next();
    },
}

module.exports = validationAuth;
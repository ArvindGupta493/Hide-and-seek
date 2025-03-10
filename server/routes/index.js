const express = require("express")
const router = express.Router()

router.use('/admin', require('./adminRoutes'))
router.use('/user', require('./userRoutes'))

module.exports = router
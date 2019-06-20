const express = require('express');
const router = express.Router();

router.post('/login',async function(req,res,next){
    res.data = {token:123};
    next();
});

module.exports = router;
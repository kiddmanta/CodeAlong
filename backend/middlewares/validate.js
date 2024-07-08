const { validationResult } = require("express-validator");
const NewError = require("../utils/NewError");

exports.validate = (req,res,next) => {
    console.log('Validating');
    const validationResults = validationResult(req);

    if(!validationResults.isEmpty()){
        throw new NewError(validationResults.array()[0].msg, 400,true);
    }

    return next();
}
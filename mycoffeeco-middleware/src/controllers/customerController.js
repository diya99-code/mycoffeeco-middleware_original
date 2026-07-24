const customerService = require("../services/customerService");
exports.test = (req, res) => {

    res.json({
        success: true,
        message: "Customer Module Working"
    });

};

exports.syncCustomer = async (req, res) => {

    try {

        const result = await customerService.syncCustomer(req.body);

        res.json(result);

    }

    catch(err){

        res.status(500).json({

            success:false,

            error:err.message

        });

    }

};

exports.getCustomer = async(req,res)=>{

    try{

        const phone=req.params.phone;

        const customer=await customerService.getCustomer(phone);

        res.json(customer);

    }

    catch(err){

        res.status(500).json({

            success:false,

            error:err.message

        });

    }

};
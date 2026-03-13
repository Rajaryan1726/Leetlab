function asyncHandler(requesthandler){
    return function(req,res,next){
        Promise.resolve(requesthandler(req,res,next))
                .catch(function(err){
                    console.error("ERROR:", err.message);

                    res.status(500).json({
                        success: false,
                        message: err.message || "Internal Server Error",
                    });
                })
    }
}

export { asyncHandler };
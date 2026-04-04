const errorHandler = (err, req, res, next) => {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
        message: err.message
    });
};

export default errorHandler;
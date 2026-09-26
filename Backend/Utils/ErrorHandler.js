class ApiError extends Error {
    constructor(statusCode, message = "Something went worng", errors = []) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
    }
}

export default ApiError;

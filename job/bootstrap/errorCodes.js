class ErrorCodes {
      constructor() {
            this.errorCode = {
                  85000: 'No record found to update',
            };
      }

      getErrorMessage(errorCodeDetail){
            return this.errorCode[errorCodeDetail];
      }
}

module.exports = ErrorCodes;
module.exports.getInstance = () => new ErrorCodes();


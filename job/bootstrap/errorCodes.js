class ErrorCodes {
      constructor() {
            this.errorCode = {
                  001: 'No record found to show',
            };
      }

      getErrorMessage(errorCodeDetail){
            return this.errorCode[errorCodeDetail];
      }
}

module.exports = ErrorCodes;
module.exports.getInstance = () => new ErrorCodes();


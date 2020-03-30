global.GenericError = function (message) {
    this.name = 'GenericError';
    this.message = message || 'Error Occurred, try again later';
    this.code = 500;
};

GenericError.prototype = Object.create(Error.prototype);
GenericError.prototype.constructor = GenericError;

global.NotFoundError = function (message) {
    this.name = 'NotFoundError';
    this.message = message || 'The url you are looking for was not found!!';
    this.code = 404;
};

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.constructor = NotFoundError;

global.ValidationError = function (message) {
    this.name = 'ValidationError';
    this.message = message || 'There were errors in validation';
    this.code = 422;
};

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

global.InvalidContentTypeError = function (message) {
    this.name = 'InvalidContentTypeError';
    this.message = message || 'The content type set was invalid';
    this.code = 406;
};

InvalidContentTypeError.prototype = Object.create(Error.prototype);
InvalidContentTypeError.prototype.constructor = InvalidContentTypeError;

global.BadRequestError = function (message) {
  this.name    = 'BadRequestError';
  this.message = message || 'The content you requested was not found';
  this.code    = 400;
};
BadRequestError.prototype = Object.create(Error.prototype);
BadRequestError.prototype.constructor = BadRequestError;

global.ServerError = function (message) {
  this.name    = 'ServerError';
  this.message = message || 'Service Temporarily Unavailable';
  this.code    = 503;
};
ServerError.prototype = Object.create(Error.prototype);
ServerError.prototype.constructor = ServerError;


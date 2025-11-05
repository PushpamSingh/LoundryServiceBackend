export class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.message=message
        this.errors=errors
        this.data=null
        this.success=false

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }

    toJSON() {
    return {
      success: this.success,
      statuscode: this.statuscode,
      message: this.message,
      errors: this.errors,
      stack: this.stack,
    };
  }
}
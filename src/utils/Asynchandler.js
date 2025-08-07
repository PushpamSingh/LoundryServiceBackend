export const Asynchandler=(handlerfunc)=>{
    return (req,res,next)=>{
        Promise.resolve(handlerfunc(req,res,next)).catch((err)=>next(err))
    }
}
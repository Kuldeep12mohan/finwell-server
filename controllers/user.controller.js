
import  User  from "../models/User.js";
export async function getAll(req,res){
    const { userId } = req.user;
    const { accountId } = req.body
    try{
        console.log("from getALl",userId)
        // console.log(req)
        const userData = await User.findById(userId);
        // now filter the required account
        const accounts = userData.accounts;
        const result = accounts.filter((acc)=>{
            return acc.id == accountId
        })
        res.json({
            message : "fetched",
            result,
            userData,
            status : 200
        })
    }
    catch(e){
        console.error("some error occurred")
        res.json({
            message : "error ocurred",
            status : 500
        })
    }
}
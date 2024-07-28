const mongoose=require('mongoose')
const fileScehma=new mongoose.Schema({
    title:{
        type:String,
        
    },
    summary:{
        type:String,
        
    },
    content:{
        type:String,
        
    },
    cover:{
        type:String,
        
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    }},

    {
        timestamps:true,
    }
)
module.exports=mongoose.model('files',fileScehma)
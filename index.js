const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const usermodel=require('./models/user')
const filemodel=require('./models/files')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const cookie=require('cookie-parser')
require('dotenv').config()
const multer=require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' });
const path=require('path')
const fs = require('fs');
const app=express();
const port=process.env.PORT || 4000;
app.use(express.json())

app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}))

app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cookie())
mongoose.connect(process.env.MONGOBLOG_URL).then(()=>{console.log('Database connection is successfull')}).catch((error)=>{console.log(error)})

app.post('/register',async (req,res)=>{
    const {username,password}=req.body
    const hashPassword=await bcrypt.hash(password,10)
    const user=await usermodel.create({username,password:hashPassword})
    res.json(user)
    
})
app.post('/login',async(req,res)=>{
    const {username,password}=req.body;
    const user=await usermodel.findOne({username})
    if(!user)
        {
            res.status(404).send('User does not exist')
        }
    const ispasswordvalid=await bcrypt.compare(password,user.password)
    if(!ispasswordvalid)
        {
            res.status(404).send('Password does not match')
        }
    const token=jwt.sign({username,userID:user._id},"secret")
    res.cookie('token',token)
    res.json({token,userID:user._id})
})
app.get('/profile',(req,res)=>{
    const {token}=req.cookies;
    if(!token)
        {
            console.log('User does not exist')
        }
        try{
            const decoded=jwt.verify(token,"secret",{},(err,info)=>{
                if(err) throw err
                {
                    res.json(info)
                }
            })
            
        }
        catch(error)
        {
            res.json({msg:error})
        }
})
app.post('/logout',async (req,res)=>{
    res.cookie('token','',{httpOnly:true})
    res.send('Logout Successfull')
})
app.post('/post' ,uploadMiddleware.single('file'),async (req,res)=>{
    try{
        const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
    const {title,summary,content,author}=req.body;
    // res.send({authors:author})
    const files=await filemodel.create({title,summary,content,cover:newPath,author})
    res.json(files)
    }
    catch(error)
    {
        console.log(error)
    }
    
})
app.get('/post',async(req,res)=>{
    const posts=await filemodel.find().populate('author',['username']);
    res.json(posts);
})
app.get('/post/:id',async(req,res)=>{
    const id=req.params.id;
    const post=await filemodel.findById(id).populate('author',['username']);
    res.json(post);
})
app.put('/editpost/:id',uploadMiddleware.single('file'),async(req,res)=>{
    try{
        const id=req.params.id;
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
    const {title,summary,content,author}=req.body;
    const updatedata={title,summary,content,author}
    updatedata.cover=newPath
    const post=await filemodel.findOneAndUpdate({_id:id},updatedata)
    res.json(post)
    }catch(error)
    {
        console.log(error)
    }
    
})
app.get('/')
app.listen(port,()=>{console.log(`Server is listening on ${port}`)})
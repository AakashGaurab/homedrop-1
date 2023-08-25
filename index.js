const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();


app.use(cors({origin:"*"}));
app.use(express.json());


let chunks = [];
let result;

doc.on('data', chunk => {
  chunks.push(chunk);
});




/* ****************************************user Model and Schema********************************** */
const userSchema = mongoose.Schema({
    email:String,
    history:Array,
})

const userModel = mongoose.model("users",userSchema);

/* ******************************************************************************************** */

app.get("/",async(req,res)=>{
    res.json("Welcome")
})



app.post("/auth",async(req,res)=>{
    let payload = req.body;
    
    try {
        if (!payload.email){
            res.json("Please Provide your Email");
        }
        else {
            let data = await userModel.find({email:payload.email});
            console.log(data);
            if (data.length>0){
                res.json("Email Already signed up");
            }
            else {
                await userModel.insertMany({email:payload.email,history:[]});
                payload.token = jwt.sign({email:payload.email},"key");
                res.json(payload);
            }
        }
        
    } catch (error) {
        res.json(error);
    }
})




app.post("/send-report",async(req,res)=>{
    let token = req.headers.authorization;
    jwt.verify(token,"key",async(err,decoded)=> { 
        if (decoded){
           let email = decoded.email;

           /* ************************************** Sending Mail **************************************** */
           doc.on('end', () => {
            result = Buffer.concat(chunks);
            
              let transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                      user: 'booking.hospital12@gmail.com',
                      pass: 'ubzppikhwbasdlzc'
                  }
              });
          
              let mailOptions = {
                  from: 'booking.hospital12@gmail.com',
                  to: `${email}`,
                  subject: 'Sending pdf Via Email',
                  text: `Pdf file from candidate aakashgaurav456@gmail.com`,
                  attachments: [
                      {
                          filename: `document.pdf`,
                          content: result
                      }
                  ]
              };
          
              // send emai 
              transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                      console.log(error);
                      res.json('Error sending email');
                  } else {
                      res.json({"succes":"true"});
                  }
              });
            });

            /* ******************************************************************************************** */
           doc.text(`Date:  ${new Date()}, User:${email}`);

           let obj = {};
           obj.date = new Date();
           obj.sentto = "Email"

           await userModel.updateOne( { email: email },{ $push: { history: obj } })

           doc.end();   
        }
        else {
            res.json("Token Not verified");
        }
    })
})

app.get("/get-history",async(req,res)=>{
    let token = req.headers.authorization;
    jwt.verify(token,"key",async(err,decoded)=>{
        if (decoded){
            let email = decoded.email;
            try {
                let data = await userModel.find({email:email});
                res.json(data[0].history);
            } catch (error) {
                res.json(error);
            }
        }
        else {
            res.json("Invalid token");
        }
    })
    
})





app.listen(3600,async()=>{
    try {
        await mongoose.connect("mongodb+srv://aakashgaurav456:Aakash@cluster0.blrrfmi.mongodb.net/homedrop?retryWrites=true&w=majority")
        console.log("server running")
    } catch (error) {
        console.log(error);
    }
})
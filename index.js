const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path')
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000


// DEFINE VARIABLES

//AWS Credentials
const ID = '';
const SECRET = ';
const filePath = 'downloaded.json';

//S3 bucket name
const BUCKET_NAME = '';
AWS.config.region = 'us-east-2';



//Initialize s3 
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET

});



//Websites email credentials
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'testcloudwebsiteemail@gmail.com',
    pass:''

  }
});



const app = express();
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false}));

app.get('/', (req, res) => res.render('pages/index'))





//////////DOWNLOAD FILE FROM S3//////////

app.use('/s3Proxy', function(req, res, next){
  // download the file via aws s3 here
  const fileKey = req.body.thisthis;
  
  

  console.log('Trying to download file', fileKey);
  var AWS = require('aws-sdk');
  AWS.config.update(
    {
      accessKeyId: ID,
      secretAccessKey: SECRET,
      region: 'us-east-2'
    }
  );
  var s3 = new AWS.S3();
  var options = {
      Bucket    : BUCKET_NAME,
      Key    : fileKey,
  };

  res.attachment(fileKey);
  var fileStream = s3.getObject(options).createReadStream();
  fileStream.pipe(res);
  

});
//////////////////////////////////////







//////////SAVE FILE LOCALLY//////////

app.use('/filenote', function (req, res) {
  console.log("Saved Locally");
  res.redirect(req.get('referer'));

    
});
//////////////////////////////////////







//////////UPLOAD FILE//////////

app.use('/sign-s3', function (req, res) {
  const s3 = new AWS.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];

  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if(err){
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`
    };
    res.write(JSON.stringify(returnData));
    res.end();
  });

});
//////////////////////////////////////







//////////SEND EMAIL FUNCTION//////////

app.use('/email', function (req, res) {

  //Variables pulled from form
  var recipient = req.body.to;
  var subject = req.body.subject;
  var context = req.body.context;

  let mailOptions = {
      from: 'testcloudwebsiteemail@gmail.com',
      to: recipient,
      subject: subject,
      text: context 
  };

  transporter.sendMail(mailOptions, function(err, data) {
      if(err){
          console.log("Error sending email: ", err);
      }
      else{
          console.log("Email Sent!!");
      }
  });
  
  res.redirect(req.get('referer'));

});
//////////////////////////////////////



  




app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

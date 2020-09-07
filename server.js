if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const path = require('path')

app.use(express.static(__dirname + '/public'));

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []



app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.locals.awards = require('./views/bulkupload/awards.json');
app.locals.errors = require('./views/bulkupload/errors.json');

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login',(req, res) => {
  res.render('loginfirstpage.ejs')
})

app.get('/loginfirstpage',(req, res) => {
  res.render('loginfirstpage.ejs')
})



app.post('/mysubsidyawards', (req, res) => {
  const { email_address , password} = req.body;
  let isEmailAndPasswordEmpty = false;
  let isPasswordEmpty = false;
  
  if(!email_address && !password ) 
  { 
    isEmailAndPasswordEmpty = true ;
  }

  else if (!email_address) {
    isEmailAndPasswordEmpty = true ;

  }
                 
  else if(!password ) 
  {
  isPasswordEmpty = true;
  }
       
  if (isEmailAndPasswordEmpty || isPasswordEmpty) 
  {
    
      res.render('loginfirstpage.ejs', {
       isEmailAndPasswordEmpty ,
       isPasswordEmpty,
       email_address : email_address,
       password
       } );
  } 
  // this is for password expiry page temporary
  else if (email_address =='jegan.maharajan@xyz.com') {
    let isEmailValid = true;
    res.render('loginresetpassword.ejs',{isEmailValid})


  }
  else { res.render('bulkupload/mysubsidyawards.ejs')}

  } );

  app.get('/bulkuploadsubsidy',(req, res) => {
    res.render('bulkupload/bulkuploadsubsidy.ejs')
  })
   


app.get('/loginforgetpassword',(req, res) => {

  let isEmailValid = true;
  res.render('loginforgetpassword.ejs',{isEmailValid})
});

app.get('/loginnewpassword',(req, res) => {
  res.render('loginnewpassword.ejs')
})

app.post('/loginemailconfirmation',(req, res) => {
  const { email_address } = req.body;
  let isEmailEmpty =  false;
  let validToken = '@';
  let isEmailValid = false;
  isEmailValid = email_address.includes(validToken)
  if (!email_address) { 
  
    isEmailEmpty = 'yes'
    res.render('loginforgetpassword.ejs', { isEmailEmpty})
   }

   
  else if (!isEmailValid) { 
   
    res.render('loginforgetpassword.ejs', { isEmailValid})
   }


  else { 
    console.log(email_address)
    let email_addresspass = email_address;
    app.locals.email_addresspass = email_address;
    
  res.render('loginemailconfirmation.ejs'),{email_addresspass} }
})



app.post('/loginpasswordcomplete',(req, res) => {

  const { password,password1 } = req.body;
  let isPasswordEmpty =  false;
  let isPasswordLengthLessThanTen =  false;
  let isBothPasswordNotMatching =false;
  
  passwordLength = password.length;
  
  if (!password || !password1) { 
    
    isPasswordEmpty = true
    res.render('loginnewpassword.ejs', { isPasswordEmpty})
   }

   else if(passwordLength < 10 ) {
    isPasswordLengthLessThanTen = true;
    res.render('loginnewpassword.ejs', { isPasswordLengthLessThanTen })
   }
    else if(password != password1 ) {
      isBothPasswordNotMatching = true;
      res.render('loginnewpassword.ejs', { isBothPasswordNotMatching })

   }


 else {

  res.render('loginpasswordcomplete.ejs') }
});


app.get('/loginpasswordcomplete',(req, res) => {
  res.render('loginpasswordcomplete.ejs')
})

app.get('/loginresetpassword',(req, res) => {
  let isEmailValid = true;
  res.render('loginresetpassword.ejs',{isEmailValid})
})





app.post('/loginresetpassword',(req, res) => {
  res.render('loginresetpassword.ejs')
})

app.get('/collectcheckbox',(req, res) => {

  const { Subsidy_awardNo } = req.body;

  let person = {
    subsidy: req.body.Subsidy_awardNo
    }

    console.log(Subsidy_awardNo);
 
  res.render('bulkupload/mysubsidyawards.ejs')
})

app.post('/cancelmysubsidy',(req, res) => {

  // const { Subsidy_awardNo } = req.body;

  // let person = {
  //   subsidy: req.body.Subsidy_awardNo
  //   }

  //   console.log(Subsidy_awardNo);

  console.log('cancle clicks')
 
  res.render('bulkupload/mysubsidyawards.ejs')
})



// app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/login',
//   failureFlash: true
// }))

// app.get('/register', (req, res) => {
//   res.render('register.ejs')
// })

// app.get('/register', checkNotAuthenticated, (req, res) => {
//   res.render('register.ejs')
// })

// app.post('/register', checkNotAuthenticated, async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10)
//     users.push({
//       id: Date.now().toString(),
//       name: req.body.name,
//       email: req.body.email,
//       password: hashedPassword
//     })
//     res.redirect('/login')
//   } catch {
//     res.redirect('/register')
//   }
// })

// app.delete('/logout', (req, res) => {
//   req.logOut()
//   res.redirect('/login')
// })

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   next()
// }


app.post('/loginemailconfirmationexpiry',(req, res) => {
  const { email_address } = req.body;
  let isEmailEmpty =  false;
  let validToken = '@';
  let isEmailValid = false;
  isEmailValid = email_address.includes(validToken)
  if (!email_address) { 
  
    isEmailEmpty = 'yes'
    res.render('loginresetpassword.ejs', { isEmailEmpty})
   }

   
  else if (!isEmailValid) { 
   
    res.render('loginresetpassword.ejs', { isEmailValid})
   }


  else { 
    console.log(email_address)
    let email_addresspass = email_address;
    app.locals.email_addresspass = email_address;
    
  res.render('loginemailconfirmationexpiry.ejs'),{email_addresspass} }
})

app.get('/mysubsidyawards',(req, res) => {
  
  res.render('bulkupload/mysubsidyawards.ejs')
})


//*****************************/
//bulkupload subsidy validations
//*****************************/


app.post('/formvalidation',(req, res) => {
  const { file_upload_1 } = req.body;
  
  console.log("test="+ file_upload_1 );
  let isFileUploadEmpty =  false;
  let isUploadSectionIsActive = true;

  if (!file_upload_1) { 
    isFileUploadEmpty  = true
    console.log("file not uploaded" );
   }

   let validCsvFormat = '.csv';
   let validExcelFormat = '.xlsx';
   let isCsvValid = false;
   let isExcelValid = false;
   let isNotCsvOrExcel = false;
   let isExcelFormat = false;
   let isCsvFormat = false;
   isCsvValid = file_upload_1.includes(validCsvFormat)
   isExcelValid  =  file_upload_1.includes(validExcelFormat)

   if (isCsvValid || isExcelValid ) { isNotCsvOrExcel = false; }
   else {  isNotCsvOrExcel = true }

   if (isExcelValid) {  isExcelFormat = true}
   else { isExcelFormat = false}

   if (isCsvValid) {  isCsvFormat = true}
   else { isCsvFormat = false}

  console.log("isUploadSectionIsActive :" + isUploadSectionIsActive );
  res.render('bulkupload/bulkuploadsubsidy',{isUploadSectionIsActive,isFileUploadEmpty,isNotCsvOrExcel,isExcelFormat,isCsvFormat })
})

//*****************************/
//Add subsidy awards validations
//*****************************/

app.locals.Subsidy_Control_Number_Global;
app.locals.Subsidy_Measure_Title_Global;
app.locals.Subsidy_Objective_Global;
app.locals.Subsidy_Instrument_Global;
app.locals.Subsidy_Element_Full_Amount_Global;
app.locals.National_ID_Type_Global;
app.locals.National_ID_Number_Global;
app.locals.Beneficiary_Name_Global;
app.locals.Size_of_the_Organisation_Global;
app.locals.Granting_Authority_Name_Global;
app.locals.Legal_Granting_Date_Day_Global;
app.locals.Legal_Granting_Date_Month_Global;
app.locals.Legal_Granting_Date_Year_Global;
app.locals.Goods_or_Services_Global;
app.locals.Spending_Region_Global;

app.get('/addsubsidyawards',(req, res) => {

  res.render('bulkupload/addsubsidyawards.ejs')
})

// ******************************************
// From Review page to corresponding route page
// ******************************************

app.get('/addsubsidyawardsreview',(req, res) => {

 
  console.log("subsiy details:" + Subsidy_Control_Number_Global);
  res.render('bulkupload/addsubsidyawards.ejs',{ 
  Subsidy_Control_Number_Global,
  Subsidy_Measure_Title_Global,
  Subsidy_Objective_Global,
  Subsidy_Instrument_Global,
  Subsidy_Element_Full_Amount_Global
 })
})

app.get('/beneficiarydetailsreview',(req, res) => {

  res.render('bulkupload/beneficiarydetails.ejs',{ 
    National_ID_Type_Global,
    National_ID_Number_Global,
    Beneficiary_Name_Global,
    Size_of_the_Organisation_Global,
 })
})
 

app.get('/grantingdetailsreview',(req, res) => {

  res.render('bulkupload/grantingdetails.ejs',{
   Granting_Authority_Name_Global,
   Legal_Granting_Date_Day_Global,
   Legal_Granting_Date_Month_Global,
   Legal_Granting_Date_Year_Global,
   Goods_or_Services_Global,
   Spending_Region_Global
 
  });
 });

// ******************************************
// add subsidy award routes
// ******************************************

app.post('/addsubsidyawards',(req, res) => {
  res.render('bulkupload/addsubsidyawards.ejs')
})
 

app.post('/beneficiarydetails',(req, res) => {

   const { 
    Subsidy_Control_Number,
    Subsidy_Measure_Title,
    Subsidy_Objective,
    Subsidy_Instrument,
    Subsidy_Element_Full_Amount } = req.body;

    Subsidy_Control_Number_Global= Subsidy_Control_Number;
    Subsidy_Measure_Title_Global = Subsidy_Measure_Title;
    Subsidy_Objective_Global = Subsidy_Objective;
    Subsidy_Instrument_Global= Subsidy_Instrument;
    Subsidy_Element_Full_Amount_Global = Subsidy_Element_Full_Amount;

   console.log("subctlno:"+ Subsidy_Control_Number);
   console.log('beneficiary clicks');
 
  res.render('bulkupload/beneficiarydetails.ejs');
});

app.post('/grantingdetails',(req, res) => {

   const { 
    National_ID_Type,
    National_ID_Number,
    Beneficiary_Name,
    Size_of_the_Organisation } = req.body;

    National_ID_Type_Global = National_ID_Type;
    National_ID_Number_Global = National_ID_Number;
    Beneficiary_Name_Global = Beneficiary_Name;
    Size_of_the_Organisation_Global = Size_of_the_Organisation;
  res.render('bulkupload/grantingdetails.ejs');
});


app.post('/reviewdetails',(req, res) => {

  const { 
    Granting_Authority_Name,
    Legal_Granting_Date_Day,
    Legal_Granting_Date_Month,
    Legal_Granting_Date_Year,
    Goods_or_Services,
    Spending_Region,
     } = req.body;

    Granting_Authority_Name_Global = Granting_Authority_Name;
    Legal_Granting_Date_Day_Global = Legal_Granting_Date_Day;
    Legal_Granting_Date_Month_Global = Legal_Granting_Date_Month;
    Legal_Granting_Date_Year_Global = Legal_Granting_Date_Year;
    Goods_or_Services_Global = Goods_or_Services;
    Spending_Region_Global = Spending_Region;
    console.log("reviw :" + Subsidy_Control_Number_Global );

  res.render('bulkupload/reviewdetails.ejs',{
  Subsidy_Control_Number_Global  ,
  Subsidy_Measure_Title_Global ,
  Subsidy_Objective_Global ,
  Subsidy_Instrument_Global ,
  Subsidy_Element_Full_Amount_Global ,
  National_ID_Type_Global ,
  National_ID_Number_Global ,
  Beneficiary_Name_Global ,
  Size_of_the_Organisation_Global ,
  Granting_Authority_Name_Global ,
  Legal_Granting_Date_Day_Global ,
  Legal_Granting_Date_Month_Global ,
  Legal_Granting_Date_Year_Global ,
  Goods_or_Services_Global ,
  Spending_Region_Global }
  );
});


app.listen(3000)

  // let person = {
  //   subsidy: req.body.Subsidy_awardNo
  //   }

  //   console.log(Subsidy_awardNo);

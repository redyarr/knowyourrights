const Lawyers  = require("../models/Lawyers");


exports.getAllLawyers = (req ,res)  => {
    Lawyers.findAll()
   .then((lawyers) => {
    res.render('lawyer/lawyers',{lawyers});
   })
   .catch((err) => {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving lawyers' });
   });

}






exports.getLawyerform = (req, res) => { 
    res.render('lawyer/signUp');
}


exports.addLawyer = (req,res)=>{

const name = req.body.name;
const email = req.body.email;
const password = req.body.password;
const law_firm = req.body.law_firm;
const specialization = req.body.specialization;
const license_number = req.body.license_number;
const contact_number = req.body.contact_number;
const city = req.body.city;
const country = req.body.country;

Lawyers.create({ name, email, password, law_firm, specialization, license_number, contact_number, city, country }).
then((result) => {
    console.log(result);
 console.log("success"); 
    res.redirect('/lawyer/lawyerForm');
}).catch((err) => {
    console.log(err);

});

}
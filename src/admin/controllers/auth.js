const Admin=require("../models/authModel");
const bcrypt = require('bcrypt');
const jwt=require("jsonwebtoken")

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  
  // ==========Validation ==========
  if(!name){
    return res.status(400).json({ message: 'Provide Name' });
  }
  if(!email){
    return res.status(400).json({ message: 'Provide email' });
  }

  if(!password){
    return res.status(400).json({ message: 'Provide password' });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ message: 'Pls Provide Strong Password' });
  }
  
  
  try {

    // email already exists
    let existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);
    let admin = new Admin({ name, email, password: hashedPassword });
    const createdAdmin=await admin.save();

    res.status(201).send({ message: 'Signup successful',createdAdmin });
  } catch (err) {
    console.error(err.message);
    console.log(err);
    res.status(500).send('Server Error');
  }
};



//============Login======================= 

const login= async(req,res)=>{
    try{
        const data=req.body;

        const{email,password}=data
        if(!email){
         return res.status(400).json({ message: 'Provide email' });
       }
     
       if(!password){
         return res.status(400).json({ message: 'Provide password' });
       }

       
       const existAdmin = await Admin.findOne({ email });

    if (!existAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    
    const isPasswordValid = await bcrypt.compare(password, existAdmin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    
    const token = jwt.sign({ AdminId: existAdmin._id }, 'yourSecretKey', {
      expiresIn: '2d', 
   });
   res.setHeader('Authorization', `${token}`);
   res.status(200).send({message:"Login  successfully", AdminDetails: {
      _id: existAdmin._id,
      name: existAdmin.name,
      email: existAdmin.email,
      password: existAdmin.password,
    },});
      
    }
    catch (error) {
        console.log(error); 
        res.status(500).send({message:"Internal server Error",error})
     }
}


//=================logout ======================

const logout = async (req, res) => {
  try {
      // Destroy the token in the session
      req.session.destroy((err) => {
          if (err) {
              console.error('Error destroying session:', err);
              return res.status(500).json({ message: 'Error logging out' });
          }
          res.status(200).json({ message: 'Logout successful' });
      });
  } catch (error) {
      console.error('Logout Error:', error);
      res.status(500).json({ message: 'Error logging out' });
  }
}

module.exports={signup,login,logout}


  
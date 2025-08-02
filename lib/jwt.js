import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt.js';
const bcrypt=require('bcryptjs')
const JWT_SECRET=process.env.JWT_SECRET;
const JWT_EXPIRES_IN= '5m'

export const hashedpassword= async(password)=>{
    return await bcrypt.hash(password,15);
}

export const comparepassword= async(password,hashedpassword)=>{
    return await bcrypt.compare(password,hashedpassword);

}

export const generateToken=(user)=>{
    return jwt.sign({
        userid:user.id,
        username:user.username,
        role:user.role
    },JWT_SECRET,{expiresIn:JWT_EXPIRES_IN}
);
}


export const verifyToken=(token)=>{
    try{
        return jwt.verify(token,JWT_SECRET);

    }catch(error){
        return null;
    }
}
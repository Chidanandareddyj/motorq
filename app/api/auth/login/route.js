import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { comparepassword, generateToken } from "../../../../lib/jwt";
export async function POST(req) {
    try{
        const body=await req.json();
        const {username,password}=body;

        if(!username || !password) return NextResponse.json({error:"required fields"},{status:400});
        
        const {data:user,error}=await supabase.from('users').select('*').eq('username',username).single()
        if(error || !user){
            return NextResponse.json({error:"invalid credentials"},{status:401});
        }
        const verifypassword=await comparepassword(password,user.password);
        if(!verifypassword){
            return NextResponse.json({error:"invalid credentials"},{status:401});
        }
        const token=generateToken({
            id:user.id,
            username:user.username,
            role:user.role
        })



        return NextResponse.json({
            message:'Login is successful', token,user:{
                id:user.id,
                username:user.username,
                role:user.role
            }
        })
    }catch(error){
        return NextResponse.json({error:'server error'},{status:500})
    }
}
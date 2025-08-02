import { supabase } from "@/lib/supabaseClient";
import { hashedpassword } from "./jwt";

export const seeduser=async()=>{
    try{
        const {data:existing,error:checkError}=await supabase.from('users').select('id').limit(1);

        const adminpassword=await hashedpassword('admin')
        const operatorpassword=await hashedpassword('operator')

        const {error:inserError}=await supabase.from('users').insert([
            {
                username:'admin',
                password: adminpassword,
                role:'admin'
            },
            {
                username:'operator',
                password: operatorpassword,
                role:'operator'
            },

        ])

    }catch(error){}
}
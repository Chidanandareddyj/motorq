import { NextResponse } from "next/server";
import { authenticate } from "../../../../lib/middleware";

export const GET = authenticate(async (req) => {
    return NextResponse.json({
        message: 'Token is valid',
        user: {
            id: req.user.userid,
            username:req.user.username,
            role:req.user.role
        }
    })
})

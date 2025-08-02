import { NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export const authenticate = (handler) => {
  return async (req) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    req.user = payload;
    return handler(req);
  };
};



export const authorization = (roles) => {
  return (handler) => {
    return async (req) => {
      if (!req.user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
      if (!roles.includes(req.user.role)) {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
      }
      return handler(req);
    };
  };
};

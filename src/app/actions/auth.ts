"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const AUTH_FILE_PATH = path.join(process.cwd(), ".dashboard_auth");
const SESSION_SECRET = process.env.SESSION_SECRET || "";

export async function checkIsSetup() {
  return fs.existsSync(AUTH_FILE_PATH);
}

export async function createPasswordAction(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  
  if (!password || password.length < 4) {
    return { error: "Password must be at least 4 characters long." };
  }

  if (fs.existsSync(AUTH_FILE_PATH)) {
    return { error: "Password is already set up." };
  }

  // Hash the password with the session secret as a pepper
  const hashedPassword = crypto.createHash("sha256").update(password + SESSION_SECRET).digest("hex");
  
  // Save the password to the local file
  fs.writeFileSync(AUTH_FILE_PATH, hashedPassword, "utf-8");

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_session", SESSION_SECRET, {
    httpOnly: true,
    secure: false, // Set to false to allow auth over local network HTTP
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365, // 365 days
    path: "/",
  });

  redirect("/");
}

export async function loginAction(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;

  if (!fs.existsSync(AUTH_FILE_PATH)) {
    return { error: "Dashboard is not set up yet." };
  }

  const savedPassword = fs.readFileSync(AUTH_FILE_PATH, "utf-8").trim();
  const hashedInputPassword = crypto.createHash("sha256").update(password + SESSION_SECRET).digest("hex");

  if (hashedInputPassword === savedPassword) {
    const cookieStore = await cookies();
    cookieStore.set("auth_session", SESSION_SECRET, {
      httpOnly: true,
      secure: false, // Set to false to allow auth over local network HTTP
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 365, // 365 days
      path: "/",
    });

    redirect("/");
  } else {
    return { error: "Incorrect password." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  redirect("/login");
}


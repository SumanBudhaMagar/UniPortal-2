"use client"

import { signIn, signOut } from "next-auth/react"
export const GoogleLogin = async () => {
    await signIn("google", {redirect : true, callbackUrl : "/dashboard"})
}
export const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
}
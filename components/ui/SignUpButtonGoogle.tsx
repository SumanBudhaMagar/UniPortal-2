"use client"
import React from 'react'
import { GoogleLogin } from '@/lib/auth'

const SignUpButtonGoogle = () => {
  return (
    <button
      onClick={() => GoogleLogin()}
      style={{cursor : "pointer"}}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
    >
      <i className="fa-brands fa-google" style={{fontSize : 30}} aria-hidden></i>
      Agree & Sign up with Google
    </button>
  )
}
const LoginButtonGoogle = () => {
  return (
    <button
      onClick={() => GoogleLogin()}
      style={{cursor : "pointer"}}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
    >
      <i className="fa-brands fa-google" style={{fontSize : 30}} aria-hidden></i>
      or,Login with Google
    </button>
  )
}
export {SignUpButtonGoogle, LoginButtonGoogle}

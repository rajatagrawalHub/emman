import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import '../App.css'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) =>{
    e.preventDefault()
  }

  return (
    <div id='container' className='flex column'>
        <Navbar />
        <div id="login" className='section flex column fb1 center'>
          <div className="borderBox flex column centerb gap-12">
            <div className="sectionHeading">Login</div>
            <div className="vInputBox flex column">
              <p className="inputLabel">Username or Email</p>
              <input type="text" placeholder='Enter Username or Email' />
            </div>
            <div className="vInputBox flex column gap-12">
              <p className="inputLabel">Password</p>
              <div className="flex row">
                <input type={showPassword ? "text" : "password"} placeholder='Enter Password' />
                <button className='btn whiteBtn  fitContent'
                  onClick={()=>setShowPassword(!showPassword)}
                >{showPassword ? "H" : "S"}</button>
              </div>
            </div>
            <button className='btn transparentBtn' onClick={(e)=>handleLogin(e)}>Login</button>
          </div>
        </div>
    </div>
  )
}

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import '../App.css'

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSignup = (e) =>{
    e.preventDefault()
  }

  return (
    <div id='container' className='flex column'>
        <Navbar />
        <div id="signup" className='section flex column fb1 center'>
          <div className="borderBox flex column centerb gap-12">
            <div className="sectionHeading">Signup</div>
            <div className="vInputBox flex column">
              <p className="inputLabel">Username</p>
              <input type="text" placeholder='Enter Username' />
            </div>
            <div className="vInputBox flex column">
              <p className="inputLabel">Email</p>
              <input type="text" placeholder='Enter Email' />
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
            <div className="vInputBox flex column gap-12">
              <p className="inputLabel"> Confirm Password</p>
              <input type="password" placeholder='Re-enter Password' />
            </div>
            <button className='btn transparentBtn' onClick={(e)=>handleSignup(e)}>Signup</button>
          </div>
        </div>
    </div>
  )
}

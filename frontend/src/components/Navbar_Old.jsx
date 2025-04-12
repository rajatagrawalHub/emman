import React, { useContext, useEffect, useState } from 'react'
import {UserContext} from '../context/userContext'

export default function Navbar() {
  const {user} = useContext(UserContext)
  const [navOptions, setNavOptions] = useState([]) 

  useEffect (()=>{
        if(user){
            (user.role === "Admin") ? setNavOptions(process.env.REACT_APP_ADMIN) : (user.role === "Moderator") ? setNavOptions(process.env.REACT_APP_MODERATOR) : (user.role === "Requestor") ? setNavOptions(process.env.REACT_APP_REQUESTOR) : setNavOptions(process.env.REACT_APP_SUPERADMIN) 
        }
  },[])
  
  return (
    <div id='navbar' className='flex row spacebetween'>
        <div className="logoTxt">UrEvent</div>
        <div id="navMenu" className='flex row'>
            {navOptions.map((i)=>(
                <p className="navMenuItem">{i}</p>
            ))}
        </div>
    </div>
  )
}

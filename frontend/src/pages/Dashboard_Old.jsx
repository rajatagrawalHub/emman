import React, { useContext } from 'react'
import {UserContext} from '../context/userContext'
import Login from './Login';

export default function Dashboard() {
  const {user} = useContext(UserContext);
  if(user){
    return(
        <p>"Dashbaord"</p>
    )
  }else{
    return(
        <Login />
    )
  }

}

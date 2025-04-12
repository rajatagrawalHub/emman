import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [token,setToken] = useState(()=>{return localStorage.getItem("token") || ""});
  const [user, setUser] = useState(null);

  useEffect(()=>{
    if(token !== ""){
      setUser(jwtDecode(token));
      localStorage.setItem("token", token);
    }else{
      setUser(null);
    }
  },[token]);

  return (
    <UserContext.Provider value={{user, setToken}}>
      {children}
    </UserContext.Provider>
  );

};


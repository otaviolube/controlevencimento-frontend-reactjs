import React from "react";
import api from "../services/ApiService";

import jwt_decode from "jwt-decode";

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();
var UserDataContext = React.createContext({});

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true};
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    case "LOGIN_FAILURE":
      return { ...state, isAuthenticated: false };
    case "TOKEN_EXPIRED":
      return { ...state, isAuthenticated: false };
    case "TOKEN_NOT_FOUND":
      return { ...state, isAuthenticated: false };
    case "FORGET_PASSWORD_SUCCESS":
      return { ...state, isAuthenticated: false };
    case "FORGET_PASSWORD_FAIL":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {

  const [user, setUser] = React.useState();
  const [token, setToken] = React.useState(null);

  const [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("@compet-expiration-control")
  });

  // setToken(localStorage.getItem("@compet-expiration-control"));

  React.useEffect(() => {
    setToken(localStorage.getItem("@compet-expiration-control"));
    if(token){
      const user = jwt_decode(token);
      if(user){
        setUser(user);
      }
    }
  }, [token]);

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        <UserDataContext.Provider value={{user}}>
          {children}
        </UserDataContext.Provider>
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserData() {
  var context = React.useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

function verifyToken(dispatch, history){
  //Depois posso melhorar a lógica desta função, verificando também no banco de dados
  if (localStorage.getItem("@compet-expiration-control")) {
    const jwt_Token_decoded = jwt_decode(localStorage.getItem("@compet-expiration-control"));
    // console.log("Token", jwt_Token_decoded.exp);
    // console.log("Agora", Date.now());
    // console.log("Resultado", jwt_Token_decoded.exp * 100 < Date.now())
    if (jwt_Token_decoded.exp * 1000 < Date.now()) {
      localStorage.clear();
      dispatch({ type: "TOKEN_EXPIRED" });
      history.push("/login");
    } 
  }else{
    dispatch({ type: "TOKEN_NOT_FOUND" });
    history.push("/login");
  }
}

async function loginUser(dispatch, login, password, history, setIsLoading, setError, setPasswordForget) {
  
  setError(null);
  setIsLoading(true);
  setPasswordForget(false);

  if (!!login && !!password) {
    try {
      const successLogin = await api.post('/login', { login, password });
      localStorage.setItem('@compet-expiration-control', successLogin.data.token);
      // console.log(jwt_decode(successLogin.data.token));
      setError(null);
      setIsLoading(false);
      dispatch({ type: 'LOGIN_SUCCESS' });
      history.push('/app/dashboard');
    } catch (error) {
      console.log("Log In", error.message)
      setError(true);
      setIsLoading(false);
      // dispatch({ type: "LOGIN_FAILURE" });
    }
  } else {
    setError(true);
    setIsLoading(false);
    dispatch({ type: "LOGIN_FAILURE" });
  }
}

async function signOut(dispatch, history) {
  try {
    await api.get('/logout');
    localStorage.removeItem("@compet-expiration-control");
    dispatch({ type: "SIGN_OUT_SUCCESS" });
    history.push("/login");
  } catch (error) {
    console.log("Sign Out", error.message);
    localStorage.removeItem("@compet-expiration-control");
    dispatch({ type: "SIGN_OUT_SUCCESS" });
    history.push("/login");
  }
}

async function forgetPassword(dispatch, email, history, setError, setPasswordForget, setOpen, setForgetLoading, setErrorForgetPassword){
  
  setErrorForgetPassword(false);
  setError(null);
  setForgetLoading(true);
  setPasswordForget(false); 
  
  try{
    if(!!email){
      const forgetPasswordResponse = await api.post('/forget_password', { email });
      console.log(forgetPasswordResponse)
      if(forgetPasswordResponse){
        setPasswordForget(true); 
        setForgetLoading(false);
        setErrorForgetPassword(false);
        setOpen(false);
      }else{
        setPasswordForget(false); 
        setForgetLoading(false);
        setErrorForgetPassword(true);
        setOpen(true);
      }
    }else{
      //Mensagem de erro para o usuário na validação do formulário
    } 
  }catch(error){
    setPasswordForget(false); 
    setForgetLoading(true);
    setOpen(true);
    setErrorForgetPassword(true);
    console.log("Forget Password", error.message);
  }
}

async function resetPassword(dispatch, newpassword, user, token, history, setResetPassword, setError, setResetPasswordLoading){
  setError(null);
  setResetPassword(false);
  setResetPasswordLoading(true);

  try{
    if(!!newpassword && !!user && !! token){
      const resetPasswordResponse = await api.post('/reset_password', { newpassword, user, token });
      console.log(resetPasswordResponse);
      if(resetPasswordResponse){
        setResetPassword(true);
        setError(null);
        setTimeout(() => {
          history.push('/login');
        }, 3000);
      }else{
        setResetPassword(false);
        setError(true);
      }
    }else{
      setResetPassword(false);
      setError(true);
    }
  }catch(error){
    console.log(error.message);
    setResetPassword(false);
      setError(true);
  }
}

export { UserProvider, useUserState, useUserDispatch, useUserData, loginUser, signOut, forgetPassword, resetPassword, verifyToken };
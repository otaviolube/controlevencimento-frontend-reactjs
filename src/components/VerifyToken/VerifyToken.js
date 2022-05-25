import React, { useEffect } from "react";

import { useUserDispatch, verifyToken } from "../../context/UserContext";

export default function VerifyToken(props){

    const userDispatch = useUserDispatch();

    useEffect(() => {
        verifyToken(userDispatch, props.history);
      }, [userDispatch, props.history]);

    return (
        <></>
    )
}
import React, { createContext, useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';


export const MyContext = createContext({});

export default function ContextProvider({children}){

    const [userDetails, setUserDetails] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // AsyncStorage.clear();
    useEffect(() => {
        AsyncStorage.getItem("userDetails").then((res) => {
            if (res !== null){
                setUserDetails(res)
                setIsUserLoggedIn(true);
            }
        })
    }, [])

    return(
        <MyContext.Provider value={{userDetails, setUserDetails,isUserLoggedIn, setIsUserLoggedIn }}>
            {children}
        </MyContext.Provider>
    )
}
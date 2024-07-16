import React, { useEffect, useRef, useState } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import {AppRegistry} from 'react-native';
import { ThemeProvider } from "react-native-rapi-ui";
import { ShakeEventExpo } from "./src/components/DeviceShake";
import { Button, Paragraph, Dialog, Portal, Provider } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { api } from "./src/configs/Api";
import { useNavigation } from "@react-navigation/native";
import Login from "./src/screens/Login";
import ContextProvider from "./src/context/ContextProvider";

import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Alert
} from "react-native";

export default function App() {

  const [visible,set_visible] = useState(false)
  const [is_device_shaked,set_is_device_shaked] = useState(false)
  const _showDialog = () => {
    set_visible(true)
  }
  // const _navigation = useNavigation()
  const [timerCount, setTimer] = useState(10);
  const [intervalId, setintervalId] = useState([]);
  

  const UnsubscribeEvent = async (interval) => {

    const value = await AsyncStorage.getItem('UserData')
    const ValueInJson = JSON.parse(value)
    if(ValueInJson !== null) {
      
      var _location  = await Location.getCurrentPositionAsync();
      const body = {
        id: ValueInJson.id,
        livelocation:{
          lat: _location.coords.latitude,
          lng: _location.coords.longitude
        }
      }
      const response = await fetch(`${api}/emergency`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
      })
      const responseInJson = await response.json()

      set_visible(false)
      set_is_device_shaked(false)
      setTimer(10)
      for(var i=0; i<intervalId.length; i++)
      {
        clearInterval(intervalId[i])
      }
      setintervalId([])
    }
  } 

  const getAppStatus = async () => {
    const value = await AsyncStorage.getItem('AppStarted')
    const ValueInJson = JSON.parse(value)
    if(ValueInJson !== null) {
      return ValueInJson.isAppStarted
    }
    else
    {
      return false
    }
  }
  
  const _hideDialog = () => {
    
    set_is_device_shaked(false)
    setTimer(10)
    for(var i=0; i<intervalId.length; i++)
    {
      clearInterval(intervalId[i])
    }
    setintervalId([])
    set_visible(false)
  }

  const fonts = {
    otherFont1: require("./src/font/UbuntuRegular.ttf"),
  };

  return (
    <ContextProvider>
    <ThemeProvider fonts={fonts}>
      <Provider>
        <AppNavigator />
        <Portal>
          <Dialog
              visible={visible}
              onDismiss={_hideDialog}>
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Sending notification in {timerCount}. Press cancel if this was a mistake</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={_hideDialog}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Provider>
    </ThemeProvider>
    </ContextProvider>
  );
}

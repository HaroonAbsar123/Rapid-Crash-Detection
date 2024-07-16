import React, { useState, useEffect, useRef } from "react";
import { View, Linking, Switch, StyleSheet, Dimensions, ScrollView } from "react-native";
import { TouchableOpacity } from 'react-native';
import {
  Layout,
  Button,
  Text,
  Section,
  SectionContent,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { Portal,Dialog,Paragraph  } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import { AnimatedRegion } from "react-native-maps";
import { Platform } from "react-native-web";
import haversine from "haversine";
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getDistanceFromLatLonInKm } from "../components/DistanceFunction"
import { ShakeEventExpo } from "../components/DeviceShake";
import { api } from "../configs/Api";

const hospitalList = [
  
  {
    name:'Central Hospital',
    phone:'(051) 9290301',
    lat:'',
    lng:''
  },
  {
    name:'Rawalpindi Medicare Hospital',
    phone:'(051) 4576355',
    lat:'',
    lng:''
  },
  {
    name:'Abdul Sattar Family Hospital',
    phone:'0336 7935511',
    lat:'',
    lng:''
  },
  {
    name:'Modern Health Care Hospital',
    phone:'0333 5568311',
    lat:'',
    lng:''
  }
]


export default function ({ navigation }) {
  console.log("HOME SCREEN")
  const [IsAppStarted, setIsAppStarted] = useState(false);
  const [buttontext, setbuttontext] = useState("Start App");
  const [riderequest_heading, setriderequest_heading] = useState("");
  const [riderequest_text, setriderequest_text] = useState("");
  const [visible_riderequest, setvisible_riderequest] = useState(false);
  const showrequestDialog = () => setvisible_riderequest(true);
  const hiderequestDialog = () => setvisible_riderequest(false);
  const { isDarkmode, setTheme } = useTheme();
  const [ UserData, setuserData ] = useState();
  const [ username, setusername ] = useState("");
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const [visible_hospital, setvisible_hospital] = useState(false);
  const showhospitalDialog = () => setvisible_hospital(true);
  const hidehospitalDialog = () => setvisible_hospital(false);

  const [list_of_hospitals,set_list_of_hospitals] = useState(hospitalList)
  
  const [visible,set_visible] = useState(false)
  const [is_device_shaked,set_is_device_shaked] = useState(false)

  const OpenTelePhone = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  
  const getAllSavedHospitals = async () =>{
      console.log("Called: ")
      const value = await AsyncStorage.getItem('userDetails')
      const ValueInJson = JSON.parse(value)
      if(ValueInJson !== null) {
          const body = {
              id: ValueInJson.userId
          }
          console.log("body: ",body)
          const response = await fetch(`${api}/getallhospitals`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(body)
          })
          const responseInJson = await response.json()
          if(responseInJson?.error)
          {
              alert("Some Issue Occured, Try again")
          }
          else
          {
              console.log("responseInJson?.data?.userdata: ",responseInJson)
              set_list_of_hospitals(responseInJson.data.userdata)
          }
          console.log("responseInJson: ",responseInJson)
      }
  }

  const ShowAllNearestHospitals = () =>{
    getAllSavedHospitals()
    showhospitalDialog()
  }

  const toggleSwitch = () => {
    startchecking()
    setIsEnabled((previousState) => !previousState);
  };
  
  let location_val;
  // (async () => {
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
  // })();
  useEffect(() => {
    async function getUserData() {
      try{
        const value = await AsyncStorage.getItem('userDetails')
        const ValueInJson = JSON.parse(value)
        if(ValueInJson !== null) {
          setuserData(ValueInJson)
          setusername(ValueInJson.username)
        }
        
        ShakeEventExpo.addListener(async () => {
          const AppStatus = await getAppStatus()
          if(AppStatus)
          {
            if(is_device_shaked == false)
            {
              set_is_device_shaked(is_device_shaked => (!is_device_shaked))
              // _showDialog()
              navigation.navigate("AlertScreen")
              
            }  
          }
        });

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

      
        location_val = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update location every 5 seconds
            distanceInterval: 10, // Update location when the user moves 10 meters
          },
          (newLocation) => setLocation(newLocation)
        );
      }
      catch(err)
      {
        console.log(err)
      }
    }
    getUserData()
    // Request permission to access the device's location
    return () => {
      // Stop listening for location updates when the component is unmounted
      if (location_val) {
        location_val.remove();
      }
    };
  }, []);
  
  const startchecking = async () => {
    console.log("IsAppStarted: ",IsAppStarted)
    if(IsAppStarted)
    {
      setbuttontext("Start App")
      setIsAppStarted(false)
      await AsyncStorage.setItem('AppStarted',JSON.stringify({isAppStarted:false}))
    }
    else
    {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted')
      {
        setbuttontext("App Started")
        setIsAppStarted(true)
        await AsyncStorage.setItem('AppStarted',JSON.stringify({isAppStarted:true}))
      }
      else
      {
        setriderequest_heading("LOCATION NEEDED")
        setriderequest_text("To get nearby drivers please enable location permission. Go to application setting to enable location.")
        showrequestDialog()
      }
    }
  }

  const open_phone_setting = async () =>{
    Linking.openSettings();
  }


  return (
  
    <>
      {location ? (
          <View style={styles.container}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="My Location"
                />
              )}

            
            </MapView>
            <View style={[styles.overlayTop,{
              backgroundColor : isDarkmode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }]}>
                <Text
                  style={{
                    color: isDarkmode ? themeColor.white : themeColor.black,
                    fontSize: 20,
                    letterSpacing:0,
                    fontWeight:'700'
                  }}
                >
                  {`Hi, ${username}\nHope you are having an awesome day.`}
                </Text>
            </View>
            <View style={[styles.overlay,{
              backgroundColor : isDarkmode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }]}>
              <View
                style={{
                  backgroundColor:'rgba(0,0,0,0.4)',
                  width:'100%',
                  borderRadius:20,
                  display:'flex',
                  flexDirection:'row',
                  padding:20
                }}
              >
                <Text style={styles.overlayText}>
                  {location
                    ? `Start Monitoring?`
                    : 'Loading...'}
                </Text>
                <Switch
                  style={styles.switch}
                  trackColor={{ false: "#767577", true: "#FFFFFF" }}
                  thumbColor={isEnabled ? "#81b0ff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View>
            </View>
            <View style={[styles.overlayBottom,{
              backgroundColor : isDarkmode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
            }]}>
              <View
                style={{
                  width:'100%',
                  borderRadius:20,
                  display:'flex',
                  flexDirection:'row'
                }}
              >
                
                <TouchableOpacity
                  style={{
                    backgroundColor:themeColor.white,
                    borderColor:themeColor.danger,
                    borderWidth:1,
                    marginLeft:'auto',
                    marginRight:'auto',
                    padding:10,
                    borderRadius:20
                  }}
                  onPress={()=>{
                    var apikey = ``
                    var api_to_call=
                    ShowAllNearestHospitals()
                  }}
                >
                  <MaterialCommunityIcons color={themeColor.danger} name="hospital-box" size={22} />
                </TouchableOpacity>
                
              </View>
            </View>
        </View>
      ):(
        <View style={styles.container}>
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                {'Loading...'}
              </Text>
            </View>
        </View>
      )}
      
      <Portal>
        <Dialog style={{borderRadius:10,paddingBottom:20}} visible={visible_riderequest} onDismiss={hiderequestDialog}>
        <Dialog.Title>
          {riderequest_heading}
        </Dialog.Title>
        <Dialog.Content>
            <Paragraph style={{fontSize:15}}>{riderequest_text}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
            {/* <Button  theme={{colors: {primary: colors.primary, underlineColor: 'transparent'}}}
                style={{backgroundColor:colors.white,marginRight:'auto',marginLeft:'auto',width:'40%',borderWidth:1,borderColor:colors.primary}} onPress={hiderequestDialog}>No</Button> */}
            {/* <Button  theme={{colors: {primary: themeColor.primary, underlineColor: 'transparent'}}}
                style={{marginLeft:'auto',width:'50%'}} onPress={()=>{open_phone_setting()}}>GO TO SETTING</Button> */}
                <TouchableOpacity
                  onPress={open_phone_setting}
                  style={{
                    backgroundColor:themeColor.primary,
                    width:'auto',
                    padding:10,
                    marginLeft:'auto',
                    marginRight:'auto',
                    borderRadius:10
                    
                  }}
                  >
                  <Text
                    style={{
                      color:themeColor.white
                    }}
                  >
                    {"GO TO SETTING"}
                  </Text>
                </TouchableOpacity>
        </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* All Hospital List Dialog */}
      <Portal>
        <Dialog style={{borderRadius:10,paddingBottom:20}} visible={visible_hospital} onDismiss={hidehospitalDialog}>
          <Dialog.Title>
            {"Near Hospitals"}
          </Dialog.Title>
          <Dialog.ScrollArea>
            <View
              style={{
                marginTop:20,
                marginBottom:20
              }}
            >
              <ScrollView>
                {list_of_hospitals.map((val,index)=>(
                  <View style={styles.HospitalView} key={index}>
                    <Text 
                      style={{
                        color: themeColor.white
                      }}
                    >
                      {val.name}
                    </Text>
                    <TouchableOpacity onPress={()=>{OpenTelePhone(val.phone)}} style={{marginLeft:'auto'}}>
                      <MaterialCommunityIcons color={themeColor.white} name="phone" size={22} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Dialog.ScrollArea>
          
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlayTop: {
    position: 'absolute',
    top: 20,
    width:'100%',
    padding: 20,
    display:'flex',
    flexDirection:'row'
  },
  overlay: {
    position: 'absolute',
    bottom: 64,
    width:'100%',
    padding: 10,
    display:'flex',
    flexDirection:'row'
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    width:'100%',
    padding: 10,
    display:'flex',
    flexDirection:'row'
  },
  overlayText: {
    fontSize: 20,
    fontWeight: 'semibold',
    marginTop:'auto',
    marginBottom:'auto',
    color:'#ffffff',
    marginLeft:20
  },
  switch: {
    marginTop:'auto',
    marginBottom:'auto',
    marginLeft:'auto',
    marginRight:20
  },
  HospitalView:{
    display:'flex',
    flexDirection:'row',
    padding:10,
    borderWidth:1,
    borderColor:themeColor.primary,
    marginBottom:10,
    borderRadius:20,
    width:'100%'
  }
});

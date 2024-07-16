import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Layout, Text, useTheme, Button, themeColor } from 'react-native-rapi-ui';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { api } from '../configs/Api';


export default function ({ navigation }) {
	const { isDarkmode, setTheme } = useTheme();
    const [isPlaying, setIsPlaying] = useState(true)
    const [durationtime, setdurationtime] = useState(10)
    
    const callAlert = async () =>{
        console.log("Called: ")
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
            setIsPlaying(false)
        }
    }
    useEffect(() => {


    }, []);
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
                    marginLeft:15,
                    marginRight:15,
                    marginTop:'25%'
				}}
			>
                <Text
                    style={{
                        fontSize:25,
                        fontWeight:'bold',
                        marginBottom:20
                    }}
                >
                    {"Safety Check"}
                </Text>
                <Text
                    style={{
                        fontSize:16,
                        fontWeight:'normal',
                        marginBottom:20,
                        textAlign:'center'
                    }}
                >
                    {"If no response emergency SOS will be activated in"}
                </Text>
                <CountdownCircleTimer
                    isPlaying={isPlaying}
                    duration={durationtime}
                    onComplete={()=>{
                        setIsPlaying(false);
                        callAlert()
                    }}

                    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                    colorsTime={[7, 5, 2, 0]}
                >
                {({ remainingTime }) => <Text style={{fontSize:40,fontWeight:'800'}}>{remainingTime}</Text>}
                </CountdownCircleTimer>
			</View>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
                    width:'100%',
				}}
			>
                <TouchableOpacity
                    style={{
                        backgroundColor:themeColor.primary,
                        borderRadius:10,
                        width:'90%',
                        display:'flex',
                        flexDirection:'row',
                        justifyContent:'center',
                        padding:15,
                        marginLeft:'auto',
                        marginRight:'auto'
                    }}
                    onPress={()=>{
                        setIsPlaying(false);
                        navigation.goBack();
                    }}
                >
                    <MaterialCommunityIcons color={themeColor.white} style={{marginRight:10,marginTop:'auto',marginBottom:'auto'}} name="check-circle" size={20} />       
                    <Text
                        style={{color:themeColor.white,fontSize:18,fontWeight:'700',marginTop:'auto',marginBottom:'auto'}}
                    >
                        {"I'm OK"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{
                        backgroundColor:themeColor.danger500,
                        borderRadius:10,
                        width:'90%',
                        display:'flex',
                        flexDirection:'row',
                        justifyContent:'center',
                        padding:15,
                        marginLeft:'auto',
                        marginRight:'auto',
                        marginTop:10
                    }}
                    onPress={()=>{
                        setdurationtime(durationtime=>durationtime+20)
                    }}
                >
                    <MaterialCommunityIcons color={themeColor.white} style={{marginRight:10,marginTop:'auto',marginBottom:'auto'}} name="timer" size={20} />       
                    <Text
                        style={{color:themeColor.white,fontSize:18,fontWeight:'700',marginTop:'auto',marginBottom:'auto'}}
                    >
                        {"Postpone"}
                    </Text>
                </TouchableOpacity>
			</View>
            
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
                    width:'100%',
				}}
			>
                <TouchableOpacity
                    style={{
                        backgroundColor:themeColor.danger,
                        borderRadius:10,
                        width:'90%',
                        display:'flex',
                        flexDirection:'row',
                        justifyContent:'center',
                        padding:15,
                        marginLeft:'auto',
                        marginRight:'auto',
                        marginTop:10
                    }}
                    onPress={()=>{
                        setIsPlaying(false);
                        callAlert()
                    }}
                >
                    <MaterialCommunityIcons color={themeColor.white} style={{marginRight:10,marginTop:'auto',marginBottom:'auto'}} name="map-marker-alert" size={20} />       
                    <Text
                        style={{color:themeColor.white,fontSize:18,fontWeight:'700',marginTop:'auto',marginBottom:'auto'}}
                    >
                        {"Activate SOS"}
                    </Text>
                </TouchableOpacity>
			</View>
		</Layout>
	);
}

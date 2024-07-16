import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Layout, Text, useTheme, Button, themeColor } from 'react-native-rapi-ui';

export default function ({ navigation }) {
	const { isDarkmode, setTheme } = useTheme();
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<TouchableOpacity
					style={{
						display:'flex',
						flexDirection:'row',
						borderRadius:10,
						borderWidth:1,
						width:'90%',
						padding:15,
						marginTop:20,
						borderColor: isDarkmode ? themeColor.white : themeColor.black
					}}
					onPress={()=>{navigation.navigate('EmergencyContact')}}
				>
					<Text
						style={{
							marginLeft:10,
							fontSize:22,
							marginTop:'auto',
							marginBottom:'auto'
						}}
					>{"Emergency Contact"}</Text>		
					{/* <MaterialCommunityIcons style={{marginTop:'auto',marginBottom:'auto',marginLeft:'auto'}} color={themeColor.danger} name="friend" size={22} />	 */}
				</TouchableOpacity>
				<TouchableOpacity
					style={{
						display:'flex',
						flexDirection:'row',
						borderRadius:10,
						borderWidth:1,
						width:'90%',
						padding:15,
						marginTop:20,
						borderColor: isDarkmode ? themeColor.white : themeColor.black
					}}
					onPress={()=>{navigation.navigate('Hospitals')}}
				>
					<Text
						style={{
							marginLeft:10,
							fontSize:22,
							marginTop:'auto',
							marginBottom:'auto'
						}}
					>{"Hospitals"}</Text>		
					{/* <MaterialCommunityIcons style={{marginTop:'auto',marginBottom:'auto',marginLeft:'auto'}} color={themeColor.danger} name="friend" size={22} />	 */}
				</TouchableOpacity>
			</View>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Button
					text={"LogOut"}
					onPress={async () => {
						await AsyncStorage.clear()
						navigation.navigate("Login");
					}}
					color={themeColor.danger}
					style={{
						marginTop: 'auto'
					}}
				/>
				<TouchableOpacity
					style={{
						marginTop:30,
						marginBottom:'20%'
					}}
					onPress={() => {
					isDarkmode ? setTheme("light") : setTheme("dark");
					}}
				>
					<Text
					size="xl"
					fontWeight="bold"
					style={{
						marginLeft: 5,
					}}
					>
					{isDarkmode ? "☀️ light theme" : "🌑 dark theme"}
					</Text>
				</TouchableOpacity>
			</View>
		</Layout>
	);
}

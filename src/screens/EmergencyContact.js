import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import {
  Layout,
  Text,
  useTheme,
  Button,
  themeColor,
  TextInput,
} from "react-native-rapi-ui";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../configs/Api";
import * as Linking from "expo-linking";
import { Portal, Dialog } from "react-native-paper";
import { KeyboardAvoidingView } from "react-native";

import { db } from "../../Firebase";
import {
  getDoc,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function ({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [UserData, SetUserData] = useState();
  const [EmergencyPersonName, setEmergencyPerson] = useState("");
  const [Emergencycontact, setEmergencycontact] = useState("");
  const [EmergencyData, SetEmergencyData] = useState([]);

  const [visible_hospital, setvisible_hospital] = useState(false);
  const showhospitalDialog = () => setvisible_hospital(true);
  const hidehospitalDialog = () => setvisible_hospital(false);

  
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const userDocRef = doc(db, "userList", JSON.parse(userId));
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData && userData.EmergencyData) {
            SetEmergencyData(userData.EmergencyData);
            console.log("EmergencyData fetched from Firestore: ", userData.EmergencyData);
          }
        }
        setFetched(true);
      } catch (error) {
        console.error("Error fetching EmergencyData from Firestore: ", error);
      }
    };
  
    fetchEmergencyData();
  }, []);
  
  useEffect(() => {
    if (fetched) {
      const updateEmergencyData = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const userDocRef = doc(db, "userList", JSON.parse(userId));
          await updateDoc(userDocRef, { EmergencyData });
          console.log("EmergencyData updated in Firestore");
        } catch (error) {
          console.error("Error updating EmergencyData in Firestore: ", error);
        }
      };
  
      updateEmergencyData();
    }
  }, [fetched, EmergencyData.length]);
  

  const addEmergencyContact = async () => {
    if (EmergencyPersonName == "" || Emergencycontact == "") {
      alert("Emergency Person Name and Phone both are required.");
    } else {
      const body = {
        EmergencyPersonName: EmergencyPersonName,
        emergencyphone: Emergencycontact,
      };
      setEmergencyPerson("");
      setEmergencycontact("");
      SetEmergencyData(prev => [...prev, body]);
      hidehospitalDialog();
    }
  };

  const DeleteContact = async (number) => {
    SetEmergencyData(EmergencyData.filter((item) => item.emergencyphone !== number));
  };


  return (
    <Layout style={{ flex: 1 }}>
      <View
        style={{
          marginLeft: 15,
          marginRight: 15,
          marginTop: "15%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          {"Emergency Contacts"}
        </Text>
        <TouchableOpacity
          style={{
            display: "flex",
            marginLeft: "auto",
          }}
          onPress={showhospitalDialog}
        >
          <MaterialCommunityIcons
            color={themeColor.danger}
            style={{ marginBottom: "auto" }}
            name="plus"
            size={40}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{
          marginTop: 30,
          marginBottom: 30,
        }}
      >
        {EmergencyData.map((data, index) => (
          <View
            style={{
              width: "90%",
              padding: 20,
              borderWidth: 1,
              borderColor: themeColor.gray,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 20,
              display: "flex",
              marginTop: 20,
              flexDirection: "column",
            }}
            key={index}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
              }}
            >
              <TouchableOpacity
                style={{
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "row",
                  padding: 5,
                  marginLeft: "auto",
                  borderWidth: 1,
                  borderColor: themeColor.danger,
                }}
                onPress={() => {
                  Alert.alert(
                    "Confirmation",
                    "Are you sure, you want to delete this number?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      { text: "Yes", onPress: () => DeleteContact(data.emergencyphone) },
                    ]
                  );
                }}
              >
                <MaterialCommunityIcons
                  color={themeColor.danger}
                  style={{ marginTop: "auto", marginBottom: "auto" }}
                  name="minus"
                  size={30}
                />
              </TouchableOpacity>
              <Image
                resizeMode="contain"
                style={{
                  height: 70,
                }}
                source={require("../../assets/personicon.png")}
              />
            </View>
            <Text
              style={{
                color: isDarkmode ? themeColor.white : themeColor.black,
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 20,
                marginBottom: 20,
                fontSize: 20,
              }}
            >
              {`Name: ${data.EmergencyPersonName}`}
            </Text>
            <Text
              style={{
                color: isDarkmode ? themeColor.white : themeColor.black,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 0,
                marginBottom: 20,
              }}
            >
              {`Number : ${data.emergencyphone}`}
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderRadius: 10,
                    padding: 15,
                    display: "flex",
                    flexDirection: "row",
                  }}
                  onPress={() => {
                    Linking.openURL(`tel:${data.emergencyphone}`);
                  }}
                >
                  <FontAwesome
                    color={"#006400"}
                    style={{
                      marginLeft: 10,
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                    name="phone"
                    size={30}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderRadius: 10,
                    padding: 15,
                    display: "flex",
                  }}
                  onPress={() => {
                    if (Platform.OS === "ios") {
                      Linking.openURL(
                        `sms:${data.emergencyphone}&body=Hi, \nI need help. I am in emergency.`
                      );
                    } else if (Platform.OS === "android") {
                      Linking.openURL(
                        `sms:${data.emergencyphone}?body=Hi, \nI need help. I am in emergency.`
                      );
                    }
                  }}
                >
                  <MaterialCommunityIcons
                    color={"#006400"}
                    style={{
                      marginLeft: 10,
                      marginTop: "auto",
                      marginBottom: "auto",
                    }}
                    name="android-messages"
                    size={30}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <Portal>
          <Dialog
            style={{ borderRadius: 10, paddingBottom: 20 }}
            visible={visible_hospital}
            onDismiss={hidehospitalDialog}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                marginBottom: 10,
              }}
            >
              <Dialog.Title
                style={{
                  marginRight: "auto",
                }}
              >
                {"Add Hospital"}
              </Dialog.Title>
              <TouchableOpacity
                onPress={addEmergencyContact}
                style={{
                  backgroundColor: themeColor.primary,
                  padding: 20,
                  marginLeft: "auto",
                  marginRight: 20,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: themeColor.white,
                    textAlign: "center",
                    marginTop: "auto",
                    marginBottom: "auto",
                  }}
                >
                  {"Add"}
                </Text>
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView>
              <Dialog.ScrollArea>
                <Text
                  style={{
                    color: themeColor.black,
                    textAlign: "left",
                    marginTop: 20,
                  }}
                >
                  {"Person name"}
                </Text>
                <TextInput
                  containerStyle={{ marginTop: 15, marginBottom: 15 }}
                  placeholder="Enter name"
                  value={EmergencyPersonName}
                  autoCapitalize="none"
                  autoCompleteType="off"
                  autoCorrect={false}
                  keyboardType="default"
                  onChangeText={(text) => setEmergencyPerson(text)}
                />
                <Text
                  style={{
                    color: themeColor.black,
                    textAlign: "left",
                    marginTop: 20,
                  }}
                >
                  {"Person contact number"}
                </Text>
                <TextInput
                  containerStyle={{ marginTop: 15, marginBottom: 15 }}
                  placeholder="Enter your emergency contact"
                  value={Emergencycontact}
                  autoCapitalize="none"
                  autoCompleteType="off"
                  autoCorrect={false}
                  keyboardType="phone-pad"
                  onChangeText={(text) => setEmergencycontact(text)}
                />
              </Dialog.ScrollArea>
            </KeyboardAvoidingView>
          </Dialog>
        </Portal>
      </ScrollView>
    </Layout>
  );
}

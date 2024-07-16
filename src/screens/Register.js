import React, { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
  Alert
} from "react-native";
import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import { api } from "../configs/Api"
import AsyncStorage from "@react-native-async-storage/async-storage";

import { db } from "../../Firebase";
import {
  getDocs,
  collection,
  where,
  query,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  orderBy,
  addDoc,
} from "firebase/firestore";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { MyContext } from "../context/ContextProvider";

export default function ({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emergencycontact, setEmergencycontact] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxCharacters, setMaxCharacters] = useState(50)
  const [phoneIsValid, setPhoneIsValid] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")



  const [idCard, setIdCard] = useState("");

  const [name, setName] = useState("")
  const {setUserDetails, setIsUserLoggedIn} = useContext(MyContext);



  useEffect(() => {

    if (emergencycontact && emergencycontact.length === 11) {
      setPhoneIsValid(true);
    } else {
      setPhoneIsValid(false);
    }


  }, [emergencycontact])

  const handleChangeText = (text) => {
    const blockedDomain = '.com';

    if (text.endsWith(blockedDomain)) {
      // If the entered text ends with the blocked domain, prevent further typing
      setMaxCharacters(text.length)
    } else { setMaxCharacters(50) }

    setUsername(text);
  };

  function isPasswordValid(password) {
    // Check if the password contains at least one letter (character)
    const containsCharacter = /[a-zA-Z]/.test(password);

    // Check if the password contains at least one number
    const containsNumber = /\d/.test(password);

    // Return true if the password meets both criteria, otherwise return false
    return containsCharacter && containsNumber;
  }

  function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function register() {
    
      if (password === "" || username === "" || emergencycontact === "" || name === "") {
        Alert.alert("Please enter all fields");
        return;
      } else if (!isEmailValid(username)) {
        Alert.alert("Email is not valid");
        return;
      } else if (password.length < 6) {
        Alert.alert("Password should have minimum 6 characters");
        return;
      } else if (!isPasswordValid(password)) {
        Alert.alert("Password should have characters and numbers");
        return;
      } else if (password !== confirmPassword) {
        Alert.alert("Passwords do not match");
        return;
      }
      try {
      setLoading(true);
      
  
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("email", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.size >= 1) {
        toast.error("User already exists");
        return;
      }
  
      // Create a new user account in Firebase Authentication
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        username,
        password
      );
      const userId = userCredential.user.uid;

      const body = {
        userId: userId,
        username: name,
        email: username,
        password: password,
        emergencycontact: emergencycontact,
        idCard: idCard
      };
  
      const userDocRef = doc(db, "userList", userId);
      await setDoc(userDocRef, body);
      console.log("Document written with ID:", userId);
  
      // Store data in cookies
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true))
      await AsyncStorage.setItem('userId', JSON.stringify(userId));
      await AsyncStorage.setItem('userDetails', JSON.stringify(body));
      // Update context state
      setIsUserLoggedIn(true);
      setUserDetails(body);
      navigation.navigate('MainTabs');
      onClose();
    } catch (err) {
      console.log("error: ", err);
    } finally{
      setLoading(false);}
  }
  

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkmode ? "#17171E" : themeColor.white100,
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../assets/register.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: isDarkmode ? themeColor.dark : themeColor.white,
            }}
          >
            <Text
              fontWeight="bold"
              size="h3"
              style={{
                alignSelf: "center",
                padding: 30,
              }}
            >
              Register
            </Text>


            <Text>Full Name</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter full name"
              value={name}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="default"
              onChangeText={(text) => setName(text)}
            />



            <Text style={{ marginTop: 15 }}>Email</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your email"
              value={username}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="default"
              onChangeText={handleChangeText}
              maxLength={maxCharacters}
            />


            <Text style={{ marginTop: 15 }}>Emergency Contact</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your emergency contact"
              value={emergencycontact}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="phone-pad"
              onChangeText={(text) => setEmergencycontact(text)}
              maxLength={11}
            />
            <Text>{phoneIsValid ? "Valid" : "Not Valid"}</Text>
            <Text style={{ marginTop: 15 }}>Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            <Text style={{ marginTop: 15 }}>Confirm Password</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your password again"
              value={confirmPassword}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setConfirmPassword(text)}
            />


            
            <Text>ID Card</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter full name"
              value={idCard}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="default"
              onChangeText={(text) => setIdCard(text)}
            />

            <Button
              text={loading ? "Loading" : "Create an account"}
              onPress={() => {
                register();
              }}
              color={themeColor.danger}
              style={{
                marginTop: 20
              }}
              disabled={loading}
            />


            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text size="md">Already have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  Login here
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}

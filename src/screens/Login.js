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
import { api } from "../configs/Api";

import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyContext } from "../context/ContextProvider";

import { collection, addDoc, getDocs, where, query, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase";


export default function Login({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxCharacters, setMaxCharacters] = useState(50)

  const {setUserDetails, setIsUserLoggedIn} = useContext(MyContext);

  useEffect(() => {
    AsyncStorage?.getItem('userDetails').then((value) =>
        value !== null && navigation.replace("MainTabs")
    );
}, []);


  function isEmailValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleChangeText = (text) => {
    const blockedDomain = '.com';

    if (text.endsWith(blockedDomain)) {
      // If the entered text ends with the blocked domain, prevent further typing
      setMaxCharacters(text.length)
    } else { setMaxCharacters(50) }

    setUsername(text);
  };

  async function login() {
      if (password == "" || username == "") {
        Alert.alert("Please enter all fields")
        return;
      } else if (!isEmailValid(username)) {
        Alert.alert("Email is not valid")
        return;

      }

      try {
        const auth = getAuth(); // Import getAuth from firebase/auth if needed

        // Perform login using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
          auth,
          username, 
          password
        );

        // Obtain the user's UID (userId)
        const userId = userCredential.user.uid;

        // Query Firestore to get the user's type and additional data based on UID
        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.size === 1) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            setIsUserLoggedIn(true);
            setUserDetails(userData);
            AsyncStorage.setItem('isLoggedIn', JSON.stringify(true))
            AsyncStorage.setItem('userId', JSON.stringify(userId));
            AsyncStorage.setItem('userDetails', JSON.stringify(userData));
            navigation.navigate('MainTabs')
            onClose();
          });
        } else {
          alert("User doesn't exist");
        }
    }
    catch (err) {
      console.log("error: ", err)
    } finally {
      setLoading(false);
    }
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
              source={require("../../assets/login.png")}
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
              style={{
                alignSelf: "center",
                padding: 30,
              }}
              size="h3"
            >
              Login
            </Text>
            <Text>Email</Text>
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
            <Button
              text={loading ? "Loading" : "Continue"}
              onPress={() => {
                login();
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
              <Text size="md">Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Register");
                }}
              >
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                  }}
                >
                  Register here
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}

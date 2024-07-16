import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { themeColor, useTheme } from "react-native-rapi-ui";
import TabBarIcon from "../components/utils/TabBarIcon";
import TabBarText from "../components/utils/TabBarText";

import Home from "../screens/Home";
import SecondScreen from "../screens/SecondScreen";
import About from "../screens/About";
import Profile from "../screens/Profile";
import Login from "../screens/Login";
import Register from "../screens/Register";
import AlertScreen from "../screens/AlertScreen";
import EmergencyContact from "../screens/EmergencyContact";
import Hospitals from "../screens/Hospitals";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainStack = createNativeStackNavigator();
const Main = () => {

 

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="Login" component={Login} />
      <MainStack.Screen name="Register" component={Register} />
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen name="SecondScreen" component={SecondScreen} />
      <MainStack.Screen name="EmergencyContact" component={EmergencyContact} />
      <MainStack.Screen name="AlertScreen" component={AlertScreen} />
      <MainStack.Screen name="Hospitals" component={Hospitals} />
      
    </MainStack.Navigator>
  );
};

const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  const { isDarkmode } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: isDarkmode ? themeColor.dark100 : "#c0c0c0",
          backgroundColor: isDarkmode ? themeColor.dark200 : "#ffffff",
        },
      }}
      initialRouteName="Home"
    >
      {/* these icons using Ionicons */}
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="Home" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"home"} />
          ),
        }}
      />
      <Tabs.Screen
        name="About"
        component={About}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabBarText focused={focused} title="About" />
          ),
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={"information-circle"} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

export default () => {
  return (
    <NavigationContainer>
      <Main />
    </NavigationContainer>
  );
};

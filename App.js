// App.js
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { UserProvider, UserContext } from './src/context/UserContext';

import HomeScreen from './src/screens/HomeScreen';
import SavedLocationScreen from './src/screens/SavedLocationScreen';
import LocationDetailScreen from './src/screens/LocationDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import FirstScreen from './src/screens/FirstScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerTitleAlign: 'center', headerTitleStyle: { fontWeight: 'bold' } }}
    >
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <ProfileStack.Screen name="SignUp" component={SignupScreen} options={{ title: 'Sign Up' }} />
    </ProfileStack.Navigator>
  );
}

function SavedStackScreen() {
  return (
    <SavedStack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 24,         
          fontWeight: '700',
          color: '#2E2B23',
        },
      }}
    >
      <SavedStack.Screen
        name="SavedLocations"
        component={SavedLocationScreen}
        options={{
          title: 'Saved Locations',
        }}
      />
      <SavedStack.Screen
        name="LocationDetail"
        component={LocationDetailScreen}
        options={{ headerShown: false }}
      />
    </SavedStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Parking') iconName = focused ? 'car-sport' : 'car-sport-outline';
          else if (route.name === 'Stats') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0BA467',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Parking" component={SavedStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user } = React.useContext(UserContext);

  return user ? (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  ) : (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="First" component={FirstScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={SignupScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <UserProvider>
          <NavigationContainer>
            <RootNavigator />  
          </NavigationContainer>
        </UserProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
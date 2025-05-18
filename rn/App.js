import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Image, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Login Screen
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoError, setLogoError] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Use your existing web client ID here
    clientId: '188965435290-c0bur3h8ld6aubobf8eo29abm84l33ed.apps.googleusercontent.com',
    // Add web client ID for development
    webClientId: '188965435290-c0bur3h8ld6aubobf8eo29abm84l33ed.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication);
    }
  }, [response]);

  const handleGoogleLogin = async (auth) => {
    try {
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const userInfo = await userInfoResponse.json();

      // Store user info
      await AsyncStorage.setItem('user', JSON.stringify({ 
        email: userInfo.email,
        name: userInfo.name,
        photo: userInfo.picture,
        accessToken: auth.accessToken
      }));

      // Schedule notifications
      await scheduleNotifications();
      
      navigation.replace('Welcome');
    } catch (error) {
      Alert.alert('Error', 'Google login failed. Please try again.');
    }
  };

  const handleEmailLogin = async () => {
    if (email && password) {
      try {
        // TODO: Implement actual email login
        await AsyncStorage.setItem('user', JSON.stringify({ email }));
        await scheduleNotifications();
        navigation.replace('Welcome');
      } catch (error) {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.loginContainer}>
        {!logoError ? (
          <Image 
            source={require('./assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <View style={[styles.logo, styles.logoFallback]}>
            <Ionicons name="fitness" size={60} color="#1a73e8" />
          </View>
        )}
        <Text style={styles.title}>GlucoLink</Text>
        <Text style={styles.subtitle}>Smart Diabetes Management Made Simple</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleEmailLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.googleButton]} 
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={24} color="#fff" />
          <Text style={styles.buttonText}>Login with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Welcome Screen
function WelcomeScreen({ navigation }) {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    AsyncStorage.getItem('user').then(user => {
      if (user) {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'User');
      }
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome, {userName}!</Text>
        
        <View style={styles.optionGrid}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('MainApp', { screen: 'NewEntry' })}
          >
            <Ionicons name="add-circle" size={48} color="#1a73e8" />
            <Text style={styles.optionTitle}>New Entry</Text>
            <Text style={styles.optionDescription}>
              Add a new glucose reading and related information
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.optionCard}
            onPress={() => navigation.navigate('MainApp', { screen: 'ViewRecords' })}
          >
            <Ionicons name="bar-chart" size={48} color="#1a73e8" />
            <Text style={styles.optionTitle}>View Records</Text>
            <Text style={styles.optionDescription}>
              View your glucose readings and track your progress
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// New Entry Screen
function NewEntryScreen() {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [formData, setFormData] = useState({
    breakfast: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    midday: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    lunch: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    evening: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    dinner: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    night: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
    others: { weight: '', height: '', date: '' }
  });

  const tabs = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'midday', label: 'Mid Day Meal' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'evening', label: 'Evening' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'night', label: '3AM Sugar' },
    { id: 'others', label: 'Others' }
  ];

  const handleSubmit = async () => {
    try {
      const savedData = await AsyncStorage.getItem('glucoseData');
      const data = savedData ? JSON.parse(savedData) : [];
      
      const entryDate = formData.others.date || new Date().toISOString().split('T')[0];
      const existingEntryIndex = data.findIndex(entry => entry.date === entryDate);
      
      const newEntry = {
        date: entryDate,
        ...formData
      };

      if (existingEntryIndex !== -1) {
        data[existingEntryIndex] = newEntry;
      } else {
        data.push(newEntry);
      }

      await AsyncStorage.setItem('glucoseData', JSON.stringify(data));

      // Send notification for high/low glucose
      const currentData = formData[activeTab];
      if (currentData.sugar) {
        const sugar = parseInt(currentData.sugar);
        if (sugar > 180) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'High Glucose Alert',
              body: `Your glucose level is ${sugar} mg/dL. Consider taking action.`,
            },
            trigger: null,
          });
        } else if (sugar < 70) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Low Glucose Alert',
              body: `Your glucose level is ${sugar} mg/dL. Consider taking action.`,
            },
            trigger: null,
          });
        }
      }

      Alert.alert('Success', 'Entry saved successfully!');
      setFormData({
        breakfast: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        midday: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        lunch: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        evening: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        dinner: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        night: { sugar: '', insulin_type: '', insulin_unit: '', meals: '', carbs: '', post_sugar: '' },
        others: { weight: '', height: '', date: '' }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    }
  };

  const renderForm = () => {
    const currentData = formData[activeTab];
    
    if (activeTab === 'others') {
      return (
        <>
          <Text style={styles.label}>Weight (check every 15 days)</Text>
          <TextInput
            style={styles.input}
            value={currentData.weight}
            onChangeText={(text) => setFormData({
              ...formData,
              others: { ...currentData, weight: text }
            })}
            keyboardType="numeric"
            placeholder="Enter weight"
          />

          <Text style={styles.label}>Height (check every 15 days)</Text>
          <TextInput
            style={styles.input}
            value={currentData.height}
            onChangeText={(text) => setFormData({
              ...formData,
              others: { ...currentData, height: text }
            })}
            keyboardType="numeric"
            placeholder="Enter height"
          />

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={currentData.date}
            onChangeText={(text) => setFormData({
              ...formData,
              others: { ...currentData, date: text }
            })}
            placeholder="YYYY-MM-DD"
          />
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Blood Sugar</Text>
        <TextInput
          style={styles.input}
          value={currentData.sugar}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, sugar: text }
          })}
          keyboardType="numeric"
          placeholder="Enter blood sugar level"
        />

        <Text style={styles.label}>Insulin Type</Text>
        <TextInput
          style={styles.input}
          value={currentData.insulin_type}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, insulin_type: text }
          })}
          placeholder="Enter insulin type"
        />

        <Text style={styles.label}>Insulin Units</Text>
        <TextInput
          style={styles.input}
          value={currentData.insulin_unit}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, insulin_unit: text }
          })}
          keyboardType="numeric"
          placeholder="Enter insulin units"
        />

        <Text style={styles.label}>Meals</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={currentData.meals}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, meals: text }
          })}
          multiline
          placeholder="Enter meals"
        />

        <Text style={styles.label}>Carbs</Text>
        <TextInput
          style={styles.input}
          value={currentData.carbs}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, carbs: text }
          })}
          keyboardType="numeric"
          placeholder="Enter carbs"
        />

        <Text style={styles.label}>Post Sugar</Text>
        <TextInput
          style={styles.input}
          value={currentData.post_sugar}
          onChangeText={(text) => setFormData({
            ...formData,
            [activeTab]: { ...currentData, post_sugar: text }
          })}
          keyboardType="numeric"
          placeholder="Enter post-meal sugar"
        />
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Fill an Entry</Text>
        <Text style={styles.subtitle}>Track your glucose levels, insulin doses, and meals with ease</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabButtonText,
                activeTab === tab.id && styles.activeTabButtonText
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.formSection}>
          {renderForm()}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// View Records Screen
function ViewRecordsScreen() {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealFilter, setMealFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('glucoseData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all entries? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('glucoseData');
              setEntries([]);
              Alert.alert('Success', 'All data deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data');
            }
          }
        }
      ]
    );
  };

  const exportToCSV = async () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Meal Type', 'Blood Sugar', 'Insulin Type', 'Insulin Units', 'Meals', 'Carbs', 'Post Sugar'];
      let csvContent = headers.join(',') + '\n';

      entries.forEach(entry => {
        const mealTypes = ['breakfast', 'midday', 'lunch', 'evening', 'dinner', 'night'];
        mealTypes.forEach(mealType => {
          const mealData = entry[mealType];
          if (mealData) {
            const row = [
              entry.date,
              mealType,
              mealData.sugar || '',
              mealData.insulin_type || '',
              mealData.insulin_unit || '',
              mealData.meals || '',
              mealData.carbs || '',
              mealData.post_sugar || ''
            ];
            csvContent += row.join(',') + '\n';
          }
        });
      });

      // Save CSV file
      const fileUri = FileSystem.documentDirectory + 'glucose_data.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Glucose Data',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.date.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMeal = !mealFilter || entry[mealFilter.toLowerCase()];
    const matchesDate = (!startDate || entry.date >= startDate) && 
                       (!endDate || entry.date <= endDate);
    return matchesSearch && matchesMeal && matchesDate;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.recordsContainer}>
        <Text style={styles.title}>Glucose Data Viewer</Text>

        <View style={styles.controls}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Start Date"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="End Date"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.exportButton]} 
              onPress={exportToCSV}
            >
              <Text style={styles.buttonText}>Export to CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDeleteAll}
            >
              <Text style={styles.buttonText}>Delete All Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {filteredEntries.map((entry, index) => (
          <View key={index} style={styles.entryCard}>
            <Text style={styles.entryDate}>{entry.date}</Text>
            
            {Object.entries(entry).map(([key, value]) => {
              if (key === 'date') return null;
              return (
                <View key={key} style={styles.entrySection}>
                  <Text style={styles.entryLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  {typeof value === 'object' ? (
                    Object.entries(value).map(([subKey, subValue]) => (
                      <Text key={subKey} style={styles.entryValue}>
                        {subKey}: {subValue}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.entryValue}>{value}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Settings Screen
function SettingsScreen({ navigation }) {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [notificationTimes, setNotificationTimes] = useState({
    breakfast: '08:00',
    lunch: '12:00',
    dinner: '19:00',
    night: '03:00'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedTimes = await AsyncStorage.getItem('notificationTimes');
      
      if (savedTheme) setTheme(savedTheme);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedTimes) setNotificationTimes(JSON.parse(savedTimes));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
      // TODO: Apply theme to app
    } catch (error) {
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      setNotifications(value);
      await AsyncStorage.setItem('notifications', JSON.stringify(value));
      
      if (value) {
        await scheduleNotifications();
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await Notifications.cancelAllScheduledNotificationsAsync();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsContainer}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'light' && styles.activeThemeOption]}
              onPress={() => handleThemeChange('light')}
            >
              <Text style={[styles.themeOptionText, theme === 'light' && styles.activeThemeOptionText]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'dark' && styles.activeThemeOption]}
              onPress={() => handleThemeChange('dark')}
            >
              <Text style={[styles.themeOptionText, theme === 'dark' && styles.activeThemeOptionText]}>
                Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeOption, theme === 'contrast' && styles.activeThemeOption]}
              onPress={() => handleThemeChange('contrast')}
            >
              <Text style={[styles.themeOptionText, theme === 'contrast' && styles.activeThemeOptionText]}>
                High Contrast
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#1a73e8' : '#f4f3f4'}
          />
        </View>

        {notifications && (
          <View style={styles.notificationTimes}>
            <Text style={styles.settingLabel}>Reminder Times</Text>
            {Object.entries(notificationTimes).map(([meal, time]) => (
              <View key={meal} style={styles.timeSetting}>
                <Text style={styles.timeLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                <TextInput
                  style={styles.timeInput}
                  value={time}
                  onChangeText={(text) => {
                    const newTimes = { ...notificationTimes, [meal]: text };
                    setNotificationTimes(newTimes);
                    AsyncStorage.setItem('notificationTimes', JSON.stringify(newTimes));
                    scheduleNotifications();
                  }}
                  placeholder="HH:MM"
                />
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Helper function to schedule notifications
async function scheduleNotifications() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications in your device settings');
      return;
    }

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get notification times from settings
    const savedTimes = await AsyncStorage.getItem('notificationTimes');
    if (!savedTimes) return;

    const notificationTimes = JSON.parse(savedTimes);

    // Schedule notifications for each meal
    Object.entries(notificationTimes).forEach(async ([meal, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${meal.charAt(0).toUpperCase() + meal.slice(1)} Reminder`,
          body: 'Time to check your glucose levels!',
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });
    });
  } catch (error) {
    console.error('Failed to schedule notifications:', error);
  }
}

// Main Tab Navigator
const Tab = createBottomTabNavigator();
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'NewEntry') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ViewRecords') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="NewEntry" component={NewEntryScreen} options={{ title: 'New Entry' }} />
      <Tab.Screen name="ViewRecords" component={ViewRecordsScreen} options={{ title: 'View Records' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
const Stack = createNativeStackNavigator();
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then(user => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="MainApp" component={MainTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loginContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  logoFallback: {
    width: 100,
    height: 100,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    padding: 20,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    marginTop: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeTabButton: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4285f4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#1a73e8',
    textAlign: 'center',
    marginTop: 15,
  },
  recordsContainer: {
    padding: 20,
  },
  controls: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#34a853',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
  },
  entryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  entrySection: {
    marginBottom: 10,
  },
  entryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  entryValue: {
    fontSize: 14,
    color: '#333',
  },
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeThemeOption: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  themeOptionText: {
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20,
  },
  notificationTimes: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  timeSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 16,
    color: '#333',
  },
  timeInput: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
  },
  activeThemeOptionText: {
    color: '#fff',
  },
}); 

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import WalletScreen from './screens/WalletScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// File: screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const sadcCountries = [
  "South Africa", "Zimbabwe", "Namibia", "Botswana", "Mozambique",
  "Zambia", "Tanzania", "Malawi", "Angola", "DRC",
  "Eswatini", "Lesotho", "Mauritius", "Seychelles"
];

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [nationality, setNationality] = useState('South Africa');

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        fullName, phoneNumber, idNumber, nationality
      });
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Wallet', { user: res.data.user });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SADC CBDC Registration</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="ID / Passport Number" value={idNumber} onChangeText={setIdNumber} />
      <Picker selectedValue={nationality} onValueChange={(itemValue) => setNationality(itemValue)}>
        {sadcCountries.map(country => <Picker.Item key={country} label={country} value={country} />)}
        <Picker.Item label="Other (Foreign National)" value="Foreign" />
      </Picker>
      <Button title="Register & Create Wallet" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }
});

// File: screens/WalletScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import axios from 'axios';

export default function WalletScreen({ route }) {
  const { user } = route.params;
  const [balance, setBalance] = useState(user.walletBalance);
  const [fxRate, setFxRate] = useState(null);

  const refreshBalance = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/wallet/balance?phone=${user.phoneNumber}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.log('Failed to refresh balance');
    }
  };

  const fetchFxRate = async () => {
    try {
      const res = await axios.get('https://api.exchangerate.host/latest?base=USD&symbols=ZAR');
      setFxRate(res.data.rates.ZAR);
    } catch (err) {
      console.log('Failed to fetch exchange rate');
    }
  };

  useEffect(() => {
    fetchFxRate();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.fullName}</Text>
      <Text style={styles.balanceLabel}>Wallet Balance:</Text>
      <Text style={styles.balance}>ZAR {balance.toFixed(2)}</Text>
      {fxRate && <Text>USD Equivalent: ${(balance / fxRate).toFixed(2)} USD</Text>}
      <Button title="Refresh Balance" onPress={refreshBalance} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 22, marginBottom: 10 },
  balanceLabel: { fontSize: 16 },
  balance: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 }
});

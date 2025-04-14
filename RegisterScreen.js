import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [country, setCountry] = useState('');

  const handleRegister = () => {
    alert('Registered! $100 CBDC grant added.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register CBDC Wallet</Text>
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        onChangeText={setPhone}
        value={phone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="ID or Passport Number"
        style={styles.input}
        onChangeText={setIdNumber}
        value={idNumber}
      />
      <TextInput
        placeholder="Country"
        style={styles.input}
        onChangeText={setCountry}
        value={country}
      />
      <Button title="Register & Claim $100" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 }
});
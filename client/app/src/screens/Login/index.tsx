// screens/LoginScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../../utils/auth.utils';
import {Image} from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocus, setInputFocus] = useState(false);
  const {login} = useAuth();

  const handleLogin = () => {
    login({name: 'system', email: 'Test', password: 'test'}, 'dummy-token');
  };

  const handleFocus = () => {
    setInputFocus(true);
  };
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('../../assets/logo-wb.png')}
          width={75}
          height={75}
          style={{width: 75, height: 75, tintColor: 'white'}}
        />
        <Text style={styles.title}>Welcome to Zenix</Text>
        <Text style={styles.subtitle}>
          Use your email to Login to Zenix. Don't have one? You can register
          later.
        </Text>
        <Text>Email</Text>
        <TextInput
          style={[styles.input, {borderColor: inputFocus ? '#e5e0d2' : 'gray'}]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
          onFocus={handleFocus}
        />
        {/* <Text>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        /> */}
      </View>
      <View style={{gap: 12}}>
        <Text style={styles.subtitle}>
          People with your email can see your name a profile to connect with you
          across Zenix service.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 5,
    height: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'semibold',
    color: 'white',
  },
  subtitle: {
    fontSize: 15,
    color: 'gray',
  },
  button: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
  },
  input: {
    color: '#f2f2f2',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 12,
    padding: 12,
  },
});

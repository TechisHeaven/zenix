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
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../../types/navigation.type';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {validateEmail} from '../../utils/validate.utils';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;
const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [inputFocus, setInputFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const handleLogin = () => {
    if (email.length === 0) {
      setError('Email cannot be empty');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    const isEmailAlreadyExists = false;

    if (!isEmailAlreadyExists) navigation.navigate('Password', {email: email});

    navigation.navigate('Register', {email: email});
  };
  const handleFocus = () => {
    setInputFocus(true);
  };
  return (
    <View style={styles.container}>
      <View style={{gap: 12}}>
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
        <TextInput
          style={[styles.input, {borderColor: inputFocus ? '#e5e0d2' : 'gray'}]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
          textContentType="emailAddress"
          onFocus={handleFocus}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <View style={{gap: 12}}>
        <Text style={styles.subtitle}>
          People with your email can see your name a profile to connect with you
          across Zenix service.
        </Text>
        <TouchableOpacity
          disabled={email.length === 0}
          style={[
            styles.button,
            email.length === 0 && {backgroundColor: 'gray'},
          ]}
          onPress={handleLogin}>
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
  errorText: {fontSize: 12, color: 'red'},
});

export const loginStyles = styles;

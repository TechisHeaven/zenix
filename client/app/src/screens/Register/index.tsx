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
import {Eye, EyeClosed} from 'lucide-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;
const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocus, setInputFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {register} = useAuth();

  const [isVisible, setIsVisible] = useState(false);
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

    register({name, email, password}, 'dummy-token');
    // navigation.navigate('Register', {email: email});
  };
  const handleFocus = () => {
    setInputFocus(true);
  };
  const handleBlur = () => {
    setInputFocus(false);
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
        <Text style={styles.title}>Register to Zenix</Text>
        <Text style={styles.subtitle}>
          Use your email and details to Register to Zenix.
        </Text>
        <TextInput
          style={[styles.input, {borderColor: inputFocus ? '#e5e0d2' : 'gray'}]}
          value={name}
          onChangeText={setName}
          keyboardType="default"
          autoCapitalize="none"
          placeholder="Enter your name"
          textContentType="name"
          onFocus={handleFocus}
        />
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={[
              loginStyles.input,
              {borderColor: inputFocus ? '#e5e0d2' : 'gray', flex: 1},
            ]}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            placeholder="Enter your Password"
            autoComplete="password"
            secureTextEntry={!isVisible}
            passwordRules={
              'required: upper; required: lower; required: digit; minlength: 8; maxlength: 16;'
            }
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            style={{padding: 6}}>
            {isVisible ? (
              <Eye size={16} color={'#f2f2f2'} />
            ) : (
              <EyeClosed size={16} color={'#f2f2f2'} />
            )}
          </TouchableOpacity>
        </View>
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

export default RegisterScreen;

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

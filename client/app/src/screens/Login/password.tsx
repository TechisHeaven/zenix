import React, {useState} from 'react';
import {TextInput} from 'react-native';
import {Text} from 'react-native';
import {Image, View} from 'react-native';
import {loginStyles} from '.';
import {useAuth} from '../../utils/auth.utils';
import {TouchableOpacity} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {Eye, EyeClosed} from 'lucide-react-native';
import {validatePassword} from '../../utils/validate.utils';

// Define the route prop type

type RootStackParamList = {
  Cred: {
    email: string;
  };
};

// Define the route prop type
type VideoScreenRouteProp = RouteProp<RootStackParamList, 'Cred'>;

type VideoProps = {
  route: VideoScreenRouteProp;
};
export default function Password({route}: VideoProps) {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {email} = route.params;

  const handleFocus = () => {
    setInputFocus(true);
  };
  const handleBlur = () => {
    setInputFocus(false);
  };

  const {login} = useAuth();

  const handleLogin = () => {
    if (!password) {
      setError('Password cannot be empty.');
      return;
    }
    if (!validatePassword(password)) {
      setError(
        'Password must be 8-16 characters with uppercase, lowercase, and digits.',
      );
      return;
    }

    login({name: 'system', email, password}, 'dummy-token');
  };

  return (
    <View style={loginStyles.container}>
      <View style={{gap: 12}}>
        <Image
          source={require('../../assets/logo-wb.png')}
          width={75}
          height={75}
          style={{width: 75, height: 75, tintColor: 'white'}}
        />
        <Text style={loginStyles.title}>Password</Text>
        <Text style={loginStyles.subtitle}>
          Use your password to Login to Zenix.
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={[
              loginStyles.input,
              {borderColor: inputFocus ? '#e5e0d2' : 'gray', flex: 1},
            ]}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            // keyboardType={isVisible ? 'default' : 'visible-password'}
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
        {error && <Text style={loginStyles.errorText}>{error}</Text>}
      </View>
      <View style={{gap: 12}}>
        <Text style={loginStyles.subtitle}>
          People with your email can see your name a profile to connect with you
          across Zenix service.
        </Text>
        <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
          <Text>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

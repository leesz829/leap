import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SecondAuthPopup } from 'screens/commonpopup/SecondAuthPopup';
import { Login } from 'screens/login/login';
import { NiceAuth } from 'screens/login/niceAuth';
import { SearchIdAndPwd } from 'screens/login/SearchIdAndPwd';
import { Policy } from 'screens/signup/policy';
import { SignUp_Check } from 'screens/signup/SignUp_Check';
import { SignUp_ID } from 'screens/signup/SignUp_ID';
import { SignUp_Password } from 'screens/signup/SignUp_Password';
import { SignUp_Image } from 'screens/signup/SignUp_Image';
import { SignUp_Nickname } from 'screens/signup/SignUp_Nickname';
import { SignUp_Comment } from 'screens/signup/SignUp_Comment';
import { SignUp_AddInfo } from 'screens/signup/SignUp_AddInfo';
import { SignUp_Interest } from 'screens/signup/SignUp_Interest';
import { SignUp_Introduce } from 'screens/signup/SignUp_Introduce';
import { SignUp_Auth } from 'screens/signup/SignUp_Auth';
import { Approval } from 'screens/signup/Approval';

import { ROUTES } from 'constants/routes';

const AuthStack = createStackNavigator();

export default function AuthNavigation() {
  return (
    <AuthStack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name={ROUTES.LOGIN} component={Login} />
      <AuthStack.Screen name={ROUTES.SIGNUP_CHECK} component={SignUp_Check} />
      <AuthStack.Screen name={ROUTES.SIGNUP_ID} component={SignUp_ID} />
      <AuthStack.Screen name={ROUTES.SIGNUP_PASSWORD} component={SignUp_Password} />
      <AuthStack.Screen name={ROUTES.SIGNUP_IMAGE} component={SignUp_Image} />
      <AuthStack.Screen name={ROUTES.SIGNUP_NICKNAME} component={SignUp_Nickname} />
      <AuthStack.Screen name={ROUTES.SIGNUP_COMMENT} component={SignUp_Comment} />
      <AuthStack.Screen name={ROUTES.SIGNUP_ADDINFO} component={SignUp_AddInfo} />
      <AuthStack.Screen name={ROUTES.SIGNUP_INTEREST} component={SignUp_Interest} />
      <AuthStack.Screen name={ROUTES.SIGNUP_INTRODUCE} component={SignUp_Introduce} />
      <AuthStack.Screen name={ROUTES.SIGNUP_AUTH} component={SignUp_Auth} />
      <AuthStack.Screen name={ROUTES.POLICY} component={Policy} />
      <AuthStack.Screen name={ROUTES.SECOND_AUTH_POPUP} component={SecondAuthPopup} />
      <AuthStack.Screen name={ROUTES.APPROVAL} component={Approval} />
      <AuthStack.Screen name={ROUTES.NICE_AUTH} component={NiceAuth} />
      <AuthStack.Screen name={ROUTES.SEARCH_IDPWD} component={SearchIdAndPwd} />
    </AuthStack.Navigator>
  );
}
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { Color } from 'assets/styles/Color';
import { commonStyle, styles, layoutStyle, modalStyle } from 'assets/styles/Styles';
import axios from 'axios';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, Platform, Text, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import * as properties from 'utils/properties';
import { usePopup } from 'Context';
import { SUCCESS, MEMBER_EMAIL_DUP } from 'constants/reusltcode';
import { regist_member_base_info } from 'api/models';
import { ROUTES } from 'constants/routes';
import { isEmptyData } from 'utils/functions';



interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_ID'>;
  route: RouteProp<StackParamList, 'SignUp_ID'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_ID = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const birthday = props.route.params?.birthday; // 생년월일
  const ci = props.route.params?.ci; // CI
  const name = props.route.params?.name; // 이름
  const gender = props.route.params?.gender; // 성별
  const age = props.route.params?.age; // 나이
  const mobile = props.route.params?.mobile; // 전화번호
  const mrktAgreeYn = props.route.params?.marketing_agree_yn; // 마케팅 정보 동의 여부
  const memberSeq = props.route.params?.memberSeq; // 회원 번호
  const orgEmailId = props.route.params?.emailId; // 기존 이메일 ID

  // 입력 변수
  const [emailId, setEmailId] = React.useState(isEmptyData(props.route.params?.emailId) ? props.route.params?.emailId : '');
  const [password, setPassword] = React.useState('');
  const [passwordChk, setPasswordChk] = React.useState('');

  // ######################################################################################################## 이메일 유효성 체크
  const emailValidChk = async () => {
    let isResult = true;

    if(!isEmptyData(emailId)) {
      show({ content: '아이디를 입력해 주세요.' });
      isResult = false;
      return;
    }

    let regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if(!regEmail.test(emailId)) {
      show({ content: '이메일 형식의 아이디가 아닙니다.' });
      isResult = false;
      return;
    }

    if(isResult === true) {
      goNext();
    };
  };

  // ########################################################### 다음 이동
  const goNext = async () => {
    navigation.navigate({
      name : ROUTES.SIGNUP_PASSWORD,
      params : {
        birthday: birthday,
        ci: ci,
        name: name,
        gender: gender,
        marketing_agree_yn: mrktAgreeYn,
        mobile: mobile,
        emailId: emailId,
      }
    });
  };

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView>

          {/* ########################################################################################## HEADER */}
          <SpaceView>
            <CommonHeader title="" />
          </SpaceView>

          <SpaceView viewStyle={{justifyContent: 'space-between'}}>
            <SpaceView>
              <SpaceView mt={50}>
                <Text style={styles.fontStyle('H', 28, '#fff')}>아이디로 사용 하실{'\n'}이메일을 입력해 주세요.</Text>
                <SpaceView mt={10}>
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>비밀번호를 잃어 버리신 경우 이메일로 안내가 됩니다.{'\n'}실제로 사용하는 이메일을 입력해 주세요.</Text>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={50}>
                <TextInput
                  value={emailId}
                  onChangeText={(text) => setEmailId(text)}
                  autoCapitalize={'none'}
                  style={[_styles.textInputStyle, styles.fontStyle('B', 28, '#fff')]}
                  maxLength={50}
                  placeholder={'이메일을 입력해 주세요.'}
                  placeholderTextColor={'#808080'}
                />
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </SpaceView>

        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity 
            disabled={!emailId}
            onPress={() => { emailValidChk(); }}
            style={_styles.nextBtnWrap(emailId)}>
            <Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
            <SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
          </TouchableOpacity>
        </SpaceView>
        
      </SpaceView>
    </>
  );
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  itemWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    paddingBottom: 5,
    paddingHorizontal: 8,
  },
  bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
  nextBtnWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#1F5AFB' : '#808080',
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    };
	},
  textInputStyle: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    padding: 0,
    paddingBottom: 5,
    paddingTop: 5,
  },

});
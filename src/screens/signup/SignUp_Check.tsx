import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { commonStyle, styles } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, Platform, Text, Dimensions, TouchableOpacity } from 'react-native';
import { usePopup } from 'Context';
import { ROUTES } from 'constants/routes';
import { isEmptyData, calculateAge } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';


interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_Check'>;
  route: RouteProp<StackParamList, 'SignUp_Check'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Check = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const birthday = props.route.params?.birthday; // 생년월일
  const ci = props.route.params?.ci; // CI
  const name = props.route.params?.name; // 이름
  const gender = props.route.params?.gender; // 성별
  const mrktAgreeYn = props.route.params?.marketing_agree_yn; // 마케팅 정보 동의 여부
  const [age, setAge] = React.useState(function () { // 나이
    let birthDay = props.route.params?.birthday;
    let birthDate = birthDay.substring(0, 4) + '-' + birthDay.substring(4, 6) + '-' + birthDay.substring(6, 8);
    return calculateAge(birthDate);
  });
  const [mobile, setMobile] = React.useState( // 전화번호
    props.route.params?.mobile
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`)
  );

  // ########################################################### 다음 이동
  const goNext = async () => {
    navigation.navigate({
      name : ROUTES.SIGNUP_ID,
      params : {
        birthday: birthday,
        ci: ci,
        name: name,
        gender: gender,
        marketing_agree_yn: mrktAgreeYn,
        mobile: mobile,
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
                <Text style={styles.fontStyle('H', 28, '#fff')}>입력된 회원 정보가{'\n'}맞으신가요?</Text>
              </SpaceView>

              <SpaceView mt={50} viewStyle={_styles.contentWrap}>
                <SpaceView viewStyle={_styles.itemWrap}>
                  <Text style={styles.fontStyle('B', 14, '#808080')}>이름</Text>
                  <SpaceView mt={10} viewStyle={_styles.textWrap}><Text style={styles.fontStyle('B', 18, '#fff')}>{name}</Text></SpaceView>
                </SpaceView>
                <SpaceView viewStyle={_styles.itemWrap}>
                  <Text style={styles.fontStyle('B', 14, '#808080')}>나이/성별</Text>
                  <SpaceView mt={10} viewStyle={_styles.textWrap}><Text style={styles.fontStyle('B', 18, '#fff')}>만 {age}세/{gender === 'M' ? '남자' : '여자'}</Text></SpaceView>
                </SpaceView>
                <SpaceView viewStyle={_styles.itemWrap}>
                  <Text style={styles.fontStyle('B', 14, '#808080')}>전화번호</Text>
                  <SpaceView mt={10} viewStyle={_styles.textWrap}><Text style={styles.fontStyle('B', 18, '#fff')}>{mobile}</Text></SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </SpaceView>

        </SpaceView>

        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity
            onPress={() => { goNext(); }}
            style={_styles.nextBtnWrap(true)}>
            <Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
            <SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
          </TouchableOpacity>
        </SpaceView>
      </SpaceView>
    </>
  );
};


const _styles = StyleSheet.create({
  wrap: {
    flex: 1,
    height: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
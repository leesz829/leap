import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { commonStyle, styles } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, Platform, Text, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, MEMBER_NICKNAME_DUP } from 'constants/reusltcode';
import { join_save_profile_nickname, get_member_introduce_guide } from 'api/models';
import { ROUTES } from 'constants/routes';
import { isEmptyData } from 'utils/functions';
import { TextInput, TouchableWithoutFeedback } from 'react-native-gesture-handler';


/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 닉네임과 한줄소개
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_Nickname'>;
  route: RouteProp<StackParamList, 'SignUp_Nickname'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Nickname = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const isFocus = useIsFocused();
  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  const memberSeq = props.route.params?.memberSeq; // 회원 번호
  const gender = props.route.params?.gender; // 성별
  const mstImgPath = props.route.params?.mstImgPath; // 대표 사진 경로

  const [nickname, setNickname] = React.useState('');	// 닉네임
	const [comment, setComment] = React.useState(''); // 한줄 소개


  // ############################################################ 회원 소개 정보 조회
	const getMemberIntro = async() => {
		const body = {
			member_seq : memberSeq
		};
		try {
			const { success, data } = await get_member_introduce_guide(body);
			if(success) {
				switch (data.result_code) {
				case SUCCESS:
          setNickname(data?.member?.nickname);
          setComment(data?.member?.comment);

					break;
				default:
					show({ content: '오류입니다. 관리자에게 문의해주세요.' });
					break;
				}
			} else {
				show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			}
		} catch (error) {
			console.log(error);
		} finally {
			
		}
	};

  // ############################################################################# 저장 함수
  const saveFn = async () => {

    let special_pattern = /[^a-zA-Z0-9ㄱ-힣]/g;

		if(!isEmptyData(nickname) || !nickname.trim()) {
			show({ content: '닉네임을 입력해 주세요.' });
			return;
		}

		if(nickname.length > 12 || special_pattern.test(nickname) == true) {
			show({ content: '한글, 영문, 숫자 12글자까지 입력할 수 있어요.' });
			return;
		}

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      const body = {
        member_seq: memberSeq,
        nickname: nickname,
      };
      try {
        const { success, data } = await join_save_profile_nickname(body);
        if (success) {
          switch (data.result_code) {
            case SUCCESS:
              navigation.navigate(ROUTES.SIGNUP_COMMENT, {
                memberSeq: memberSeq,
                gender: gender,
                mstImgPath: mstImgPath,
                nickname: nickname,
              });
              break;
            case MEMBER_NICKNAME_DUP:
                show({ content: '이미 사용하고 있는 닉네임 입니다.'});
                break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.' });
              break;
          }
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      };
    }
  };


  // ############################################################ 키패드 핸들러
  const keyBoardHandle = () => {
    if(isKeyboardVisible) {
      Keyboard.dismiss();
    };
  };

  // ############################################################ 최초 실행
	React.useEffect(() => {
    if(isFocus) {
      getMemberIntro();
    };

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    }
		
	}, [isFocus]);

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView>

          {/* ########################################################################################## HEADER */}
          <SpaceView>
            <CommonHeader title="" />
          </SpaceView>

          <SpaceView>
            <TouchableWithoutFeedback onPress={() => { keyBoardHandle(); }}>
              <SpaceView mt={50}>
                <Text style={styles.fontStyle('H', 28, '#fff')}>닉네임 설정하기</Text>
                <SpaceView mt={10}>
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>한글,영문,숫자 포함 12글자 허용</Text>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={50}>
                <TextInput
                  value={nickname}
                  onChangeText={(text) => setNickname(text)}
                  autoCapitalize={'none'}
                  style={[_styles.textInputStyle, styles.fontStyle('B', 28, '#fff')]}
                  maxLength={12}
                  placeholder={'닉네임을 입력해 주세요.'}
                  placeholderTextColor={'#808080'}
                />
              </SpaceView>
            </TouchableWithoutFeedback>
          </SpaceView>
        </SpaceView>
        
        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity 
            disabled={!nickname}
            onPress={() => { saveFn(); }}
            style={_styles.nextBtnWrap(nickname)}>
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
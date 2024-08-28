import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ScreenNavigationProp, StackParamList } from '@types';
import { commonStyle, styles } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, Platform, Text, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, } from 'constants/reusltcode';
import { join_save_profile_message, get_member_introduce_guide } from 'api/models';
import { ROUTES } from 'constants/routes';
import { isEmptyData } from 'utils/functions';
import { TouchableWithoutFeedback, TextInput } from 'react-native-gesture-handler';


/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 프로필 메시지
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_Comment'>;
  route: RouteProp<StackParamList, 'SignUp_Comment'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Comment = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const isFocus = useIsFocused();
  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부

  const memberSeq = props.route.params?.memberSeq; // 회원 번호
  const nickname = props.route.params?.nickname; // 성별
  const gender = props.route.params?.gender; // 성별
  const mstImgPath = props.route.params?.mstImgPath; // 대표 사진 경로

	const [comment, setComment] = React.useState(''); // 한줄 소개
  const [introduceComment, setIntroduceComment] = React.useState(''); // 소개

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);


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
          setComment(data?.member?.comment);
          setIntroduceComment(data?.add_info?.introduce_comment);

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
		if(!isEmptyData(comment) || !comment.trim()) {
			show({ content: '한줄 소개를 입력해 주세요.' });
			return;
		}

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      const body = {
        member_seq: memberSeq,
        comment: comment,
        introduce_comment: introduceComment,
      };
      try {
        const { success, data } = await join_save_profile_message(body);
        if (success) {
          switch (data.result_code) {
            case SUCCESS:
              navigation.navigate(ROUTES.SIGNUP_ADDINFO, {
                memberSeq: memberSeq,
                gender: gender,
                mstImgPath: mstImgPath,
                nickname: nickname,
              });
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
    }
    
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
                <Text style={styles.fontStyle('H', 28, '#fff')}>프로필 메시지</Text>
                <SpaceView mt={10}>
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>한줄소개로 간단한 프로필 인사말을, 프로필 소개로 확실하게 프로필 작성</Text>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={50}>
                
                <SpaceView>
                  <Text style={styles.fontStyle('EB', 16, '#fff')}>한줄소개(필수)</Text>
                  <SpaceView mt={8}>
                    <TextInput
                      value={comment}
                      onChangeText={(text) => setComment(text)}
                      autoCapitalize={'none'}
                      multiline={true}
                      numberOfLines={2}
                      style={[_styles.textInputMultiStyle(70), styles.fontStyle('B', 12, '#fff')]}
                      placeholder={'"한줄 소개는 최대 30글자\n중앙 정렬 2줄 허용"'}
                      placeholderTextColor={'#fff'}
                      maxLength={50}
                      caretHidden={true}
                      textAlignVertical={'top'}
                      returnKeyType="done"
                    />
                  </SpaceView>
                </SpaceView>
                <SpaceView mt={30}>
                  <Text style={styles.fontStyle('EB', 16, '#fff')}>프로필 소개(권장)</Text>
                  <SpaceView mt={8}>
                    <TextInput
                      value={introduceComment}
                      onChangeText={(text) => setIntroduceComment(text)}
                      autoCapitalize={'none'}
                      multiline={true}
                      numberOfLines={6}
                      style={[_styles.textInputMultiStyle(120), styles.fontStyle('B', 12, '#fff')]}
                      placeholder={'"프로필 소개로 글자 제한 수는 3000글자에서\n최대 300글자 표기. 6줄 표기까지 허용할 것으로 예상\n테스트 후 변경될 수 있음"'}
                      placeholderTextColor={'#fff'}
                      maxLength={3000}
                      caretHidden={true}
                      textAlignVertical={'top'}
                      returnKeyType="done"
                    />
                  </SpaceView>
                </SpaceView>
                
              </SpaceView>
            </TouchableWithoutFeedback>
          </SpaceView>
        </SpaceView>

        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity 
            disabled={!comment}
            onPress={() => { saveFn(); }}
            style={_styles.nextBtnWrap(comment)}>
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
  textInputMultiStyle: (_hegiht: number) => {
		return {
			width: '100%',
			height: _hegiht,
      borderWidth: 1,
      borderColor: '#303030',
			borderRadius: 5,
			textAlign: 'left',
      paddingHorizontal: 10,
		};
	},
});
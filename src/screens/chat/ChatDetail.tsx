import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform, FlatList, InputAccessoryView, KeyboardAvoidingView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import SpaceView from 'component/SpaceView';
import { CommonText } from 'component/CommonText';
import { ICON } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { usePopup } from 'Context';
import { CommonLoading } from 'component/CommonLoading';
import { STACK, ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';
import { TextInput } from 'react-native-gesture-handler';
import { CommonBtn } from 'component/CommonBtn';
import { commonStyle, layoutStyle, modalStyle } from 'assets/styles/Styles';
import { CommaFormat, isEmptyData, formatNowDate } from 'utils/functions';
import { update_chat_exit, report_matched_user, get_chat_room_list, get_common_code_list } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { Modalize } from 'react-native-modalize';
import { RadioCheckBox_3 } from 'component/RadioCheckBox_3';




/* ################################################################################################################
###################################################################################################################
###### 채팅
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'ChatDetail'>;
	route: RouteProp<StackParamList, 'ChatDetail'>;
}

const { width, height } = Dimensions.get('window');

export const ChatDetail = (props: Props) => {
  const navigation = useNavigation<StackScreenProp>();
  const { show } = usePopup(); // 공통 팝업
  const inputRef = React.useRef();
  const isFocus = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const propsData = props?.route?.params;

	const memberBase = useUserInfo();
  const webSocket = useRef(null);
  const [chatData, setChatData] = useState([]); // 채팅 데이터
  const [messagesList, setMessagesList] = useState([]); // 메세지 목록
  const [messageText, setMessageText] = useState(''); // 메세지 입력
  const [roomData, setRoomData] = useState([]); // 채팅방 데이터
  const [reportData, setReportData] = useState<any>({
    report_code_list: [],
  }); // 신고 회원 데이터
    
  const nowDt = formatNowDate().substring(8, 12).replace(/(\d{2})(\d{2})/, '$1:$2'); // 현재 시간

  const scrollViewRef = useRef<ScrollView | null>(null);
  // 방 입장 시 스크롤 맨아래로 이동
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // ######################################################################################## 신고 코드 조회
  const getReportCodeList = async () => {
    try {

      const body = {
        group_code: 'DECLAR',
      };

      const  { success, data } = await get_common_code_list(body);
      
      if (success) {
        if (data.result_code == '0000') {

          const formattedData = data.code_list.map(item => ({
            label: item.code_name,
            value: item.common_code,
          }));

          // 데이터 구성
          setReportData({
            report_code_list: formattedData,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // 선택된 신고하기 타입
  const [checkReportType, setCheckReportType] = useState('');

  // 신고 Pop
  const report_modalizeRef = useRef<Modalize>(null);
  const report_onOpen = () => {
    report_modalizeRef.current?.open();
    setCheckReportType('');
  };

  const report_onClose = () => {
    report_modalizeRef.current?.close();
    setCheckReportType('');
  };

  // ############################################################ 사용자 신고하기 - 신고사유 체크 Callback 함수
  const reportCheckCallbackFn = (value: string) => {
    setCheckReportType(value);
  };

  // ############################################################ 사용자 신고하기 - 팝업 활성화
  const popupReport = () => {
    if (!checkReportType) {
      show({ content: '신고항목을 선택해주세요.' });
      return false;
    } else {
      show({
        title: '사용자 신고하기',
        content: '해당 사용자를 신고하시겠습니까?',
        type: 'REPORT',
        cancelCallback: function() {
          report_onClose();
        },
        confirmCallback: async function() {
          insertReport();
        },
        cancelBtnText: '취소 할래요!',
        confirmBtnText: '신고할래요!',
      });
    }
  };

  // ############################################################ 사용자 신고하기 등록
  const insertReport = async () => {
    
    const body = {
      report_type_code: checkReportType,
      report_member_seq: data.match_member_info.member_seq,
    };
    
    try {
      const { success, data } = await report_matched_user(body);

      if(success) {
        if (data.result_code != '0000') {
          console.log(data.result_msg);
          return false;
        }

        show({ 
          content: '신고 처리 되었습니다.',
          confirmCallback : function() {
            navigation.goBack();
          }
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };
  
  // 10자리의 난수 생성 함수
  const randomNumber = () => {
    let randomNumber = '';
    for (let i = 0; i < 10; i++) {
      randomNumber += Math.floor(Math.random() * 10);
    }

    return randomNumber;
  };

  // ######################################################################################## 초기 실행 함수
  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  useEffect(() => {
    if(isFocus) {
      // 신고 코드 목록 조회
      getReportCodeList();
      // 채팅방 조회
      getChatRoomList();

      //webSocket.current = new WebSocket(`ws://192.168.1.13:9915/ws/chat`);
      webSocket.current = new WebSocket(`ws://221.146.13.175:9915/ws/chat`);

      webSocket.current.onopen = e => {
        console.log('Connected to the server');

        // 채팅방 입장
        webSocket.current.send(JSON.stringify(
          { 
            message_type: "ENTER",
            chat_room_id: propsData?.chat_room_id ? propsData?.chat_room_id : randomNumber(),
            chat_room_seq: propsData?.chat_room_seq,
            chat_type: propsData?.chat_type,
            match_seq: propsData?.match_seq,
            member_seq: memberBase?.member_seq,
            note: "프로필 열람 채팅방",
          })
        );
      };
      
      webSocket.current.onmessage = e => {
        console.log('a message was received', e.data);

        const data = JSON.parse(e.data);
        setRoomData(data);

        if(data?.message_type == 'ENTER') {
          // 이전 메세지 조회
          setMessagesList(data?.sch_message_list);
        }else if(data?.message_type == 'TALK') {
          // 새로운 메세지 등록
          setMessagesList(prevMessages => [...prevMessages, data]);
        }
      };

      webSocket.current.onerror = e => {
        console.log('an error occurred', e.message);
      };
    
      webSocket.current.onclose = e => {
        console.log('connection closed', e.code, e.reason);
      };

      return () => {
        // 웹소켓 연결 끊기
        webSocket.current.close();
      };
    }
  }, [isFocus]);

  // 메세지 전송
  const sendMessage = () => {
    let talkMsg = JSON.stringify(
      {
        message_type: "TALK",
        chat_room_id: roomData?.chat_room_id,
        chat_room_seq: roomData?.chat_room_seq,
        chat_member_seq: roomData?.chat_member_seq,
        member_seq: memberBase?.member_seq,
        message: messageText,
        view_yn: 'Y',
        note: "채팅 설명",
      });

    webSocket.current.send(talkMsg);
    setMessageText('');
  };

  // ############################################################################# 채팅방 목록 조회
  const getChatRoomList = async () => {
    try {
      setIsLoading(true);

      const body = {
        member_seq: memberBase?.member_seq,
        chat_room_seq: propsData?.chat_room_seq,
      };

      const { success, data } = await get_chat_room_list(body);

      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setChatData(data?.chat_room_list);
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
      setIsLoading(false);
    }
  };

	// ###################################################################### 방 나가기 처리
	const exitChat = async () => {
    const body = {
      member_seq: memberBase?.member_seq,
      chat_room_seq: roomData?.chat_room_seq,
      chat_room_status: 'CHAT_UNACTIVE',
      chat_member_seq: roomData?.chat_member_seq,
      chat_member_status: 'EXIT',
      view_yn: 'N',
      sch_member_seq: propsData?.sch_member_seq,
    };

		const { success, data } = await update_chat_exit(body);
		if(success) {
			switch (data.result_code) {
				case SUCCESS:
          navigation.canGoBack() && navigation.goBack();
          webSocket.current.close();
				break;
				default:
					show({ content: '오류입니다. 관리자에게 문의해주세요.' });
				break;
			}
		
		} else {
			show({ content: '오류입니다. 관리자에게 문의해주세요.' });
		}
	};

  return (
    <>
      {/* <CommonHeader title={'채팅'} type={'CHAT_DETAIL'} callbackFunc={report_onOpen} /> */}

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.container}
      >

        <TouchableOpacity
          style={[layoutStyle.alignEnd, {marginBottom: 20}]}
          onPress={() => { exitChat(); }}
        >
          <SpaceView viewStyle={_styles.exitBtn}>
            <Text style={_styles.exitBtnText}>나가기</Text>
          </SpaceView>
        </TouchableOpacity>

        <ScrollView ref={scrollViewRef} style={{marginBottom: 200}}>
          {messagesList.map((message, index) => {
            const isSendUser = message?.chat_member_seq == memberBase?.member_seq || message?.member_seq == memberBase?.member_seq;
            
            return (
              <SpaceView key={index} viewStyle={_styles.msgListArea(isSendUser)}>
                <SpaceView viewStyle={_styles.msgListBox(isSendUser)}>
                  <Text style={_styles.msgListText(isSendUser)}>{message?.message}</Text>
                </SpaceView>
                <Text style={_styles.msgListTime}>{ message?.reg_dt ? message?.reg_dt : nowDt }</Text>
              </SpaceView>
            );
          })}

          {chatData[0]?.status == 'CHAT_UNACTIVE' &&
            <SpaceView mt={30}>
              <Text style={_styles.exitNotiText}>상대방이 퇴장하였습니다.</Text>
            </SpaceView>
          }

          {Platform.OS == 'ios' ? (
            <>
              <InputAccessoryView>
                <SpaceView>
                  <TextInput
                    ref={inputRef}
                    value={messageText}
                    onChangeText={(text) => setMessageText(text)}
                    multiline={true}
                    textAlignVertical={'top'}
                    autoCapitalize={'none'}
                    style={_styles.regiContainer}
                    placeholder={'메세지를 입력해 주세요.'}
                    placeholderTextColor={'#c7c7c7'}
                    editable={chatData[0]?.status == 'CHAT_UNACTIVE' ? false : true}
                    secureTextEntry={false}
                    maxLength={150}
                    autoFocus={true}
                  />
                  <TouchableOpacity
                    onPress={sendMessage} disabled={messageText == ''}
                    style={_styles.regiBtn}
                    hitSlop={commonStyle.hipSlop30}>
                    <Text style={_styles.regiText}>등록</Text>
                  </TouchableOpacity>
                </SpaceView>
              </InputAccessoryView>
            </>
          ) : (
            <SpaceView>
              <TextInput
                ref={inputRef}
                value={messageText}
                onChangeText={(text) => setMessageText(text)}
                multiline={true}
                textAlignVertical={'top'}
                autoCapitalize={'none'}
                style={_styles.regiContainer}
                placeholder={'메세지를 입력해 주세요.'}
                placeholderTextColor={'#c7c7c7'}
                editable={chatData[0]?.status == 'CHAT_UNACTIVE' ? false : true}
                secureTextEntry={false}
                maxLength={150}
                autoFocus={true}
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={_styles.regiBtn}
                hitSlop={commonStyle.hipSlop30}>
                <Text style={_styles.regiText}>등록</Text>
              </TouchableOpacity>
            </SpaceView>
          )}
        </ScrollView>
      </LinearGradient>


      {/* ##################################################################################
                    사용자 신고하기 팝업
        ################################################################################## */}
      <Modalize
        ref={report_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        /* modalStyle={[modalStyle.modalContainer, {borderRadius: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50}]} */
        modalStyle={{borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#333B41'}}
        modalHeight={550}
        scrollViewProps={{
          scrollEnabled: false, // 스크롤 비활성화
        }}
        FooterComponent={
          <>
            <SpaceView pl={25} pr={25} pb={65} viewStyle={{backgroundColor: '#333B41'}}>
              <SpaceView mb={10}>
                <TouchableOpacity onPress={popupReport} style={_styles.reportBtnArea('#FFDD00', '#FFDD00')}>
                  <Text style={_styles.reportBtnText('#3D4348')}>신고 및 차단하기</Text>
                </TouchableOpacity>
              </SpaceView>

              <SpaceView>
                <TouchableOpacity onPress={report_onClose} style={_styles.reportBtnArea('#333B41', '#BBB18B')}>
                  <Text style={_styles.reportBtnText('#D5CD9E')}>취소</Text>
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>
          </>
        }
      >
        <SpaceView viewStyle={{backgroundColor: '#333B41'}}>
          <SpaceView mt={25} ml={30}>
            <Text style={_styles.reportTitle}>사용자 신고 및 차단하기</Text>
          </SpaceView>

          <View style={[modalStyle.modalBody, {paddingBottom: 0, paddingHorizontal: 0}]}>
            <SpaceView mt={15} mb={13} viewStyle={{borderBottomWidth: 1, borderColor: '#777777', paddingBottom: 15, paddingHorizontal: 25}}>
              <Text style={_styles.reportText}>신고사유를 알려주시면 더 좋은 리프를{'\n'}만드는데 도움이 됩니다.</Text>
            </SpaceView>

            <SpaceView>
              <RadioCheckBox_3 items={reportData.report_code_list} callBackFunction={reportCheckCallbackFn} />
            </SpaceView>
          </View>
        </SpaceView>
      </Modalize>
    </>
  );
};



const _styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: height,
  },
  exitBtn: {
    width: 50,
    height: 25,
    backgroundColor: 'rgba(225, 223, 209, 0.45)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  exitBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    color: 'yellow',
  },
  msgListArea: (isSendUser:boolean) => {
		return {
      alignSelf: isSendUser ? 'flex-end' : 'flex-start',
      marginBottom: 15,
      flexDirection: isSendUser ? 'row-reverse' : 'row',
		};
	},
  msgListTime: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 12,
    color: '#ddd',
    marginHorizontal: 8,
    alignSelf: 'flex-end', 
  },
  msgListBox: (isSendUser:boolean) => {
		return {
		  backgroundColor: isSendUser ? 'yellow' : 'skyblue',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 15,
      maxWidth: 200,
		};
	},
  msgListText: (isSendUser:boolean) => {
		return {
		  fontFamily: 'Pretendard-Bold',
		  fontSize: 16,
		  color: isSendUser ? 'blue' : 'black',
		};
	},
  regiContainer: {
    height: 60,
    paddingRight: 30,
    backgroundColor: '#5A707F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  regiBtn: {
    position: 'absolute',
    bottom: 3,
    right: 13,
  },
  regiText: {
    fontFamily: 'Pretendard-Bold',
    color: '#FFDD00',
  },
  exitNotiText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: 'rgba(225, 223, 209, 0.45)',
    textAlign: 'center',
  },

  // 신고하기 모달 css
  reportTitle: {
    fontFamily: 'Pretendard-ExtraBold',
		fontSize: 20,
		color: '#D5CD9E',
		textAlign: 'left',
  },
  reportButton: {
    height: 43,
    borderRadius: 21.5,
    backgroundColor: '#363636',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginTop: 20,
  },
  reportTextBtn: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  reportText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
    color: '#E1DFD1',
    textAlign: 'left',
  },
  reportBtnArea: (bg:number, bdc:number) => {
		return {
			/* width: '50%',
			height: 48, */
			backgroundColor: bg,
			alignItems: 'center',
			justifyContent: 'center',
      borderWidth: 1,
      borderColor: bdc,
      borderRadius: 5,
      paddingVertical: 13,
		}
	},
  reportBtnText: (cr:string) => {
		return {
		  fontFamily: 'Pretendard-Bold',
		  fontSize: 16,
		  color: isEmptyData(cr) ? cr : '#fff',
		};
	},
});
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform, FlatList, InputAccessoryView, KeyboardAvoidingView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
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
import { commonStyle } from 'assets/styles/Styles';
import { CommaFormat, isEmptyData, formatNowDate } from 'utils/functions';



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
  const inputRef = React.useRef();

	const memberBase = useUserInfo();
  const webSocket = useRef(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  const scrollViewRef = useRef<ScrollView | null>(null);
  let nowDt = formatNowDate().substring(8, 12).replace(/(\d{2})(\d{2})/, '$1:$2');

  // 방 입장 시 스크롤 맨아래로 이동
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // 10자리의 난수 생성 함수
  function randomNumber() {
    let randomNumber = '';
    for (let i = 0; i < 10; i++) {
      randomNumber += Math.floor(Math.random() * 10);
    }
    return randomNumber;
  }

// ######################################################################################## 초기 실행 함수
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    webSocket.current = new WebSocket(`ws://192.168.1.6:9915/ws/chat`)

    webSocket.current.onopen = e => {
      console.log('Connected to the server');

      // 채팅방 입장
      webSocket.current.send(JSON.stringify(
        { 
          message_type: "ENTER",
          chat_room_id: props?.route?.params.chat_room_id ? props?.route?.params.chat_room_id : randomNumber(),
          chat_room_seq: props?.route?.params.chat_room_seq,
          match_seq: props?.route?.params.match_seq,
          member_seq: memberBase?.member_seq,
          note: "매칭 성공자 채팅방",
        })
      );
    };
  
    webSocket.current.onmessage = e => {
      console.log('a message was received', e.data);

      const data = JSON.parse(e.data);

      if(data?.message_type == 'ENTER') {
        // 이전 메세지 조회
        setMessages(data?.sch_message_list);
      }else {
        // 새로운 메세지 등록
        setMessages(prevMessages => [...prevMessages, data]);
      }
    };

    webSocket.current.onerror = e => {
      console.log('an error occurred', e.message);
    };
  
    webSocket.current.onclose = e => {
      console.log('connection closed', e.code, e.reason);
    };
  
    return () => {
      webSocket.current.close();
    };
  }, []);


  // 메세지 전송
  const sendMessage = () => {
    let msg = JSON.stringify(
      {
        message_type: "TALK",
        chat_room_id: props?.route?.params.chat_room_id,
        chat_room_seq: props?.route?.params.chat_room_seq,
        member_seq: memberBase?.member_seq,
        message: messageText,
        note: "채팅 설명",
      });
    webSocket.current.send(msg);
    setMessageText('');
  };

  return (
    <>
      <CommonHeader title={'채팅'} />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.container}
      >
        <ScrollView ref={scrollViewRef} style={{marginBottom: 200}}>
          {messages.map((message, index) => {
            const isSendUser = message?.chat_member_seq == memberBase?.member_seq || message?.member_seq == memberBase?.member_seq;
            
            return (
              <SpaceView key={index} viewStyle={_styles.msgListArea(isSendUser)}>
                <SpaceView viewStyle={_styles.msgListBox(isSendUser)}>
                  <Text style={_styles.msgListText(isSendUser)}>{message?.message}</Text>
                </SpaceView>
                <Text style={_styles.msgListTime}>{message?.reg_dt ? message?.reg_dt : nowDt}</Text>
              </SpaceView>
            );
          })}

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
                    editable={true}
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
                editable={true}
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
  regiBtn: {
    position: 'absolute',
    bottom: 3,
    right: 13,
  },
  regiText: {
    fontFamily: 'Pretendard-Bold',
    color: '#FFDD00',
  },
});
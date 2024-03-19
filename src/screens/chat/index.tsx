import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform, FlatList, InputAccessoryView } from 'react-native';
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
import { commonStyle, styles, layoutStyle, modalStyle } from 'assets/styles/Styles';
import { get_chat_room_list, update_chat_exit } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';



/* ################################################################################################################
###################################################################################################################
###### 채팅
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'Chat'>;
	route: RouteProp<StackParamList, 'Chat'>;
}

const { width, height } = Dimensions.get('window');

export const Chat = (props: Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const [isLoading, setIsLoading] = useState(false);
  const [chatData, setChatData] = useState([]);
  const isFocus = useIsFocused();
  const { show } = usePopup(); // 공통 팝업

  const memberBase = useUserInfo();

  // ############################################################################# 채팅방 목록 조회
  const getChatRoomList = async () => {
    try {
      setIsLoading(true);

      const body = {
        member_seq: memberBase?.member_seq,
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

  // ############################################################################# 채팅방 상세 이동
  const goChatDetail = async (item) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'ChatDetail',
      params: {
        match_seq: item?.match_seq,
        chat_room_id: item?.chat_room_id,
        chat_room_seq: item?.chat_room_seq,
        chat_member_seq: item?.chat_member_seq,
        chat_room_status: item?.chat_room_status,
        sch_member_seq: item?.res_member_seq == memberBase?.member_seq ? item?.req_member_seq : item?.res_member_seq,
      }
    });
  };

  // ######################################################################################## 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      getChatRoomList();
    }
  }, [isFocus]);


  return (
    <>
      <CommonHeader title={'채팅'} />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.container}
      >

        <ScrollView style={{marginBottom: 200}}>
          <SpaceView viewStyle={_styles.chatRoomList}>
            {chatData.map((item, index) => {
              // 채팅방 유효기한
              const expDate = formatNowDate() < item?.end_chat_room_dt;
              // 비활성화 회원 메세지 받을 시 노출
              const exitMember = item?.chat_member_status == 'EXIT' && item?.message && item?.status == 'CHAT_ACTIVE';
              // 활성화 회원
              const joinMember = item?.chat_member_status == 'JOIN';
              // 비입장 회원 메세지 받을 시 노출
              const recevieMsg = !item?.chat_member_status && item?.message;
              
              return (
                <>
                  {expDate && (joinMember || recevieMsg || exitMember) &&
                    <TouchableOpacity
                      key={index}
                      style={_styles.chatRoomBox}
                      onPress={() => {
                        goChatDetail(item);
                    }}>
                      <SpaceView viewStyle={{flex: 1}}>
                        <SpaceView viewStyle={_styles.chatMemberImg}>
                          <Image source={findSourcePath(item?.enter_gubun == 'REQ' ? item?.req_img_path : item?.res_img_path)} style={styles.iconSquareSize(50)} resizeMode={'cover'} />
                        </SpaceView>
                      </SpaceView>

                      <SpaceView viewStyle={{flex: 1}}>
                        <Text style={_styles.chatRoomText}>{item?.enter_gubun == 'RES' ? item?.req_nickname : item?.res_nickname}</Text>
                      </SpaceView>
                      <SpaceView viewStyle={{flex: 1}}>
                        <Text style={_styles.chatRoomText} numberOfLines={1} ellipsizeMode="tail">{item?.message ? item?.message : '메세지가 없습니다.'}</Text>
                      </SpaceView>
                    </TouchableOpacity>
                  }
                </>
              );
            })}
          </SpaceView>
        </ScrollView>
      </LinearGradient>
    </>
  );
};



const _styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    minHeight: height,
  },
  chatRoomList: {
    width: '100%',
    height: height,
  },
  chatRoomBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 80,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: 'rgba(225, 223, 209, 0.45)',
    borderBottomColor: 'rgba(225, 223, 209, 0.45)',
  },
  chatRoomText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#FFF',
  },
  chatMemberImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
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
});
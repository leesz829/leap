import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import { Watermark } from 'component/Watermark';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSpring, withSequence, withDelay, Easing, withRepeat, interpolate, Extrapolate, cancelAnimation, stopClock } from 'react-native-reanimated';
import { ROUTES, STACK } from 'constants/routes';
import Modal from 'react-native-modal';
import { CommonTextarea } from 'component/CommonTextarea';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { story_reply_save } from 'api/models';
import { isEmptyData } from 'utils/functions';
import { SUCCESS, NODATA } from 'constants/reusltcode';
import { useProfileImg } from 'hooks/useProfileImg';



interface Props {
  isVisible: boolean;
  storyBoardSeq: number;
  storyReplySeq: number;
  depth: number;
  callbackFunc: (isRegi:boolean) => void;
}

const { width, height } = Dimensions.get('window');

export default function ReplyRegiPopup({ isVisible, storyBoardSeq, storyReplySeq, depth, callbackFunc }: Props) {

  const mbrProfileImgList = useProfileImg(); // 회원 프로필 이미지 목록

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const [inputReplyText, setInputReplyText] = React.useState(''); // 댓글 입력 텍스트

  const closeMoadal = async () => {
    setInputReplyText('');
    callbackFunc(false);
  };

  // ############################################################################# 댓글 등록
  const replyRegister = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {

        if(!isEmptyData(inputReplyText)) {
          //show({ content: '댓글 내용을 입력해 주세요.' });
          return false;
        };
    
        const body = {
          story_reply_seq: null,
          story_board_seq: storyBoardSeq,
          reply_contents: inputReplyText,
          group_seq: storyReplySeq,
          depth: depth+1,
        };

        console.log('body :::::: ' , body);

        const { success, data } = await story_reply_save(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            /* navigation.navigate(STACK.TAB, {
              screen: 'Story',
            }); */

            callbackFunc(true);
            
            break;
          default:
            //show({ content: '오류입니다. 관리자에게 문의해주세요.' });
            break;
          }
        } else {
          //show({ content: '오류입니다. 관리자에게 문의해주세요.' });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      }

    }
  };



  return (
    <>
      <Modal 
        isVisible={isVisible} 
        style={_styles.replyModalWrap}
        //onSwipeComplete={toggleModal}
        onBackdropPress={() => { closeMoadal() }}
        //swipeDirection="down" // 아래 방향으로 스와이프
        //propagateSwipe={true}
        onRequestClose={() => { closeMoadal() }}>

        <SpaceView viewStyle={_styles.modalWrap}>
          <SpaceView viewStyle={_styles.inputArea}>
            <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.memberImageStyle} resizeMode={'cover'} />

            <CommonTextarea
              value={inputReplyText}
              onChangeText={(inputReplyText) => setInputReplyText(inputReplyText)}
              placeholder={'댓글을 입력해 주세요.'}
              placeholderTextColor={'#C7C7C7'}
              maxLength={200}
              exceedCharCountColor={'#990606'}
              fontSize={12}
              height={60}
              backgroundColor={'#F6F7FE'}
              fontColor={'#000'}
              style={_styles.replyTextStyle}
            />

            <TouchableOpacity
              onPress={() => { replyRegister(); }}
              style={_styles.btnArea}>
              <Text style={_styles.regiText}>등록</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>

      </Modal>
    </>
  );

}




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  replyModalWrap: {
    flex: 1,
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalWrap: {
    backgroundColor: '#fff',
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  memberImageStyle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 15,
  },
  replyTextStyle: {
    width: width - 100,
    height: 50,
    borderWidth: 1,
    borderColor: '#EBE9EF',
    paddingRight: 30,
  },
  btnArea: {
    position: 'absolute',
    bottom: 3,
    right: 13,
  },
  regiText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    color: '#8E9AEB',
  },

});
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView, InputAccessoryView, TextInput, Keyboard, Pressable, ScrollView } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { useProfileImg } from 'hooks/useProfileImg';
import { Modalize } from 'react-native-modalize';
import { isEmptyData } from 'utils/functions';
import Modal from 'react-native-modal';



/* ################################################################################################################
###################################################################################################################
###### 팝업 - 댓글 관리 화면
###################################################################################################################
################################################################################################################ */

interface Props {
  isVisible: boolean;
  storyBoardSeq: number;
  storyReplySeq: number;
  depth: number;
  isSecret: boolean;
  callbackFunc: (isRegi:boolean) => void;
}

const { width, height } = Dimensions.get('window');


const ReplyRegiPopup = forwardRef((props, ref) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { replyList, likeFn, replyRegisterFn } = props;

  // 본인 데이터
  const memberBase = useUserInfo();

  // 부모 컴포넌트 handle
  useImperativeHandle(ref, () => ({
    openModal: (seq:any) => {
      //console.log('type :::::: ' , type);
      //getStoryLikeList(type, seq);
      //modalizeRef.current?.open();
      popup_onOpen();
    },
    closeModal: () => {
      //modalizeRef.current?.close();
      popup_onClose();
    },
  }));

  // 팝업 활성화
  const popup_onOpen = () => {
    setIsModalVisible(true);
  }

  // 팝업 닫기
  const popup_onClose = () => {
    setIsModalVisible(false);
  };

  const mbrProfileImgList = useProfileImg(); // 회원 프로필 이미지 목록

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const [inputReplyText, setInputReplyText] = React.useState(''); // 댓글 입력 텍스트

  // 선택한 댓글
  const [selectReply, setSelectReply] = React.useState({
    story_replay_seq: 0,
    depth: 0,
  });

  const inputRef = React.useRef();

  const onReply = async (replySeq:number, depth:number) => {
    console.log('replySeq ::::: ' , replySeq);
    console.log('depth ::::: ' , depth);

    setSelectReply({story_replay_seq: replySeq, depth: depth});
  };

  const [canSwipe, setCanSwipe] = useState(true); // 스와이프 가능 여부 관리

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // 스크롤이 끝에 도달했는지 확인
    if (contentOffset.y === 0) {
      setCanSwipe(true); // 스크롤이 맨 위에 있을 때만 스와이프 가능
    } else if (contentOffset.y + layoutMeasurement.height >= contentSize.height) {
      setCanSwipe(true); // 스크롤이 맨 아래에 있을 때도 스와이프 가능
    } else {
      setCanSwipe(false); // 스크롤 중간에서는 스와이프 비활성화
    }
  };

  // ############################################################################# 댓글 등록
  const replyRegister = async () => {
    replyRegisterFn(inputReplyText, selectReply.story_replay_seq, selectReply.depth);
  };



  // ############################################################################# 댓글 렌더링
  const ReplyRender = ({ item, index, likeFunc, replyModalOpenFunc }) => {
    const memberMstImgPath = findSourcePath(item?.mst_img_path); // 회원 대표 이미지 경로
    const storyReplySeq = item?.story_reply_seq; // 댓글 번호
    const depth = item?.depth;
    const gender = item?.gender; // 성별
    const secretYn = item?.secret_yn; // 비밀 여부

    // 영역 사이즈 설정
    let _w = width - 73;
    let depthStyleSize = 0;

    if(depth == 2) {
      _w = _w - 15;
      depthStyleSize = 15;
    }

    // 비밀 댓글 노출
    let isApplySecret = false;
    /* if(secretYn == 'Y') {
      if(memberBase?.member_seq != storyData.board?.member_seq && memberBase?.member_seq != item?.member_seq) {
        isApplySecret = true;
      }
    }; */

    // 노출 대표 이미지
    let applyMsgImg = findSourcePath(item?.mst_img_path);
    /* if(storyData.board?.story_type == 'SECRET' || isApplySecret || (storyData.board?.member_seq == item?.member_seq && storyData.board?.secret_yn == 'Y')) {
      applyMsgImg = gender == 'M' ? ICON.storyMale : ICON.storyFemale;
    }; */

    if(gender == 'M') {
      applyMsgImg = ICON.story_man01;
    } else {
      applyMsgImg = ICON.story_woman02;
    }

    // 노출 닉네임
    let applyNickname = item?.nickname;
    /* if(isApplySecret) {
      applyNickname = '비밀글';
    } else {
      if(storyData.board?.member_seq == item?.member_seq && storyData.board?.secret_yn == 'Y') {
        applyNickname = item?.nickname_modifier + ' ' + item?.nickname_noun;
      }
    }; */

    if(isEmptyData(item?.nickname_modifier)) {
      applyNickname = item?.nickname_modifier + ' ' + item?.nickname_noun;
    } else {
      applyNickname = '닉네임없음';
    }

    return (
      <>
        <SpaceView mt={20}>
          <SpaceView ml={depthStyleSize} viewStyle={_styles.replyItemTopArea}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-start'}}>

              {/* 썸네일 */}
              <SpaceView>
                <TouchableOpacity 
                  style={_styles.replyImgCircle(depth == 0 ? 30 : 30)}
                  //disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq || storyData.board?.story_type == 'SECRET' || isApplySecret}
                  onPress={() => { /* profileCardOpenPopup(item?.member_seq, item?.open_cnt, false); */ }}
                >
                  <Image source={applyMsgImg} style={styles.iconSquareSize(depth == 0 ? 30 : 30)} resizeMode={'cover'} />
                </TouchableOpacity>
                {/* {memberBase?.member_seq === item?.member_seq && (
                  <SpaceView viewStyle={_styles.myReplyChk}>
                    <Image source={gender == 'M' ? ICON.maleIcon : ICON.femaleIcon} style={styles.iconSquareSize(13)} resizeMode={'cover'} />
                  </SpaceView>
                )} */}
              </SpaceView>

              <SpaceView ml={10} pt={3} viewStyle={{flexDirection: 'column', width: _w}}>

                {/* 닉네임 영역 */}
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>{applyNickname}</Text>
                  {/* <Text style={[_styles.replyTimeText, {justifyContent: 'center'}]}>{item.time_text}</Text> */}

                  {/* 채택완료 노출 */}
                  {/* <SpaceView ml={5} viewStyle={_styles.badgeItemWrap}>
                    <Text style={styles.fontStyle('R', 8, '#FFFF5D')}>채택완료</Text>
                  </SpaceView> */}
                </SpaceView>

                {/* 댓글 내용 */}
                <SpaceView mt={6} viewStyle={{ width: width - 90}}>
                  
                  <Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>
                    {
                      (isApplySecret) ? '게시글 작성자에게만 보이는 글입니다.' : (item.del_yn == 'Y') ? '삭제된 댓글입니다.' : item.reply_contents
                    }

                    {/* {(memberBase?.member_seq === item?.member_seq) && (item.del_yn == 'N') && (
                      <TouchableOpacity style={{ paddingLeft: 5, }} onPress={() => { replyDelPopupOpen(storyReplySeq); }}>
                        <Text style={styles.fontStyle('R', 8, '#FFFF5D')}>삭제</Text>
                      </TouchableOpacity>
                    )} */}
                  </Text>
                </SpaceView>

                {/* 버튼 영역 */}
                <SpaceView mt={23} viewStyle={_styles.replyItemEtcWrap}>

                  {/* 답글달기 버튼 */}
                  {depth == 1 && (
                    <>
                      <TouchableOpacity 
                        onPress={() => { 
                          onReply(storyReplySeq, depth);
                        }}
                      >
                        <Text style={styles.fontStyle('B', 12, '#fff')}>답글달기</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* 좋아요 버튼 */}
                  <SpaceView mt={3} viewStyle={{flexDirection: 'row'}}>
                    <TouchableOpacity 
                      onPress={() => { likeFunc('REPLY', storyReplySeq); }}
                      style={{marginRight: 6}} 
                      hitSlop={commonStyle.hipSlop20}>

                      {(item?.member_like_yn == 'N') ? (
                        <Image source={ICON.story_heartWhite} style={styles.iconSquareSize(14)} />
                      ) : (
                        <Image source={ICON.story_heartWhiteFill} style={styles.iconSquareSize(14)} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      //disabled={memberBase.member_seq != item?.member_seq}
                      disabled={true}
                      hitSlop={commonStyle.hipSlop10}
                      onPress={() => { /* popupStoryReplyActive(storyReplySeq, depth, item) */ }}>
                      <Text style={styles.fontStyle('SB', 12, '#fff')}>좋아요{item?.like_cnt > 0 && item?.like_cnt + '개'}</Text>
                    </TouchableOpacity>
                  </SpaceView>

                </SpaceView>
              </SpaceView>
            </SpaceView>

          </SpaceView>
        </SpaceView>
      </>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      setInputReplyText('');
      //this.textInputRef.current.focus();

      //inputRef.current?.focus();

      //Keyboard.show();    // 키보드를 다시 활성화합니다.

      if (inputRef.current) {
        //inputRef.current.focus();
      }

      return () => {
      };
    }, []),
  );

  return (
    <>
      {/* <Modalize
        ref={modalizeRef}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={_styles.modalWrap}
        modalHeight={height-150} 
        onOverlayPress={() => { popup_onClose(); }}
      >
        <SpaceView mt={25} viewStyle={{alignItems: 'center'}}>
          <View style={{backgroundColor: '#808080', borderRadius: 5, width: 35, height: 5}} />
        </SpaceView>

        <SpaceView mt={45}>
          <Text style={styles.fontStyle('H', 26, '#fff')}>댓글 {replyList?.length}개</Text>
        </SpaceView>

        <SpaceView mt={30}>
          <FlatList
            style={{height: height - 400, marginBottom: 50}}
            data={replyList}
            renderItem={({ item, index }) => {
              return (
                <SpaceView>
                  <ReplyRender item={item} index={index} likeFunc={likeFn} />
                </SpaceView>
              )
            }}
          />
        </SpaceView>

        <SpaceView viewStyle={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',}} onPress={()=> { popup_onClose(); }} />

          <ScrollView>
            {Platform.OS == 'ios' ? (
              <>
                <InputAccessoryView>
                  <SpaceView viewStyle={_styles.inputArea}>
                    <SpaceView viewStyle={_styles.replyImgCircle(30)}>
                      <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
                    </SpaceView>

                    <SpaceView viewStyle={_styles.replyInputWrap}>
                      <TextInput
                        ref={inputRef}
                        value={inputReplyText}
                        onChangeText={(text) => setInputReplyText(text)}
                        multiline={false}
                        textAlignVertical={'center'}
                        autoCapitalize={'none'}
                        style={[_styles.replyTextStyle, styles.fontStyle('SB', 12, '#CBCBCB')]}
                        placeholder={'댓글 내용을 입력해 주세요.'}
                        placeholderTextColor={'#606060'}
                        editable={true}
                        secureTextEntry={false}
                        maxLength={150}
                        autoFocus={true}
                      />

                      <TouchableOpacity
                        onPress={() => { replyRegister(); }}
                        style={_styles.replyBtnWrap}
                        hitSlop={commonStyle.hipSlop30}>
                        <Text style={styles.fontStyle('SB', 12, '#fff')}>전송</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </SpaceView>
                </InputAccessoryView>
              </>
            ) : (
              <>
                <SpaceView viewStyle={_styles.inputArea}>
                  <SpaceView viewStyle={_styles.replyImgCircle(30)}>
                    <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
                  </SpaceView>

                  <SpaceView viewStyle={_styles.replyInputWrap}>
                    <TextInput
                      ref={inputRef}
                      value={inputReplyText}
                      onChangeText={(text) => setInputReplyText(text)}
                      multiline={false}
                      textAlignVertical={'center'}
                      autoCapitalize={'none'}
                      style={[_styles.replyTextStyle, styles.fontStyle('SB', 12, '#CBCBCB')]}
                      placeholder={'댓글 내용을 입력해 주세요.'}
                      placeholderTextColor={'#606060'}
                      editable={true}
                      secureTextEntry={false}
                      maxLength={150}
                      autoFocus={true}
                    />

                    <TouchableOpacity
                      onPress={() => { replyRegister(); }}
                      style={_styles.replyBtnWrap}>
                      <Text style={styles.fontStyle('SB', 12, '#fff')}>전송</Text>
                    </TouchableOpacity>
                  </SpaceView>
                </SpaceView>
              </>
            )}
          </ScrollView>

        </SpaceView>

      </Modalize> */}


      <Modal
        isVisible={isModalVisible}
        style={_styles.modalWrap}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        //swipeDirection="down" // 아래로 스와이프하면 닫힘
        swipeDirection={canSwipe ? "down" : null} // 스크롤 위치에 따라 스와이프 가능 여부 설정
        propagateSwipe={true} // 스와이프 동작과 스크롤 동작이 겹치지 않도록 설정
        onSwipeComplete={popup_onClose} // 스와이프가 완료되면 모달 닫힘
        onBackdropPress={popup_onClose} // 배경을 터치해도 모달 닫기
      >
        <SpaceView viewStyle={{alignItems: 'center'}}>
          <View style={{backgroundColor: '#808080', borderRadius: 5, width: 35, height: 7}} />
        </SpaceView>

        <SpaceView mt={45}>
          <Text style={styles.fontStyle('H', 26, '#fff')}>댓글 {replyList?.length}개</Text>
        </SpaceView>

        <SpaceView mt={30}>
          <FlatList
            style={{height: height - 400, marginBottom: 50}}
            data={replyList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <SpaceView>
                  <ReplyRender item={item} index={index} likeFunc={likeFn} />
                </SpaceView>
              )
            }}
          />
        </SpaceView>

        <SpaceView>
          <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',}} onPress={()=> { popup_onClose(); }} />

          <ScrollView>
            {Platform.OS == 'ios' ? (
              <>
                <InputAccessoryView>
                  <SpaceView viewStyle={_styles.inputArea}>
                    <SpaceView viewStyle={_styles.replyImgCircle(30)}>
                      <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
                    </SpaceView>

                    <SpaceView viewStyle={_styles.replyInputWrap}>
                      <TextInput
                        ref={inputRef}
                        value={inputReplyText}
                        onChangeText={(text) => setInputReplyText(text)}
                        multiline={false}
                        textAlignVertical={'center'}
                        autoCapitalize={'none'}
                        style={[_styles.replyTextStyle, styles.fontStyle('SB', 12, '#CBCBCB')]}
                        placeholder={'댓글 내용을 입력해 주세요.'}
                        placeholderTextColor={'#606060'}
                        editable={true}
                        secureTextEntry={false}
                        maxLength={150}
                        autoFocus={true}
                      />

                      <TouchableOpacity
                        onPress={() => { replyRegister(); }}
                        style={_styles.replyBtnWrap}
                        hitSlop={commonStyle.hipSlop30}>
                        <Text style={styles.fontStyle('SB', 12, '#fff')}>전송</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </SpaceView>
                </InputAccessoryView>
              </>
            ) : (
              <>
                <SpaceView viewStyle={_styles.inputArea}>
                  <SpaceView viewStyle={_styles.replyImgCircle(30)}>
                    <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
                  </SpaceView>

                  <SpaceView viewStyle={_styles.replyInputWrap}>
                    <TextInput
                      ref={inputRef}
                      value={inputReplyText}
                      onChangeText={(text) => setInputReplyText(text)}
                      multiline={false}
                      textAlignVertical={'center'}
                      autoCapitalize={'none'}
                      style={[_styles.replyTextStyle, styles.fontStyle('SB', 12, '#CBCBCB')]}
                      placeholder={'댓글 내용을 입력해 주세요.'}
                      placeholderTextColor={'#606060'}
                      editable={true}
                      secureTextEntry={false}
                      maxLength={150}
                      autoFocus={true}
                    />

                    <TouchableOpacity
                      onPress={() => { replyRegister(); }}
                      style={_styles.replyBtnWrap}>
                      <Text style={styles.fontStyle('SB', 12, '#fff')}>전송</Text>
                    </TouchableOpacity>
                  </SpaceView>
                </SpaceView>
              </>
            )}
          </ScrollView>

        </SpaceView>
      </Modal>
    </>
  );
});




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  modalWrap: {
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden', 
    backgroundColor: '#1B1633',
    paddingHorizontal: 20,
    margin: 0,
    marginTop: 100,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  badgeItemWrap: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  replyBtnWrap: {
    position: 'absolute',
    bottom: 4,
    right: 3,
    backgroundColor: '#46F66F',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyImgCircle: (num:number) => {
    return {
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: '#fff',
      width: num,
      height: num,
      overflow: 'hidden',
      borderRadius: 50,
      marginRight: 5,
    };
  },
  replyItemTopArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  replyItemEtcWrap: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyTextStyle: {
    height: 30,
    padding: 0,
  },
  replyInputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 60,
    justifyContent: 'center',
  },

});



export default ReplyRegiPopup;
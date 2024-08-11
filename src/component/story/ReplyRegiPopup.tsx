import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView, InputAccessoryView, TextInput, Keyboard, Modal, Pressable  } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { useProfileImg } from 'hooks/useProfileImg';
import { Modalize } from 'react-native-modalize';



interface Props {
  isVisible: boolean;
  storyBoardSeq: number;
  storyReplySeq: number;
  depth: number;
  isSecret: boolean;
  callbackFunc: (isRegi:boolean) => void;
}

const { width, height } = Dimensions.get('window');



//export default function ReplyRegiPopup({ isVisible, storyBoardSeq, storyReplySeq, depth, isSecret, callbackFunc }: Props) {
const ReplyRegiPopup = forwardRef((props, ref) => {
  const modalizeRef = useRef(null); // 모달 ref

  // 본인 데이터
  const memberBase = useUserInfo();

  //const [storyBoardSeq, setStoryBoardSeq] = useState(false);

  // 부모 컴포넌트 handle
  useImperativeHandle(ref, () => ({
    openModal: (seq:any, list:any) => {
      //console.log('type :::::: ' , type);
      //getStoryLikeList(type, seq);
      //modalizeRef.current?.open();
      setReplyList(list);
      popup_onOpen();
    },
    closeModal: () => {
      //modalizeRef.current?.close();
      popup_onClose();
    },
  }));

  // 팝업 활성화
  const popup_onOpen = () => {
    modalizeRef.current?.open();
  }

  // 팝업 닫기
  const popup_onClose = () => {
    console.log('close!!');
    modalizeRef.current?.close();
  };

  // 댓글 목록
  const [replyList, setReplyList] = React.useState([]);

  const mbrProfileImgList = useProfileImg(); // 회원 프로필 이미지 목록

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const [inputReplyText, setInputReplyText] = React.useState(''); // 댓글 입력 텍스트

  const inputRef = React.useRef();

  const closeModal = async () => {
    setInputReplyText('');
    //callbackFunc(false);
  };

  // ############################################################################# 댓글 등록
  const replyRegister = async () => {

    // 중복 클릭 방지 설정
    /* if(isClickable) {
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
          secret_yn: isEmptyData(isSecret) && isSecret ? 'Y' : 'N',
        };

        const { success, data } = await save_story_reply(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            if(isSecret) {
              dispatch(myProfile());
            }

            setInputReplyText('');
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

    } */
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

    // 노출 닉네임
    let applyNickname = item?.nickname;
    /* if(isApplySecret) {
      applyNickname = '비밀글';
    } else {
      if(storyData.board?.member_seq == item?.member_seq && storyData.board?.secret_yn == 'Y') {
        applyNickname = item?.nickname_modifier + ' ' + item?.nickname_noun;
      }
    }; */

    return (
      <>
        <SpaceView mt={20}>
          <SpaceView ml={depthStyleSize} viewStyle={_styles.replyItemTopArea}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-start'}}>

              {/* 썸네일 */}
              <SpaceView>
                <TouchableOpacity 
                  style={_styles.replyImgCircle}
                  //disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq || storyData.board?.story_type == 'SECRET' || isApplySecret}
                  onPress={() => { /* profileCardOpenPopup(item?.member_seq, item?.open_cnt, false); */ }}
                >
                  <Image source={applyMsgImg} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
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
                  <SpaceView ml={5} viewStyle={_styles.badgeItemWrap}>
                    <Text style={styles.fontStyle('R', 8, '#FFFF5D')}>채택완료</Text>
                  </SpaceView>
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
                      <TouchableOpacity onPress={() => { replyModalOpenFunc(storyReplySeq, depth, false); }}>
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






  React.useEffect(() => {
    /* if (inputRef.current) {
      inputRef.current.focus();
    } */
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setInputReplyText('');
      //this.textInputRef.current.focus();

      //inputRef.current?.focus();

      //Keyboard.show();    // 키보드를 다시 활성화합니다.

      if (inputRef.current) {
        inputRef.current.focus();
      }

      return () => {
      };
    }, []),
  );

  return (
    <>
        {/* <Modal 
          visible={isVisible}
          transparent={true} // 배경을 불투명하게 설정
          //isVisible={isVisible} 
          style={_styles.replyModalWrap}
          //onSwipeComplete={toggleModal}
          //onBackdropPress={() => { closeMoadal(); }}
          //swipeDirection="down" // 아래 방향으로 스와이프
          //propagateSwipe={true}
          //onRequestClose={() => { closeMoadal(); }}
        >
          <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',}} onPress={()=> { popup_onClose(); }} />

          <ScrollView style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
            {Platform.OS == 'ios' ? (
              <>
                <InputAccessoryView>

                  <SpaceView viewStyle={_styles.modalWrap}>
                    <SpaceView viewStyle={_styles.inputArea}>
                      <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.memberImageStyle} resizeMode={'cover'} />

                      <TextInput
                        ref={inputRef}
                        value={inputReplyText}
                        onChangeText={(text) => setInputReplyText(text)}
                        multiline={true}
                        textAlignVertical={'top'}
                        autoCapitalize={'none'}
                        style={_styles.replyTextStyle}
                        placeholder={'댓글을 입력해 주세요.'}
                        placeholderTextColor={'#c7c7c7'}
                        editable={true}
                        secureTextEntry={false}
                        maxLength={150}
                        autoFocus={true}
                        //onSubmitEditing={() => { this.inputRef.focus(); }}
                      />

                      <TouchableOpacity
                        onPress={() => { replyRegister(); }}
                        style={_styles.btnArea}
                        hitSlop={commonStyle.hipSlop30}>
                        <Text style={_styles.regiText}>등록</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </SpaceView>
                </InputAccessoryView>
              </>
            ) : (
              <>
                <SpaceView viewStyle={_styles.modalWrap}>
                  <SpaceView viewStyle={_styles.inputArea}>
                    <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.memberImageStyle} resizeMode={'cover'} />

                    <TextInput
                      ref={inputRef}
                      value={inputReplyText}
                      onChangeText={(text) => setInputReplyText(text)}
                      multiline={true}
                      textAlignVertical={'top'}
                      autoCapitalize={'none'}
                      style={_styles.replyTextStyle}
                      placeholder={'댓글을 입력해 주세요.'}
                      placeholderTextColor={'#c7c7c7'}
                      editable={true}
                      secureTextEntry={false}
                      maxLength={150}
                      autoFocus={true}
                    />

                    <TouchableOpacity
                      onPress={() => { replyRegister(); }}
                      style={_styles.btnArea}>
                      <Text style={_styles.regiText}>등록</Text>
                    </TouchableOpacity>
                  </SpaceView>
                </SpaceView>

              </>
            )}
          </ScrollView>
        </Modal> */}

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight={false}
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
                  <ReplyRender item={item} index={index} />
                </SpaceView>
              )
            }}
          />
        </SpaceView>

        <SpaceView viewStyle={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          {/* <TouchableOpacity style={_styles.confirmBtn} onPress={() => { popup_onClose(); }}>
            <Text style={styles.fontStyle('B', 12, '#fff')}>확인</Text>
          </TouchableOpacity> */}

          <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',}} onPress={()=> { popup_onClose(); }} />

          {/* <ScrollView style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
            {Platform.OS == 'ios' ? (
              <>
                <InputAccessoryView>
                  <SpaceView viewStyle={_styles.inputArea}>
                    <SpaceView viewStyle={_styles.replyImgCircle}>
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
                        style={_styles.replyTextStyle}
                        placeholder={'댓글 내용을 입력해 주세요.'}
                        placeholderTextColor={'#c7c7c7'}
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
                  <SpaceView viewStyle={_styles.replyImgCircle}>
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
                      style={_styles.replyTextStyle}
                      placeholder={'댓글 내용을 입력해 주세요.'}
                      placeholderTextColor={'#c7c7c7'}
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
          </ScrollView> */}

        </SpaceView>

      </Modalize>
    </>
  );
});




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  replyModalWrap: {
    flex: 1,
    margin: 0,
    //justifyContent: 'flex-end',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberImageStyle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 15,
  },
  /* replyTextStyle: {
    width: width - 100,
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
  }, */
  










  modalWrap: {
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden', 
    backgroundColor: '#1B1633',
    paddingHorizontal: 20,
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 12,
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
  regiText: {
    fontFamily: 'Pretendard-Bold',
    color: '#FFDD00',
  },




  replyImgCircle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFDD00',
    width: 30,
    height: 30,
    overflow: 'hidden',
    borderRadius: 50,
    marginRight: 5,
  },
  replyItemTopArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  replyTimeText: {
    fontFamily: 'Pretendard-Light',
    color: '#ABA99A',
    fontSize: 12,
  },
  replyItemEtcWrap: {
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyTextStyle: {
    fontFamily: 'Pretendard-Light',
    color: '#FFFsdsds',
    fontSize: 12,
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
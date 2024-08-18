import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { CommonCode, FileInfo, LabelObj, ProfileImg, LiveMemberInfo, LiveProfileImg, StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { RefreshControl, ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, Animated, Easing, PanResponder, Platform, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { get_story_detail, save_story_like, save_story_vote_member, profile_open, save_story_board, save_story_reply } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON, PROFILE_IMAGE } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData } from 'utils/functions';
import CommonHeader from 'component/CommonHeader';
import { STACK, ROUTES } from 'constants/routes';
import { Modalize } from 'react-native-modalize';
import { CommonLoading } from 'component/CommonLoading';
import ReplyRegiPopup from 'component/story/ReplyRegiPopup';
import LikeListPopup from 'component/story/LikeListPopup';
import { useEffect, useRef, useState } from 'react';
import ReportPopup from 'screens/commonpopup/ReportPopup';



/* ################################################################################################################
###### Story 상세
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: StackNavigationProp<StackParamList, 'StoryDetail'>;
  route: RouteProp<StackParamList, 'StoryDetail'>;
}

export default function StoryDetail(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  // 본인 데이터
  const memberBase = useUserInfo();

  // 이미지 인덱스
  const imgRef = React.useRef();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  
  const [storyBoardSeq, setStoryBoardSeq] = React.useState(props.route.params.storyBoardSeq);
  const [storyType, setStoryType] = React.useState(isEmptyData(props.route.params.storyType) ? props.route.params.storyType : ''); // 스토리 유형

  // 스토리 데이터
  const [storyData, setStoryData] = React.useState({
    board: {},
    imageList: [],
    voteList: [],
    replyList: [],
    promptList: [],
    voteInfo: {},
  });

  // 이미지 인덱스
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 이미지 스크롤 처리
  const handleScroll = (event) => {
    let contentOffset = event.nativeEvent.contentOffset;
    let index = Math.floor(contentOffset.x / (width-10));
    setCurrentIndex(index);
  };

  // 게시글 수정/삭제 팝업 활성화
  const storyMod_modalizeRef = useRef<Modalize>(null);

  const storyMod_onOpen = (imgSeq: any, orderSeq: any, type: string) => {
    storyMod_modalizeRef.current?.open();
  };
  const storyMod_onClose = () => {
    storyMod_modalizeRef.current?.close();
  };

  // 투표 선택 상태
  const [selectedVoteSeq, setSelectedVoteSeq] = React.useState(null);


  /* #########################################################################################################
  ######## 좋아요 관련
  ######################################################################################################### */

  // 좋아요 modalizeRef
  const like_modalizeRef = React.useRef<Modalize>(null);

  // 좋아요 팝업 활성화
  const like_onOpen = () => {
    like_modalizeRef.current?.openModal('BOARD', storyBoardSeq);
  };

  // ############################################################################# 게시글 좋아요 저장
  const storyLikeProc = async (type:string, storyReplySeq:number) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoading(true);
  
        const body = {
          type: type,
          story_board_seq: storyBoardSeq,
          story_reply_seq: storyReplySeq,
        };
  
        const { success, data } = await save_story_like(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              getStoryBoard();
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
      }
    }
  };

  
  const [replyInfo, setReplyInfo] = useState({});

  const popupStoryReplyActive = (_storyReplySeq:number, _depth:number, replyInfo:{}) => {
    //setLikeListTypePopup('REPLY');
    setSelectedReplyData({
      storyReplySeq: _storyReplySeq,
      depth: _depth,
    });
    setReplyInfo(replyInfo);
  };


  /* #########################################################################################################
  ######## 댓글 모달 관련
  ######################################################################################################### */
  const [isReplyVisible, setIsReplyVisible] = React.useState(false);

  // 댓글 modalizeRef
  const reply_modalizeRef = React.useRef<Modalize>(null);

  // 댓글 팝업 활성화
  const reply_onOpen = () => {
    reply_modalizeRef.current?.openModal(storyBoardSeq);
  };

  {/* <ReplyRegiPopup 
        isVisible={isReplyVisible} 
        storyBoardSeq={storyData?.board?.story_board_seq}
        storyReplySeq={selectedReplyData.storyReplySeq}
        depth={selectedReplyData.depth}
        isSecret={selectedReplyData.isSecret}
        callbackFunc={replyRegiCallback} 
      /> */}

  // 선택된 댓글 데이터(댓글 등록 모달 적용)
  const [selectedReplyData, setSelectedReplyData] = React.useState({
    storyReplySeq: 0,
    depth: 0,
    isSecret: false,
  });

  // 댓글 모달 열기
  const replyModalOpen = async (_storyReplySeq:number, _depth:number, _isSecret:boolean) => {

    // 비밀 댓글 여부 구분 처리
    if(_isSecret) {
      show({
        title: '비밀 댓글 달기',
        content: '게시글 등록자만 볼 수 있는 댓글을 등록합니다.', 
        passAmt: 10,
        confirmBtnText: '변경하기',
        cancelCallback: function() {
          
        },
        confirmCallback: function () {
          if(memberBase?.pass_has_amt >= 10) {
            setSelectedReplyData({
              storyReplySeq: _storyReplySeq,
              depth: _depth,
              isSecret: _isSecret,
            });
            setIsReplyVisible(true);

          } else {
            show({
              title: '비밀 댓글 달기',
              content: '보유 큐브가 부족합니다.',
              confirmBtnText: '상점 이동',
              isCross: true,
              cancelCallback: function() { 
              },
              confirmCallback: function () {
                navigation.navigate(STACK.TAB, { screen: 'Cashshop' });
              },
            });
          }
        },
      });

    } else {
      /* setSelectedReplyData({
        storyReplySeq: _storyReplySeq,
        depth: _depth,
        isSecret: _isSecret,
      });
      setIsReplyVisible(true); */

      reply_onOpen();
    }
  };

  // 댓글 모달 닫기
  const replyModalClose = async () => {
    setIsReplyVisible(false);
  };

  // 댓글 등록 콜백 함수
  const replyRegiCallback = async (_isRegi:boolean) => {
    if(_isRegi) {
      getStoryBoard();
    };

    setIsReplyVisible(false);
  };

  // ############################################################################# 댓글 삭제 팝업
  const replyDelPopupOpen = async (_storyReplySeq:number) => {
    show({
      title: '댓글 삭제',
      content: '댓글을 삭제하시겠습니까?',
      confirmBtnText: '삭제하기',
      cancelCallback: function() {  
      },
      confirmCallback: function () {
        replyDelProc(_storyReplySeq);
      },
    });
  };

  // ############################################################################# 댓글 삭제 처리
  const replyDelProc = async (_storyReplySeq:number) => {
    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoading(true);
  
        const body = {
          story_board_seq: storyBoardSeq,
          story_reply_seq: _storyReplySeq,
          del_yn: 'Y',
        };
  
        const { success, data } = await save_story_reply(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              getStoryBoard();
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
      }
    }
  };

  // ############################################################################# 댓글 등록
  const replyRegister = async (text:string, storyReplySeq:number, depth:number) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {

        if(!isEmptyData(text)) {
          //show({ content: '댓글 내용을 입력해 주세요.' });
          return false;
        };
    
        const body = {
          story_reply_seq: null,
          story_board_seq: storyBoardSeq,
          reply_contents: text,
          group_seq: storyReplySeq,
          depth: depth+1,
          //secret_yn: isEmptyData(isSecret) && isSecret ? 'Y' : 'N',
          secret_yn: 'N',
        };

        const { success, data } = await save_story_reply(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            /* if(isSecret) {
              dispatch(myProfile());
            } */
            
            getStoryBoard();
            
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

  // ############################################################################# 수정하기 이동
  const goStoryModify = async () => {
    // 팝업 닫기
    storyMod_onClose();

    console.log('storyData.imageList :::: ' ,storyData.imageList);

    navigation.navigate(STACK.COMMON, {
      screen: ROUTES.STORY_REGI,
      params: {
        storyBoardSeq: storyBoardSeq,
        nicknameModifier: storyData.board?.nickname_modifier,
        nicknameNoun: storyData.board?.nickname_noun,
        contents: storyData.board?.contents,
        imgList: storyData.imageList,
      }
    });
  };

  // ############################################################################# 스토리 조회
  const getStoryBoard = async (_type:string) => {
    try {
      if(_type == 'REFRESH') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      };

      const body = {
        story_board_seq: storyBoardSeq,
      };

      const { success, data } = await get_story_detail(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:

            if(isEmptyData(data.story?.story_board_seq)) {

              // 투표 정보 구성
              let _voteInfo = {};
              if(data?.story?.story_type == 'VOTE' && data?.story_vote_list?.length > 1) {
                let isVoteEnd = data?.story?.vote_end_yn == 'Y' ? true : false; // 투표 종료 여부
                let isVoteDraw = data?.story_vote_list[0].vote_member_cnt == data?.story_vote_list[1].vote_member_cnt ? true : false;
                let voteWinIdx = data?.story_vote_list[0].vote_member_cnt > data?.story_vote_list[1].vote_member_cnt ? 1 : 2;

                _voteInfo = {
                  isVoteEnd: isVoteEnd,
                  isVoteDraw: isVoteDraw,
                  voteWinIdx: voteWinIdx,
                }
              }

              setStoryData({
                board: data.story,
                imageList: data.story_img_list,
                replyList: data.story_reply_list,
                voteList: data.story_vote_list,
                promptList: data.story_prompt_list,
                voteInfo: _voteInfo,
              });

              setReportCodeList(data?.report_code_list);


            } else {
              show({
                content: '삭제된 스토리 입니다.',
                confirmCallback: function () {
                  navigation.goBack()
                },
              });
            }
          
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
      if(_type == 'REFRESH') {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // ############################################################################# 투표하기 실행
  const voteProc = async (storyVoteSeq:number) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);

        if(selectedVoteSeq != storyVoteSeq) {
          setSelectedVoteSeq(storyVoteSeq);
        } else {
          setIsLoading(true);

          const body = {
            story_board_seq: storyBoardSeq,
            story_vote_seq: storyVoteSeq,
          };
    
          const { success, data } = await save_story_vote_member(body);
          if(success) {
            switch (data.result_code) {
              case SUCCESS:
                getStoryBoard();
                break;
              default:
                show({ content: '오류입니다. 관리자에게 문의해주세요.' });
                break;
            }
          } else {
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          }
        }
  
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      }
    }

  };

  // ##################################################################################### 프로필 카드 열람 팝업 활성화
  const profileCardOpenPopup = async (memberSeq:number, openCnt:number, isSecret:boolean) => {
    if(openCnt > 0) {
      navigation.navigate(STACK.COMMON, { 
        screen: 'MatchDetail',
        params: {
          trgtMemberSeq: memberSeq,
          type: 'OPEN',
          matchType: 'STORY',
        } 
      });

    } else {
      show({
        type: 'OPEN',
        passType: isSecret ? 'ROYAL' : 'PASS',
        passAmt: isSecret ? '1' : '15',
        confirmCallback: function(message:string) {
          if(isSecret) {
            if(memberBase?.royal_pass_has_amt >= 1) {
              profileCardOpen(memberSeq, isSecret, message);
            } else {
              show({
                title: isSecret ? '비공개 프로필 열람' : '프로필 카드 열람',
                content: '보유 메가큐브가 부족합니다.',
                confirmBtnText: '상점 이동',
                isCross: true,
                cancelCallback: function() { 
                },
                confirmCallback: function () {
                  navigation.navigate(STACK.TAB, { screen: 'Cashshop' });
                },
              });
            }
          } else {
            if(memberBase?.pass_has_amt >= 15) {
              profileCardOpen(memberSeq, isSecret, message);
            } else {
              show({
                title: isSecret ? '비공개 프로필 열람' : '프로필 카드 열람',
                content: '보유 큐브가 부족합니다.',
                confirmBtnText: '상점 이동',
                isCross: true,
                cancelCallback: function() { 
                },
                confirmCallback: function () {
                  navigation.navigate(STACK.TAB, { screen: 'Cashshop' });
                },
              });
            }
          }
        },
        cancelCallback: function() {
        },
      });
    }
  };

  // ##################################################################################### 프로필 카드 열람
  const profileCardOpen =  async (memberSeq:number, isSecret:boolean, message:string) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoading(true);
  
        const body = {
          type: 'STORY',
          trgt_member_seq: memberSeq,
          secret_yn: isSecret ? 'Y' : 'N',
          message: message,
        };
  
        const { success, data } = await profile_open(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              navigation.navigate(STACK.COMMON, { 
                screen: 'MatchDetail',
                params: {
                  trgtMemberSeq: memberSeq,
                  type: 'OPEN',
                  matchType: 'STORY',
                } 
              });
              break;
            case EXIST:
              show({
                content: '이미 보관함에 존재하는 회원입니다.',
                isCross: true,
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
      }
    }
  };

  // ##################################################################################### 스토리 게시물 삭제
  const deleteStoryBoard =  async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoading(true);
  
        const body = {
          story_board_seq: storyBoardSeq,
          del_yn: 'Y',
        };
        const { success, data } = await save_story_board(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              show({
                title: '스토리 삭제',
                content: '스토리 게시물이 삭제되었습니다.', 
                confirmCallback: function () {
                  navigation.navigate(STACK.TAB, {
                    screen: 'Story',
                  });
                },
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
      }
    }
  };

  // ############################################################################# 투표하기 실행

  /* #########################################################################################################
  ######## 신고하기 관련
  ######################################################################################################### */

  const [reportCodeList, setReportCodeList] = React.useState([]);

  // 신고하기 modalizeRef
  const report_modalizeRef = React.useRef<Modalize>(null);

  // 신고하기 팝업 활성화
  const report_onOpen = () => {
    report_modalizeRef.current?.openModal(reportCodeList);
  };

  // 신고하기 팝업 닫기
  const report_onClose = () => {
    report_modalizeRef.current?.closeModal();
  };

  // 신고하기
  const reportProc = (value:string) => {
    console.log('value :::: ' , value);
    report_onClose();
  };



  // ############################################################################# 댓글 렌더링
  const ReplyRender = ({ item, index, likeFunc, replyModalOpenFunc }) => {
    const memberMstImgPath = findSourcePath(item?.mst_img_path); // 회원 대표 이미지 경로
    const storyReplySeq = item?.story_reply_seq; // 댓글 번호
    const depth = item?.depth;
    const gender = item?.gender; // 성별
    const secretYn = item?.secret_yn; // 비밀 여부

    // 영역 사이즈 설정
    let _w = width - 120;
    let depthStyleSize = 0;

    if(depth == 2) {
      _w = _w - 15;
      depthStyleSize = 15;
    }

    // 비밀 댓글 노출
    let isApplySecret = false;
    if(secretYn == 'Y') {
      if(memberBase?.member_seq != storyData.board?.member_seq && memberBase?.member_seq != item?.member_seq) {
        isApplySecret = true;
      }
    };

    // 노출 대표 이미지
    let applyMsgImg = findSourcePath(item?.mst_img_path);
    if(storyData.board?.story_type == 'SECRET' || isApplySecret || (storyData.board?.member_seq == item?.member_seq && storyData.board?.secret_yn == 'Y')) {
      applyMsgImg = gender == 'M' ? ICON.storyMale : ICON.storyFemale;
    };

    // 노출 닉네임
    let applyNickname = item?.nickname;
    if(isApplySecret) {
      applyNickname = '비밀글';
    } else {
      if(storyData.board?.member_seq == item?.member_seq && storyData.board?.secret_yn == 'Y') {
        applyNickname = item?.nickname_modifier + ' ' + item?.nickname_noun;
      }
    };

    return (
      <>
        <SpaceView mb={20} viewStyle={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: index%2 == 0 ? 'flex-start' : 'flex-end'}}>

          {index%2 == 0 && (
            <SpaceView mr={15}>
              <TouchableOpacity 
                style={_styles.imgCircle}
                disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq || storyData.board?.story_type == 'SECRET' || isApplySecret}
                onPress={() => { profileCardOpenPopup(item?.member_seq, item?.open_cnt, false); }}
              >
                <Image source={applyMsgImg} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
              </TouchableOpacity>
              {memberBase?.member_seq === item?.member_seq && (
                <SpaceView viewStyle={_styles.myReplyChk}>
                  <Image source={gender == 'M' ? ICON.maleIcon : ICON.femaleIcon} style={styles.iconSquareSize(13)} resizeMode={'cover'} />
                </SpaceView>
              )}
            </SpaceView>
          )}

          {/* ######################################################################################################## 내용 */}
          <SpaceView pt={3} viewStyle={{flexDirection: 'column', width: _w}}>
            <SpaceView viewStyle={{backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10}}>
              <SpaceView>
                <Text style={styles.fontStyle('SB', 10, '#383838')}>{applyNickname}</Text>
              </SpaceView>
              <SpaceView mt={5}>
                <Text style={styles.fontStyle('SB', 12, '#383838')}>{item.reply_contents}</Text>
              </SpaceView>
            </SpaceView>

            <SpaceView mt={5} viewStyle={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity>
                <Image source={ICON.story_upBtn} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 8}}>
                <Image source={ICON.story_downBtn} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
            </SpaceView>

            {/* 닉네임, 타임 텍스트 */}
            {/* <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={_styles.replyNickname}>
                <Text style={_styles.replyNicknameText(storyData.board?.story_type, item.gender)}>{applyNickname}</Text>{' '}
                <Text style={[_styles.replyTimeText, {justifyContent: 'center'}]}>{item.time_text}</Text>     
              </Text>
              <View>
                {secretYn == 'Y' && (<Image source={item.gender == 'W' ? ICON.padlockFemale : ICON.padlockMale} style={{width: 14, height: 14,}} />)}
              </View>
            </SpaceView> */}

            {/* 댓글 내용 */}
            {/* <SpaceView mt={6} viewStyle={{ width: width - 90}}>
              
              <Text style={_styles.replyContents}>
                {
                  (isApplySecret) ? '게시글 작성자에게만 보이는 글입니다.' : (item.del_yn == 'Y') ? '삭제된 댓글입니다.' : item.reply_contents
                }

                {(memberBase?.member_seq === item?.member_seq) && (item.del_yn == 'N') && (
                  <TouchableOpacity style={{ paddingLeft: 5, }} onPress={() => { replyDelPopupOpen(storyReplySeq); }}>
                    <Text style={_styles.replyTextDel}>삭제</Text>
                  </TouchableOpacity>
                )}
              </Text>
            </SpaceView> */}

            {/* 버튼 영역 */}
            {/* 답글달기 버튼 */}
            {/* {depth == 1 && (
              <>
                <TouchableOpacity onPress={() => { replyModalOpenFunc(storyReplySeq, depth, false); }}>
                  <Text style={_styles.replyTextStyle}>답글달기</Text>
                </TouchableOpacity>
              </>
            )} */}

            {/* 좋아요 버튼 */}
            {/* <SpaceView viewStyle={_styles.likeArea}>
              <TouchableOpacity 
                onPress={() => { likeFunc('REPLY', storyReplySeq); }}
                style={{marginRight: 6}} 
                hitSlop={commonStyle.hipSlop20}>

                {(item?.member_like_yn == 'N') ? (
                  <Image source={ICON.heartOffIcon} style={styles.iconSquareSize(14)} />
                ) : (
                  <Image source={ICON.heartOnIcon} style={styles.iconSquareSize(14)} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                //disabled={memberBase.member_seq != item?.member_seq}
                hitSlop={commonStyle.hipSlop10}
                onPress={() => { popupStoryReplyActive(storyReplySeq, depth, item) }}>
                <Text style={_styles.replyLikeCntText}>좋아요{item?.like_cnt > 0 && item?.like_cnt + '개'}</Text>
              </TouchableOpacity>
            </SpaceView> */}

          </SpaceView>

          {index%2 != 0 && (
            <SpaceView ml={15}>
              <TouchableOpacity 
                style={_styles.imgCircle}
                disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq || storyData.board?.story_type == 'SECRET' || isApplySecret}
                onPress={() => { profileCardOpenPopup(item?.member_seq, item?.open_cnt, false); }}
              >
                <Image source={applyMsgImg} style={styles.iconSquareSize(30)} resizeMode={'cover'} />
              </TouchableOpacity>
              {memberBase?.member_seq === item?.member_seq && (
                <SpaceView viewStyle={_styles.myReplyChk}>
                  <Image source={gender == 'M' ? ICON.maleIcon : ICON.femaleIcon} style={styles.iconSquareSize(13)} resizeMode={'cover'} />
                </SpaceView>
              )}
            </SpaceView>
          )}

        </SpaceView>
      </>
    );
  };

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      setIsRefreshing(false);

      if(isEmptyData(props.route.params.storyBoardSeq)) {
        getStoryBoard();
      }
    };
  }, [isFocus]);

  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  
  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    getStoryBoard('REFRESH');
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView pt={30} viewStyle={_styles.wrap}>
        <CommonHeader 
          title={(storyData.board?.story_type == 'STORY' ? '스토리' : storyData.board?.story_type == 'VOTE' ? '투표' : '시크릿')}
          type={'STORY_DETAIL'} 
          mstImgPath={memberBase?.member_seq == storyData.board?.member_seq ? findSourcePath(storyData.board?.mst_img_path) : ICON.story_regTmp} 
          nickname={storyData.board?.nickname}
          profileScore={storyData.board?.profile_score}
          authLevel={storyData.board?.auth_acct_cnt}
          storyType={storyData.board?.story_type}
          nicknameModifier={storyData.board?.nickname_modifier}
          nicknameNoun={memberBase?.member_seq == storyData.board?.member_seq ? storyData.board?.nickname : storyData.board?.nickname_noun}
          editBtnIcon={memberBase?.member_seq == storyData.board?.member_seq ? ICON.writeBtn : ICON.declaration}
          callbackFunc={memberBase?.member_seq == storyData.board?.member_seq ? goStoryModify : report_onOpen}
        />

        <ScrollView
          style={{marginBottom: 120}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#ff0000" // Pull to Refresh 아이콘 색상 변경
              //title="Loading..." // Pull to Refresh 아이콘 아래에 표시될 텍스트
              titleColor="#ff0000" // 텍스트 색상 변경
              colors={['#ff0000', '#00ff00', '#0000ff']} // 로딩 아이콘 색상 변경
              progressBackgroundColor="#ffffff" >
            </RefreshControl>
          }
        >

          <SpaceView mb={20}>

            {/* ###################################################################################### 이미지 영역 */}
            <SpaceView>
              <FlatList
                ref={imgRef}
                data={storyData.imageList}
                renderItem={ImageRender}
                onScroll={handleScroll}
                showsHorizontalScrollIndicator={false}
                horizontal
                pagingEnabled
              />
            </SpaceView>

            {/* ###################################################################################### 내용 영역 */}
            <SpaceView mt={8} pb={25} viewStyle={{borderBottomWidth: 1, borderBottomColor: '#BCBCBC'}}>
              <SpaceView>
                <Text style={styles.fontStyle('SB', 14, '#CBCBCB')}>{storyData.board?.contents}</Text>
              </SpaceView>

              <SpaceView mt={15} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <SpaceView>
                  <Text style={styles.fontStyle('SB', 12, '#ABA99A')}>{storyData.board?.time_text}</Text>
                </SpaceView>
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>

                    {/* 좋아요 버튼 */}
                    <TouchableOpacity 
                      onPress={() => { storyLikeProc('BOARD', 0); }} 
                      hitSlop={commonStyle.hipSlop20}>
                      <Image source={storyData.board?.member_like_yn == 'N' ? ICON.story_heartWhite : ICON.story_heartWhiteFill} style={styles.iconSquareSize(20)} />
                    </TouchableOpacity>

                    {/* 좋아요 갯수 버튼 */}
                    <TouchableOpacity 
                      hitSlop={commonStyle.hipSlop10}
                      style={{marginLeft: 5}}
                      onPress={() => { like_onOpen(); }}>
                      <Text style={styles.fontStyle('B', 16, '#fff')}>{isEmptyData(storyData.board?.like_cnt) ? storyData.board?.like_cnt + '개' : '0개'}</Text>
                    </TouchableOpacity>
                  </SpaceView>

                  <SpaceView>

                    {/* 댓글 버튼 */}
                    <TouchableOpacity 
                      style={{flexDirection: 'row', alignItems: 'center', marginLeft: 20}} 
                      onPress={() => { replyModalOpen(0, 0, false); }}>
                      <Image source={ICON.story_replyWhite} style={styles.iconSquareSize(19)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 16, '#fff')}>{storyData.replyList?.length + '개'}</Text></SpaceView>
                    </TouchableOpacity>

                    {/*  댓글 초이스 노출 문구 */}
                    {/* <SpaceView viewStyle={_styles.choiceBubbleWrap}>
                      <SpaceView viewStyle={_styles.choiceBubbleMark} />
                      <LinearGradient
                        colors={['#8BC1FF', '#416DFF']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={_styles.choiceBubbleLinear(272)}
                      >
                        <SpaceView mr={5} viewStyle={{flexDirection: 'row', backgroundColor: '#000000', borderRadius: 25, paddingHorizontal: 5, paddingVertical: 2}}>
                          <Image source={ICON.cube} style={styles.iconSquareSize(12)} />
                          <SpaceView ml={2}><Text style={styles.fontStyle('R', 9, '#fff')}>5개</Text></SpaceView>
                        </SpaceView>
                        <Text style={styles.fontStyle('SB', 10, '#fff')}>
                          댓글을 남기고 큐브 보상을 받을 수 있어요.(60분 남음)
                        </Text>
                      </LinearGradient>
                    </SpaceView> */}

                  </SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>

            {/* ###################################################################################### 투표 노출 영역 */}
            {storyData.board?.story_type == 'VOTE' && (
              <>
                <SpaceView pl={10} pr={10} pt={20} pb={20} viewStyle={{borderBottomWidth: 1, borderBottomColor: '#BCBCBC'}}>
                  {storyData.voteList?.map((item, index) => {
                    return (
                      <SpaceView key={'vote_' + index} viewStyle={_styles.voteItemWrap}>
                        <Text style={styles.fontStyle('SB', 12, '#fff')}>{item.vote_name}</Text>
                        <TouchableOpacity 
                          style={_styles.voteSelectedBtn}
                          disabled={storyData?.voteInfo?.isVoteEnd || !isEmptyData(storyData?.voteInfo?.selected_vote_seq) || memberBase?.member_seq != storyData.board?.member_seq}
                          onPress={() => { voteProc(item?.story_vote_seq) }}>

                          {/* 투표 마감 또는 투표 선택한 경우 투표 갯수 표시 */}
                          {(storyData?.voteInfo?.isVoteEnd || !isEmptyData(storyData?.voteInfo?.selected_vote_seq) || memberBase?.member_seq != storyData.board?.member_seq) ? (
                            <>
                              <Text style={styles.fontStyle('SB', 12, (item?.vote_yn == 'Y' ? '#46F66F' : '#FF516F'))}>{item.vote_member_cnt}표</Text>
                            </>
                          ) : (
                            <>
                              {selectedVoteSeq == item?.story_vote_seq && (
                                <SpaceView viewStyle={_styles.voteSelectedActive}>
                                  <LinearGradient
                                    colors={['#8BC1FF', '#416DFF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{paddingVertical: 5, paddingHorizontal: 7, borderRadius: 13, alignItems: 'center'}}
                                  >
                                    <Text style={styles.fontStyle('SB', 10, '#fff')}>한 번 더 눌러 주세요!</Text>
                                  </LinearGradient>
                                  <SpaceView viewStyle={_styles.triangleMark} />
                                </SpaceView>
                              )}
                              <Text style={styles.fontStyle('SB', 12, (selectedVoteSeq == item?.story_vote_seq ? '#46F66F' : '#fff'))}>
                                {selectedVoteSeq == item?.story_vote_seq ? '투표' : '선택'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </SpaceView>
                    )
                  })}
                </SpaceView>
              </>
            )}

            {/* ###################################################################################### 릴레이 노출 영역 */}
            {/* <SpaceView pt={20} pb={20}>
              <FlatList
                contentContainerStyle={_styles.replyListWrap}
                data={storyData.replyList}
                keyExtractor={(item) => item.story_reply_seq.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <View key={'reply_' + index}>
                      <ReplyRender 
                        item={item} 
                        index={index} 
                        likeFunc={storyLikeProc} 
                        replyModalOpenFunc={replyModalOpen}
                      />
                    </View>
                  )
                }}
              />
            </SpaceView> */}

            {/* ###################################################################################### 태그 영역 */}
            <SpaceView mt={30}>
              <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <Image source={ICON.story_tag} style={styles.iconSquareSize(20)} />
                <SpaceView ml={5}><Text style={styles.fontStyle('B', 16, '#fff')}>태그</Text></SpaceView>
              </SpaceView>
              <SpaceView mt={10} viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {storyData?.promptList?.map((item, index) => {
                  return (
                    <SpaceView key={'prompt_'+index} viewStyle={_styles.tagItemWrap}>
                      <Text style={styles.fontStyle('SB', 12, '#000000')}>{item?.prompt_name}</Text>
                    </SpaceView>
                  )
                })}
              </SpaceView>
            </SpaceView>























            <SpaceView mb={200}></SpaceView>



            {/* ###################################################################################### 버튼 영역 */}
            <SpaceView mt={20}>
              <SpaceView pl={20} pr={20} pb={10} mb={8} viewStyle={_styles.replyEtcArea}>
                <SpaceView viewStyle={{width: '100%', height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>

                  {/* ################################################################################################# 작성자 정보 영역 */}
                  {/* <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                    {(storyData.board?.secret_yn == 'Y' || storyData.board?.story_type == 'SECRET') ? (
                      <TouchableOpacity
                        disabled={memberBase.gender === storyData.board?.gender || memberBase?.member_seq === storyData.board?.member_seq}
                        onPress={() => { profileCardOpenPopup(storyData.board?.member_seq, storyData.board?.open_cnt, true); }} 
                      >
                        <Text style={_styles.nicknameText(storyData.board?.story_type == 'SECRET' || storyData.board?.secret_yn == 'Y', storyData.board?.gender, 14)}>
                          {storyData.board?.nickname_modifier}{' '}{storyData.board?.nickname_noun}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={_styles.imgCircle}
                          disabled={memberBase?.gender === storyData.board?.gender || memberBase?.member_seq === storyData.board?.member_seq}
                          onPress={() => { profileCardOpenPopup(storyData.board?.member_seq, storyData.board?.open_cnt, false); }} >
                          <Image source={findSourcePath(storyData.board?.mst_img_path)} style={_styles.mstImgStyle} />
                        </TouchableOpacity>

                        <SpaceView viewStyle={{flexDirection: 'column'}}>

                          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                            {((isEmptyData(storyData.board?.auth_acct_cnt) && storyData.board?.auth_acct_cnt >= 5)) && (
                              <SpaceView mr={5} viewStyle={{ borderTopRightRadius: 7, backgroundColor: '#FFDD00', paddingHorizontal: 5, paddingVertical: 2 }}>
                                <Text style={_styles.scoreText}>LV {storyData.board?.auth_acct_cnt}</Text>
                              </SpaceView>
                            )}
                            {memberBase?.best_face &&
                              <SpaceView viewStyle={{ borderTopRightRadius: 7, backgroundColor: '#FFDD00', paddingHorizontal: 5, paddingVertical: 2 }}>
                                <Text style={_styles.scoreText}>#{memberBase?.best_face}</Text>
                              </SpaceView>
                            }
                          </SpaceView>

                          <SpaceView mt={3}>
                            <Text style={_styles.nicknameText(storyData.board?.story_type == 'SECRET' || storyData.board?.secret_yn == 'Y', storyData.board?.gender, 12)}>{storyData.board?.nickname}</Text>
                          </SpaceView>
                        </SpaceView>
                      </>
                    )}
                  </SpaceView> */}

                  {/* ################################################################################################# 버튼 영역 */}
                  <SpaceView viewStyle={{flexDirection: 'row', position: 'absolute', top: 0, right: 0,}}>

                    {/* 좋아요 버튼 */}
                    {/* <TouchableOpacity 
                      onPress={() => { storyLikeProc('BOARD', 0); }} 
                      hitSlop={commonStyle.hipSlop20}>

                      {storyData.board?.member_like_yn == 'N' ? (
                        <Image source={ICON.heartOffIcon} style={styles.iconSquareSize(20)} />
                      ) : (
                        <Image source={ICON.heartOnIcon} style={styles.iconSquareSize(20)} />
                      )}
                    </TouchableOpacity> */}

                    {/* 비밀 댓글 버튼 */}
                    {/* {(memberBase?.member_seq != storyData.board?.member_seq && storyData.board?.story_type != 'SECRET') && (
                      <TouchableOpacity style={{marginLeft: 12}} onPress={() => { replyModalOpen(0, 0, true); }}>
                        <Image source={ICON.speechDotline} style={styles.iconSquareSize(20)} />
                      </TouchableOpacity>
                    )} */}

                    {/* 일반 댓글 버튼 */}
                    {/* <TouchableOpacity style={{flexDirection: 'row', marginLeft: 12}} onPress={() => { replyModalOpen(0, 0, false); }}>
                      <Image source={ICON.reply} style={styles.iconSquareSize(21)} />
                    </TouchableOpacity> */}
                    
                    {/* 메뉴바 버튼 */}
                    {/* {(memberBase?.member_seq == storyData.board?.member_seq) && (
                      <TouchableOpacity onPress={() => { storyMod_onOpen(); }} style={{flexDirection:'row', alignItems: 'center', marginLeft: 12}}>
                        <View style={[_styles.ivoryDot, {marginRight: 3}]}></View>
                        <View style={[_styles.ivoryDot, {marginRight: 3}]}></View>
                        <View style={_styles.ivoryDot}></View>
                      </TouchableOpacity>
                    )} */}
                  </SpaceView>
                </SpaceView>
              </SpaceView>

              {/* ###################################################################################### 댓글 영역 */}
              <SpaceView ml={20} mr={20}>
                {/* <TouchableOpacity style={{marginLeft: 15}} onPress={() => { replyModalOpen(0, 0); }}>
                    <Image source={ICON.reply} style={styles.iconSquareSize(21)} />
                  </TouchableOpacity> */}

                {/* <FlatList
                  contentContainerStyle={_styles.replyListWrap}
                  data={storyData.replyList}
                  keyExtractor={(item) => item.story_reply_seq.toString()}
                  renderItem={({ item, index }) => {
                    return (
                      <View key={'reply_' + index}>
                        <ReplyRender 
                          item={item} 
                          index={index} 
                          likeFunc={storyLikeProc} 
                          replyModalOpenFunc={replyModalOpen}
                        />
                      </View>
                    )
                  }}
                /> */}
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </ScrollView>
      </SpaceView>

      {/* ##################################################################################
                댓글 입력 팝업
      ################################################################################## */}
      {/* <ReplyRegiPopup 
        isVisible={isReplyVisible} 
        storyBoardSeq={storyData?.board?.story_board_seq}
        storyReplySeq={selectedReplyData.storyReplySeq}
        depth={selectedReplyData.depth}
        isSecret={selectedReplyData.isSecret}
        callbackFunc={replyRegiCallback} 
      /> */}

      <ReplyRegiPopup 
        ref={reply_modalizeRef}
        replyList={storyData.replyList}
        //profileOpenFn={profileCardOpen}
        likeFn={storyLikeProc}
        replyRegisterFn={replyRegister}
      />

      {/* ##################################################################################
                좋아요 목록 팝업
      ################################################################################## */}
      {/* <LikeListPopup
        _ref={like_modalizeRef}
        closeModal={like_onClose}
        type={likeListTypePopup}
        _storyBoardSeq={props.route.params.storyBoardSeq}
        storyReplyData={selectedReplyData}
        replyInfo={replyInfo}
        profileOpenFn={profileCardOpenPopup}
      /> */}

      <LikeListPopup
        ref={like_modalizeRef}
        //profileOpenFn={profileCardOpen}
      />

      {/* ###############################################
			          게시글 수정/삭제 팝업
			############################################### */}
      <Modalize
        ref={storyMod_modalizeRef}
        adjustToContentHeight={true}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={[modalStyle.modalContainer, {backgroundColor: '#333B41'}]} >

        <SpaceView viewStyle={[modalStyle.modalHeaderContainer, {marginBottom: 0, marginTop: 10}]}>
          <Text style={_styles.modTitle}>
            게시글 관리
          </Text>
        </SpaceView>

        <SpaceView pl={40} pr={40} mb={10}>
          <Text style={_styles.modDesc}>게시글 내용을 수정하거나 삭제할 수 있어요.</Text>
        </SpaceView>

        <SpaceView viewStyle={[modalStyle.modalBody, layoutStyle.flex1]}>
          <TouchableOpacity style={[_styles.modBtn, {backgroundColor: '#FFDD00'}]} onPress={ goStoryModify }>
            <Text style={[_styles.closeBtnText, {color: '#3D4348'}]}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[_styles.modBtn, {backgroundColor: '#FFF'}]} onPress={ deleteStoryBoard }>
            <Text style={[_styles.closeBtnText, {color: '#FF4D29'}]}>삭제</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[_styles.modBtn, {borderWidth: 1, borderColor: '#BBB18B'}]} onPress={storyMod_onClose} hitSlop={commonStyle.hipSlop20}>
            <Text style={[_styles.closeBtnText, {color: '#D5CD9E'}]}>취소</Text>
          </TouchableOpacity>
        </SpaceView>
      </Modalize>


      {/* ##################################################################################
                    사용자 신고하기 팝업
      ################################################################################## */}
      <ReportPopup
        ref={report_modalizeRef}
        //profileOpenFn={profileCardOpen}
        confirmFn={reportProc}
      />




    </>
  );


  /* ################################################################################################## 이미지 렌더링 */
  function ImageRender({ item }) {
    let url = '';
    
    if(isEmptyData(item?.img_file_path)) {
      url = findSourcePath(item?.img_file_path);
      //url = findSourcePathLocal(item?.img_file_path);
    } else {
      url = findSourcePath(item?.file_path);
      //url = findSourcePathLocal(item?.file_path);
    };

    //url = PROFILE_IMAGE.womanTmp1;

    return (
      <>
        <SpaceView>
          <Image source={url} style={_styles.imageStyle} resizeMode={'cover'} />
        </SpaceView>
      </>
    );
  };

};




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
  imageStyle: {
    flex: 1,
    width: width - 20,
    height: width * 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  replyEtcArea: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  replyListWrap: {
    flex: 1,
    //flexWrap: 'nowrap',
    //marginHorizontal: 5,
  },
  imgCircle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFDD00',
    width: 30,
    height: 30,
    overflow: 'hidden',
    borderRadius: 50,
  },
  myReplyChk: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
  modTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#F3E270',
  },
  modDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#D5CD9E',
  },
  modBtn: {
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  closeBtnText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    textAlign: 'center',
  },









  tagItemWrap: {
    backgroundColor: '#CBCBCB',
    borderRadius: 5,
    paddingHorizontal: 15,
    height: 30,
    justifyContent: 'center',
    marginRight: 5,
    marginBottom: 5,
  },
  voteItemWrap: {
    backgroundColor: '#3E11F5',
    borderRadius: 38,
    paddingVertical: 7,
    paddingHorizontal: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteSelectedBtn: {
    backgroundColor: '#000000',
    borderRadius: 25,
    minWidth: 50,
    paddingVertical: 5,
    alignItems: 'center',
  },
  voteSelectedActive: {
    position: 'absolute',
    top: -25,
    right: 0,
    width: 100,
  },
  triangleMark: {
    marginTop: 0,
    marginLeft: 68,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#416DFF',
    transform: [{ rotate: '180deg' }],
  },
  choiceBubbleWrap: {
    position: 'absolute',
    bottom: -40,
    right: 0,
    alignItems: 'flex-end',
  },
  choiceBubbleLinear: (width:number) => {
    return {
      width: width,
      paddingVertical: 5,
      paddingHorizontal: 7,
      borderRadius: 13,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    };
  },
  choiceBubbleMark: {
    marginTop: 0,
    marginRight: 18,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#8BC1FF',
    transform: [{ rotate: '0deg' }],
  },
  


















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
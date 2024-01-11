import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { CommonCode, FileInfo, LabelObj, ProfileImg, LiveMemberInfo, LiveProfileImg, StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { RefreshControl, ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, Animated, Easing, PanResponder, Platform, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { get_story_detail, save_story_like, save_story_vote_member, profile_open, save_story_board, save_story_reply } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData } from 'utils/functions';
import CommonHeader from 'component/CommonHeader';
import { STACK } from 'constants/routes';
import { CommonImagePicker } from 'component/CommonImagePicker';
import { Modalize } from 'react-native-modalize';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonLoading } from 'component/CommonLoading';
import Modal from 'react-native-modal';
import ReplyRegiPopup from 'component/story/ReplyRegiPopup';
import LikeListPopup from 'component/story/LikeListPopup';
import { useEffect, useRef, useState } from 'react';
import { CommonBtn } from 'component/CommonBtn';


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
  const [isReplyVisible, setIsReplyVisible] = React.useState(false);
  
  const [storyBoardSeq, setStoryBoardSeq] = React.useState(props.route.params.storyBoardSeq);
  const [storyType, setStoryType] = React.useState(isEmptyData(props.route.params.storyType) ? props.route.params.storyType : ''); // 스토리 유형

  // 선택된 댓글 데이터(댓글 등록 모달 적용)
  const [selectedReplyData, setSelectedReplyData] = React.useState({
    storyReplySeq: 0,
    depth: 0,
    isSecret: false,
  });

  // 스토리 데이터
  const [storyData, setStoryData] = React.useState({
    board: {},
    imageList: [],
    voteList: [],
    replyList: [],
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

  /* #########################################################################################################
  ######## 댓글 모달 관련
  ######################################################################################################### */

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
      setSelectedReplyData({
        storyReplySeq: _storyReplySeq,
        depth: _depth,
        isSecret: _isSecret,
      });
      setIsReplyVisible(true);
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

  // ############################################################################# 수정하기 이동
  const goStoryModify = async () => {
    // 팝업 닫기
    storyMod_onClose();

    navigation.navigate(STACK.COMMON, {
      screen: 'StoryEdit',
      params: {
        storyBoardSeq: storyBoardSeq,
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
                voteInfo: _voteInfo,
              });
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

  const [likeListPopup, setLikeListPopup] = useState(false);
  const [likeListTypePopup, setLikeListTypePopup] = useState('');
  const [replyInfo, setReplyInfo] = useState({});

  const popupStoryBoardActive = () => {
    setLikeListPopup(true);
    setLikeListTypePopup('BOARD');
  };

  const popupStoryReplyActive = (_storyReplySeq:number, _depth:number, replyInfo:{}) => {
    setLikeListPopup(true);
    setLikeListTypePopup('REPLY');
    setSelectedReplyData({
      storyReplySeq: _storyReplySeq,
      depth: _depth,
    });
    setReplyInfo(replyInfo);
  };

  const likeListCloseModal = () => {
    setLikeListPopup(false);
  };

  // ############################################################################# 투표하기 실행
  const voteProc = async (storyVoteSeq:number) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
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
          //matchType: 'STORY',
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
                  //matchType: 'STORY',
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
  }

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
        <SpaceView viewStyle={_styles.replyItemWarp}>
          <SpaceView ml={depthStyleSize} viewStyle={_styles.replyItemTopArea}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-start'}}>

              {/* 썸네일 */}
              <SpaceView>
                <TouchableOpacity 
                  style={_styles.imgCircle}
                  disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq || storyData.board?.story_type == 'SECRET' || isApplySecret}
                  onPress={() => { profileCardOpenPopup(item?.member_seq, item?.open_cnt, false); }}
                >
                  <Image source={applyMsgImg} style={_styles.replyImageStyle} resizeMode={'cover'} />
                </TouchableOpacity>
                {memberBase?.member_seq === item?.member_seq && (
                  <SpaceView viewStyle={_styles.myReplyChk}>
                    <Image source={gender == 'M' ? ICON.maleIcon : ICON.femaleIcon} style={styles.iconSquareSize(13)} resizeMode={'cover'} />
                  </SpaceView>
                )}
              </SpaceView>

              <SpaceView ml={5} pt={3} viewStyle={{flexDirection: 'column', width: _w}}>

                {/* 닉네임, 타임 텍스트 */}
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={_styles.replyNickname}>
                    <Text style={_styles.replyNicknameText(storyData.board?.story_type, item.gender)}>{applyNickname}</Text>{' '}
                    <Text style={[_styles.replyTimeText, {justifyContent: 'center'}]}>{item.time_text}</Text>     
                  </Text>
                  <View>
                    {secretYn == 'Y' && (<Image source={item.gender == 'W' ? ICON.padlockFemale : ICON.padlockMale} style={{width: 14, height: 14,}} />)}
                  </View>
                </SpaceView>

                {/* 댓글 내용 */}
                <SpaceView mt={6} viewStyle={{ width: width - 90}}>
                  
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


                </SpaceView>

                {/* 버튼 영역 */}
                <SpaceView pt={2} mt={10} viewStyle={{alignItems: 'flex-start'}}>
                  <SpaceView viewStyle={_styles.replyItemEtcWrap}>

                    {/* 답글달기 버튼 */}
                    {depth == 1 && (
                      <>
                        <TouchableOpacity onPress={() => { replyModalOpenFunc(storyReplySeq, depth, false); }}>
                          <Text style={_styles.replyTextStyle}>답글달기</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* 좋아요 버튼 */}
                    <SpaceView viewStyle={_styles.likeArea}>
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
                    </SpaceView>

                  </SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>

          </SpaceView>
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
    getStoryBoard('REFRESH', 1);
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <CommonHeader 
        title={(storyData.board?.story_type == 'STORY' ? '스토리' : storyData.board?.story_type == 'VOTE' ? '투표' : '시크릿')}
        type={'STORY_DETAIL'} 
        mstImgPath={findSourcePath(storyData.board?.mst_img_path)} 
        nickname={storyData.board?.nickname}
        gender={storyData.board?.gender}
        profileScore={storyData.board?.profile_score}
        authLevel={storyData.board?.auth_acct_cnt}
        storyType={storyData.board?.story_type}
        secretYn={storyData.board?.secret_yn}
        nicknameModifier={storyData.board?.nickname_modifier}
        nicknameNoun={storyData.board?.nickname_noun}
      />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{minHeight: height}}
      >

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
              <View style={_styles.pagingContainer}>
                {storyData.board?.story_type == 'VOTE' ? (
                  <>
                    {storyData.voteList?.map((item, index) => {
                      return (
                        <View style={_styles.dotContainerStyle} key={'dot' + index}>
                          <SpaceView viewStyle={_styles.pagingDotStyle(index == currentIndex)} />
                        </View>
                      )
                    })}
                  </>
                ) : (
                  <>
                    {storyData.imageList?.map((item, index) => {
                      return (
                        <View style={_styles.dotContainerStyle} key={'dot' + index}>
                          <SpaceView viewStyle={_styles.pagingDotStyle(index == currentIndex)} />
                        </View>
                      )
                    })}
                  </>
                )}
              </View>

              <FlatList
                ref={imgRef}
                data={storyData.board?.story_type == 'VOTE' ? storyData.voteList : storyData.imageList}
                renderItem={ImageRender}
                onScroll={handleScroll}
                showsHorizontalScrollIndicator={false}
                horizontal
                pagingEnabled
              />

              {/* ###################################################################################### 투표 선택 영역 */}
              {storyData.board?.story_type == 'VOTE' && (
                <>
                  <SpaceView viewStyle={{position: 'absolute', bottom: 20, left: 0, right: 0, zIndex: 1,}}>

                    {/* 투표 선택 알림글 */}
                    {isEmptyData(storyData.board?.vote_time_text) && (
                      <>
                        <SpaceView pl={20} mb={5} viewStyle={{width: '100%',}}>
                          <Text style={_styles.voteDescText}>투표 후에도 선택을 바꿀 수 있습니다.&nbsp;
                              <Text style={_styles.voteTimeText}>{storyData.board?.vote_time_text}</Text>
                          </Text>
                        </SpaceView>
                      </>
                    )}

                    <SpaceView viewStyle={_styles.voteSelectArea}>
                      {storyData.voteList?.length > 1 && (
                        <SpaceView mb={20} viewStyle={_styles.voteArea}>

                          {/* ########################## 투표 이미지 영역 1 */}
                          <TouchableOpacity 
                            disabled={storyData.voteList[0]?.vote_yn == 'Y' || storyData?.voteInfo?.isVoteEnd}
                            onPress={() => { voteProc(storyData.voteList[0]?.story_vote_seq) }}
                            style={_styles.voteImgArea(0)}
                          >
                            <SpaceView viewStyle={_styles.voteImgStyle('#FFFFFF')}>
                              <Image source={findSourcePath(storyData.voteList[0]?.file_path)} style={styles.iconSquareSize(85)} resizeMode={'cover'} />
                            </SpaceView>

                            {/* 선택한 투표 표시 */}
                            {storyData.voteList[0]?.vote_yn == 'Y' &&
                              <Image source={ICON.chatRed} style={[styles.iconSquareSize(25), {position: 'absolute', top: 0, right: -3, zIndex: 1}]} />
                            }

                            {/* 투표 갯수 */}
                            <SpaceView viewStyle={_styles.voteMmbrCntArea(storyData?.voteInfo?.isVoteEnd, storyData?.voteInfo?.isVoteDraw, storyData?.voteInfo?.voteWinIdx == 1)}>
                              <Text style={_styles.votePickText}>
                                {storyData?.voteInfo?.isVoteEnd && !storyData?.voteInfo?.isVoteDraw && storyData?.voteInfo?.voteWinIdx == 1 ? 'PICK' : storyData.voteList[0]?.vote_member_cnt + '표'}
                              </Text>
                            </SpaceView>
                          </TouchableOpacity>

                          {/* ########################## 투표 이미지 영역 2 */}
                          <TouchableOpacity
                            disabled={storyData.voteList[1]?.vote_yn == 'Y' || storyData?.voteInfo?.isVoteEnd}
                            onPress={() => { voteProc(storyData.voteList[1]?.story_vote_seq) }}
                            style={_styles.voteImgArea(1)}
                          >
                            <SpaceView viewStyle={_styles.voteImgStyle('#5A707F')}>
                              <Image source={findSourcePath(storyData.voteList[1]?.file_path)} style={styles.iconSquareSize(85)} resizeMode={'cover'} />
                            </SpaceView>

                            {/* 선택한 투표 표시 */}
                            {storyData.voteList[1]?.vote_yn == 'Y' &&
                              <Image source={ICON.chatRed} style={[styles.iconSquareSize(25), {position: 'absolute', top: 0, right: -3, zIndex: 1}]} />
                            }

                            {/* 투표 갯수 */}
                            <SpaceView viewStyle={_styles.voteMmbrCntArea(storyData?.voteInfo?.isVoteEnd, storyData?.voteInfo?.isVoteDraw, storyData?.voteInfo?.voteWinIdx == 2)}>
                              <Text style={_styles.votePickText}>
                                {storyData?.voteInfo?.isVoteEnd && !storyData?.voteInfo?.isVoteDraw && storyData?.voteInfo?.voteWinIdx == 2 ? 'PICK' : storyData.voteList[1]?.vote_member_cnt + '표'}
                              </Text>
                            </SpaceView>
                          </TouchableOpacity>

                          {/* ########################## 투표 명 */}
                          <SpaceView>
                            <SpaceView mb={13} viewStyle={_styles.voteNameArea(0)}>
                              <Text style={_styles.voteNameText('#000000')}>{storyData.voteList[0]?.vote_name}</Text>
                            </SpaceView>

                            <SpaceView viewStyle={_styles.voteNameArea(1)}>
                              <Text style={_styles.voteNameText('#FFFFFF')}>{storyData.voteList[1]?.vote_name}</Text>
                            </SpaceView>
                          </SpaceView>

                          {/* ########################## VS OR END 표기 */}
                          <SpaceView viewStyle={_styles.voteVsArea}>
                            <Text style={_styles.voteVsText}>{storyData?.voteInfo?.isVoteEnd ? 'END' : 'VS'}</Text>
                          </SpaceView>

                        </SpaceView>
                      )}
                    </SpaceView>
                  </SpaceView>

                  {/* 투표 dim 처리 */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', '#ffffff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={_styles.voteDimArea} />                  
                </>
              )}
            </SpaceView>

            

            {/* ###################################################################################### 버튼 영역 */}
            <SpaceView mt={20}>
              <SpaceView pl={20} pr={20} pb={10} mb={8} viewStyle={_styles.replyEtcArea}>
                <SpaceView viewStyle={{width: '100%', height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>

                  {/* ################################################################################################# 작성자 정보 영역 */}
                  <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                    {(storyData.board?.secret_yn == 'Y' || storyData.board?.story_type == 'SECRET') ? (
                      <TouchableOpacity
                        disabled={memberBase.gender === storyData.board?.gender || memberBase?.member_seq === storyData.board?.member_seq}
                        //onPress={() => { secretPropfilePopupOpen(); }}
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

                          {memberBase?.member_seq != 905 && (
                            <>
                              {/* 베스트 인상, 인증 레벨 */}
                                <>
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
                                </>
                              
                            </>
                          )}

                          {/* 닉네임 */}
                          <SpaceView mt={3}>
                            <Text style={_styles.nicknameText(storyData.board?.story_type == 'SECRET' || storyData.board?.secret_yn == 'Y', storyData.board?.gender, 12)}>{storyData.board?.nickname}</Text>
                          </SpaceView>
                        </SpaceView>
                      </>
                    )}
                  </SpaceView>

                  {/* ################################################################################################# 버튼 영역 */}
                  <SpaceView viewStyle={{flexDirection: 'row', position: 'absolute', top: 0, right: 0,}}>

                    {/* 좋아요 버튼 */}
                    <TouchableOpacity 
                      onPress={() => { storyLikeProc('BOARD', 0); }} 
                      hitSlop={commonStyle.hipSlop20}>

                      {storyData.board?.member_like_yn == 'N' ? (
                        <Image source={ICON.heartOffIcon} style={styles.iconSquareSize(20)} />
                      ) : (
                        <Image source={ICON.heartOnIcon} style={styles.iconSquareSize(20)} />
                      )}
                    </TouchableOpacity>

                    {/* 비밀 댓글 버튼 */}
                    {(memberBase?.member_seq != storyData.board?.member_seq && storyData.board?.story_type != 'SECRET') && (
                      <TouchableOpacity style={{marginLeft: 12}} onPress={() => { replyModalOpen(0, 0, true); }}>
                        <Image source={ICON.speechDotline} style={styles.iconSquareSize(20)} />
                      </TouchableOpacity>
                    )}

                    {/* 일반 댓글 버튼 */}
                    <TouchableOpacity style={{flexDirection: 'row', marginLeft: 12}} onPress={() => { replyModalOpen(0, 0, false); }}>
                      <Image source={ICON.reply} style={styles.iconSquareSize(21)} />
                    </TouchableOpacity>
                    
                    {/* 메뉴바 버튼 */}
                    {(memberBase?.member_seq == storyData.board?.member_seq) && (
                      <TouchableOpacity onPress={() => { storyMod_onOpen(); }} style={{flexDirection:'row', alignItems: 'center', marginLeft: 12}}>
                        <View style={[_styles.ivoryDot, {marginRight: 3}]}></View>
                        <View style={[_styles.ivoryDot, {marginRight: 3}]}></View>
                        <View style={_styles.ivoryDot}></View>
                      </TouchableOpacity>
                    )}
                  </SpaceView>
                </SpaceView>
              </SpaceView>

              {/* ###################################################################################### 내용 영역 */}
              <SpaceView mt={8} pl={20} pr={20} pb={15} viewStyle={{borderBottomWidth: 1, borderBottomColor: '#eee'}}>
                <Text style={_styles.contentsText}>{storyData.board?.contents}</Text>
                <Text style={_styles.timeText}>{storyData.board?.time_text}</Text>
              </SpaceView>

              {/* ###################################################################################### 댓글 영역 */}
              <SpaceView ml={20} mr={20}>
                {/* <TouchableOpacity style={{marginLeft: 15}} onPress={() => { replyModalOpen(0, 0); }}>
                    <Image source={ICON.reply} style={styles.iconSquareSize(21)} />
                  </TouchableOpacity> */}

                <SpaceView mt={15} mb={10} viewStyle={{flexDirection:'row'}}>
                    <Text style={_styles.replyLengthText}>댓글{storyData.replyList?.length + '개'}</Text>
                    <TouchableOpacity 
                      hitSlop={commonStyle.hipSlop10}
                      style={{marginLeft: 15}}
                      onPress={() => { popupStoryBoardActive(); }}>
                      <Text style={_styles.likeCntText}>좋아요{isEmptyData(storyData.board?.like_cnt) ? storyData.board?.like_cnt + '개' : '0개'}</Text>
                    </TouchableOpacity>  
                </SpaceView>

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
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </ScrollView>
      </LinearGradient>

      {/* ##################################################################################
                댓글 입력 팝업
      ################################################################################## */}
      
      <ReplyRegiPopup 
        isVisible={isReplyVisible} 
        storyBoardSeq={storyData?.board?.story_board_seq}
        storyReplySeq={selectedReplyData.storyReplySeq}
        depth={selectedReplyData.depth}
        isSecret={selectedReplyData.isSecret}
        callbackFunc={replyRegiCallback} 
      />

      {/* ##################################################################################
                좋아요 목록 팝업
      ################################################################################## */}
      <LikeListPopup
        isVisible={likeListPopup}
        closeModal={likeListCloseModal}
        type={likeListTypePopup}
        _storyBoardSeq={props.route.params.storyBoardSeq}
        storyReplyData={selectedReplyData}
        replyInfo={replyInfo}
        profileOpenFn={profileCardOpenPopup}
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

    return (
      <>
        <SpaceView pl={15} pr={15}>
          {storyData.board?.story_type == 'STORY' || storyData.board?.story_type == 'SECRET' ? (
            <Image source={url} style={_styles.imageStyle} resizeMode={'cover'} />
          ) : (
            <>
              <SpaceView mb={15}>
                <Image source={url} style={[_styles.imageStyle]} resizeMode={'cover'} />
              </SpaceView>
            </>
          )}
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

  titleText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    color: '#000',
  },
  imgArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imgItem: {
    backgroundColor: 'rgba(155, 165, 242, 0.12)',
    marginHorizontal: 4,
    marginVertical: 5,
    borderRadius: 20,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  imageStyle: {
    flex: 1,
    width: width - 30,
    height: width * 1.3,
  },
  btnArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regiBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    //width: 200,
  },
  regiBtnText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#555555',
  },
  pagingContainer: {
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    bottom: width * 1.3 - 30,
    left: 0,
    right: 0,
  },
  pagingDotStyle: (isOn:boolean) => {
    return {
      backgroundColor: isOn ? '#FFDD00' : '#34447A',
      width: 25,
      height: 3,
    };
  },
  dotContainerStyle: {
    backgroundColor: '#000',
  },
  activeDot: {
    backgroundColor: 'white',
  },
  contentsText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#E1DFD1',
  },
  timeText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#ABA99A',
    marginTop: 10,
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
  replyItemWarp: {
    marginBottom: 20,
  },
  replyItemTopArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  replyImageStyle: {
    width: 40,
    height: 40,
  },
  replyNickname: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#D5CD9E',
    marginRight: 5,
  },
  replyContents: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#E1DFD1',
  }, 
  replyTextDel: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#FFF6BE',
  },
  replyNicknameText: (storyType:string, gender:string) => {
    let clr = '#D5CD9E';

    // if(storyType == 'SECRET') {
    //   if(gender == 'M') {
    //     clr = '#7986EE';
    //   } else {
    //     clr = '#FE0456';
    //   }
    // }

    return {
      color: clr,
    };
  },
  replyTimeText: {
    fontFamily: 'Pretendard-Light',
    color: '#ABA99A',
    fontSize: 12,
  },
  replyItemEtcWrap: {
    width: '93%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyTextStyle: {
    fontFamily: 'Pretendard-Light',
    color: '#FFF6BE',
    fontSize: 12,
  },
  replyLengthText: {
    fontFamily: 'Pretendard-Light',
    color: '#D5CD9E',
    fontSize: 12,
    marginLeft: 1,
  },
  likeCntText: {
    fontFamily: 'Pretendard-Light',
    color: '#D5CD9E',
    fontSize: 12,
  },
  replyLikeCntText: {
    fontFamily: 'Pretendard-Light',
    color: '#FFF6BE',
    fontSize: 12,
    marginLeft: 2,
  },
  likeArea: {
    flexDirection: 'row',
  },
  nicknameText: (isSecret:boolean, gender:string, _frSize:number) => {
    let clr = '#D5CD9E';
    // if(isSecret) {
    //   if(gender == 'M') {
    //     clr = '#7986EE';
    //   } else {
    //     clr = '#FE0456';
    //   }
    // }

    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: _frSize,
      color: clr,
    };
  },
  imgCircle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFDD00',
    width: 40,
    height: 40,
    overflow: 'hidden',
    borderRadius: 50,
    marginRight: 5,
  },
  scoreText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    color: '#FFF',
  },
  voteArea:  {
    width: width,
    height: 95,
    alignItems: 'center',
  },
  voteSelectArea: {
    flexWrap: 'wrap',
    position: 'relative',
    flex:1,
  },
  voteVsArea: {
    width: 55,
    paddingVertical: 3,
    backgroundColor: '#333B41',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -27.5}, {translateY: -12}],
    zIndex: 2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteVsText: {
    color: '#FFF',
    fontFamily: 'Pretendard-Bold',
    fontSize: 12,
  },
  voteImgStyle: (bdcr:string) => {
    return {
      borderWidth: 4,
      borderRadius: 70,
      borderColor: bdcr,
      overflow: 'hidden',
    };
  },
  voteImgArea: (idx:number) => {
    return {
      position: 'absolute',
      zIndex: 5,
      left: idx == 0 ? 15 : undefined,
      right: idx == 1 ? 15 : undefined,
      flexDirection: 'column',
      alignItems: 'center',
    };
  },
  voteNameArea: (orderSeq:number) => {
    return {
      backgroundColor: orderSeq == 0 ? '#FFF' : '#7A85EE',
      width: width - 130,
      height: 40,
      /* position: 'absolute',
      top: orderSeq == 0 ? 0.5 : 50,
      left: orderSeq == 0 ? 10 : -width + 100, */
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    };
  },
  voteNameText: (cr:string) => {
    return {
      color: cr,
      fontFamily: 'Pretendard-Light',
      fontSize: 11,
      paddingHorizontal: 40,
    };
  },
  voteDescArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteDescText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#333B41',
    textAlign: 'center',
  },
  voteTimeText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#FF0060',
    marginLeft: 3,
  },
  voteBtn: {
    marginHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
  },
  mstImgStyle: {
    width: 40,
    height: 40,
  },
  voteMmbrCntArea: (isVoteEnd:boolean, isVoteDraw:boolean, isWin:boolean) => {

    let bgColor = '#FFDD00';
    if(isVoteEnd && !isVoteDraw) {
      if(isWin) {
        bgColor = '#32F9E4';
      } else {
        bgColor = '#333B41';
      }
    };

    return {
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3,
      backgroundColor: bgColor,
      paddingVertical: 2,
      paddingHorizontal: 5,
      borderRadius: 30,
      marginTop: -10,
    };
  },
  votePickText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Pretendard-Regular',
  },
  votePickImg: {
    zIndex: 1,
    width: width - 215,
    height: 180,
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  voteCntText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Pretendard-Regular',
  },
  voteDimArea: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    height: 250,
    marginHorizontal: 15,
  },
  ivoryDot: {
    width: 4,
    height: 4,
    backgroundColor: '#FFF6BE',
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
});
import { useIsFocused, useNavigation, useFocusEffect  } from '@react-navigation/native';
import { CommonCode, FileInfo, LabelObj, ProfileImg, LiveMemberInfo, LiveProfileImg, ScreenNavigationProp } from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { get_story_board_list } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON, PROFILE_IMAGE } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { ColorType } from '@types';
import { isEmptyData } from 'utils/functions';
import { STACK } from 'constants/routes';
import AuthLevel from 'component/common/AuthLevel';
import ProfileGrade from 'component/common/ProfileGrade';
import MasonryList from '@react-native-seoul/masonry-list';
import { CommonLoading } from 'component/CommonLoading';
import LinearGradient from 'react-native-linear-gradient';



/* ################################################################################################################
###### Story
################################################################################################################ */

const { width, height } = Dimensions.get('window');

export const Story = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 여부
  const flatListRef = useRef(null);

  const [isTopBtn, setIsTopBtn] = useState(false);

  const [isEmpty, setIsEmpty] = useState(false); 
  //const [storyList, setStoryList] = useState<any>([]); // 스토리 목록
  const [storyList, setStoryList] = React.useState<any>([]);
  const [pageNum, setPageNum] = useState(0); // 페이지 번호

  // 스토리 등록 이동
  const goStoryRegister = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'StoryRegi', });
  };

  // 스토리 알림 이동
  const goStoryActive = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'StoryActive', });
  };

  // 스토리 상세 이동
  const goStoryDetail = async (storyBoardSeq:number) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryDetail',
      params: {
        storyBoardSeq: storyBoardSeq,
      }
    });
  };

  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    getStoryBoardList('REFRESH', 0);
  };

  // ##################################################################################### 목록 더보기
  const loadMoreData = () => {
    console.log('ADD!!!!!!!!!!!!!!');
    getStoryBoardList('ADD', pageNum+1);
  };

  // ##################################################################################### 맨위 이동
  const scrollToTop = () => {
    flatListRef.current.scrollToIndex({ animated: true, index: 0 });
  };

  // ##################################################################################### 프로필 카드 열람
  const profileCardOpenPopup = (member_seq:number) => {
    show({
      title: '프로필 카드 열람',
      content: '(7일간)프로필을 열람하시겠습니까?',
      passAmt: '15',
      confirmCallback: function() {
        if(memberBase?.pass_has_amt >= 15) {
          profileCardOpen();
        }
      },
      cancelCallback: function() {

      },
    });
  };

  const profileCardOpen = () => {

  };

  // ############################################################################# 스토리 목록 조회
  const getStoryBoardList = async (_type:string, _pageNum:number) => {
    try {
      if(_type == 'REFRESH') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      };

      const body = {
        page_num: _pageNum,
      };

      console.log('body ::::: ' , body);

      const { success, data } = await get_story_board_list(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            if(_type == 'ADD') {
              let dataArray = storyList;
              data?.story_list.map((item: any) => {
                dataArray.push(item);
              })
              setStoryList(dataArray);
            } else {
              setStoryList(data?.story_list);
            };

            if(data?.story_list.length > 0) {
              setPageNum(isEmptyData(data?.page_num) ? data?.page_num : 0);
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

  /* ################################################################################ 스크롤 제어 */
  const handleScroll = async (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if(yOffset > 300) {
      setIsTopBtn(true);
    } else {
      setIsTopBtn(false);
    }
  };

  /* ##################################################################################################################################
  ################## 아이템 렌더링 관련 함수
  ################################################################################################################################## */

  // ###############################  목록 아이템 렌더링
  const RenderListItem = React.memo(({ item, type }) => {
    const storyBoardSeq = item.story_board_seq; // 스토리 게시글 번호
    const storyType = item?.story_type; // 스토리 유형
    const imgPath = findSourcePathLocal(item?.story_img_path);
    const voteImgPath01 = findSourcePathLocal(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePathLocal(item?.vote_img_path_02);

    let _width = 0; // 가로길이
    let _height = 0; // 세로길이

    if(type == 'LARGE') {
      _width = width - 16;
      _height = width - 43;
      /* _width = (width - 43) / 2;
      _height = (width - 43) /1; */
    } else if(type == 'MEDIUM') {
      _width = (width - 40) / 1.91;
      _height = width - 40;
    } else {
      _width = (width - 40) / 1.91;
      _height = (width - 45) / 2;
    }

    return (
      <>
        <SpaceView mb={type == 'SMALL' ? 0 : 5} viewStyle={_styles.itemArea02(_width, _height)}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => { goStoryDetail(storyBoardSeq); }}>

          {(storyType == 'SECRET' || (storyType == 'STORY' && !isEmptyData(imgPath))) ? (
            <>
              <SpaceView viewStyle={_styles.noImageArea(item?.gender)} >

                {/* 썸네일 이미지 */}
                <SpaceView>
                  <Image source={storyType == 'SECRET' ? ICON.storyNoIcon : findSourcePath(item?.mst_img_path)} style={_styles.mstImgStyle(type == 'SMALL' ? 50 : 80, 40)} resizeMode={'cover'} />
                </SpaceView>

                {/* 스토리 유형 */}
                <SpaceView viewStyle={_styles.typeArea(storyType)}>
                  <Text style={_styles.typeText} numberOfLines={type == 'SMALL' ? 2 : 6}>{item?.story_type_name}</Text>
                </SpaceView>

                <SpaceView mt={10} viewStyle={{flexDirection: 'column', alignItems: 'center'}}>
                  {/* <AuthLevel authAcctCnt={item?.auth_acct_cnt} type={'BASE'} />
                  <ProfileGrade profileScore={item?.profile_score} type={'BASE'} /> */}

                  {/* 프로필 평점, 인증 레벨 */}
                  {((isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) || item?.profile_score >= 7.0) && (
                    <Text style={_styles.activeText('#333333')}>
                      {item?.profile_score >= 7.0 && item?.profile_score}
                      {((isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) && item?.profile_score >= 7.0) && ' | '}
                      {(isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) && 'Lv ' + item?.auth_acct_cnt}
                    </Text>
                  )}

                  {/* 닉네임 */}
                  <Text style={_styles.nicknameText('#333333')}>{item?.nickname}</Text>
                </SpaceView>

                {/* 내용 */}
                <SpaceView mt={25} pl={10} pr={10}>
                  <Text style={_styles.contentsText('#333333')}>{item?.contents}</Text>
                </SpaceView>
                
              </SpaceView>
            </>
          ) : (
            <>
              {/* 썸네일 이미지 */}
              <SpaceView>
                {item?.story_type == 'VOTE' ? (
                  <Image source={voteImgPath01} style={{width: _width, height: _height}} resizeMode={'cover'} />
                ) : (
                  <Image source={imgPath} style={{width: _width, height: _height}} resizeMode={'cover'} />
                )}
              </SpaceView>

              {/* 스토리 유형 */}
              <SpaceView viewStyle={_styles.typeArea(storyType)}>
                <Text style={_styles.typeText}>{item?.story_type_name}</Text>
              </SpaceView>

              {/* 프로필 영역 */}
              <SpaceView viewStyle={_styles.profileArea}>
                <SpaceView mr={5}>
                  <TouchableOpacity onPress={() => { profileCardOpenPopup(item?.member_seq); }}>
                    <Image source={storyType == 'SECRET' ? ICON.storyNoIcon : findSourcePath(item?.mst_img_path)} style={_styles.mstImgStyle(30, 20)} resizeMode={'cover'} />
                  </TouchableOpacity>
                </SpaceView>

                <SpaceView>
                  {(item?.profile_score >= 7.0 || (isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5)) && (
                    <Text style={_styles.activeText('#ffffff')}>
                      {item?.profile_score >= 7.0 && item?.profile_score}
                      {((isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) && item?.profile_score >= 7.0) && ' | '}
                      {(isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) && 'Lv ' + item?.auth_acct_cnt}
                    </Text>
                  )}
                  <Text style={_styles.nicknameText('#ffffff')}>{item?.nickname}</Text>
                </SpaceView>
              </SpaceView>

              <SpaceView viewStyle={_styles.bottomArea}>
                {/* <SpaceView><Text style={_styles.contentsText('#fff')}>{item?.contents}</Text></SpaceView> */}
                {/* <SpaceView mt={8}><Text style={_styles.contentsText}>{item?.time_text}</Text></SpaceView> */}
              </SpaceView>              

              {/* 딤 처리 영역 */}
              <LinearGradient
                colors={['transparent', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={_styles.dimsArea} />
            </>
          )}

          </TouchableOpacity>
        </SpaceView>
      </>
    );
  });

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      setIsRefreshing(false);
      getStoryBoardList('BASE', 0);
    } else {
      //setStoryList([]);
    }
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <TopNavigation currentPath={'Story'} />

      <SpaceView>

        <FlatList
          data={storyList}
          ref={flatListRef}
          keyExtractor={(item, index) => index.toString()}
          style={_styles.contentWrap}
          contentContainerStyle={{ paddingBottom: 30 }} // 하단 여백 추가
          contentInset={{ bottom: 60 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          onScroll={handleScroll} // 스크롤 감지 이벤트 핸들러
          /* getItemLayout={(data, index) => (
            {
                length: (width - 54) / 2,
                offset: ((width - 54) / 2) * index,
                index
            }
          )} */
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={isLoadingMore && <Text>Loading more...</Text>}
          renderItem={({ item:innerItem, index:innerIndex }) => {

            return (
              <>
                <SpaceView key={innerIndex} viewStyle={_styles.itemWrap(innerItem.type)}>

                  {innerItem.type == 'ONLY_LARGE' ? (
                    <>
                      {innerItem.large_list.map((item, index) => {
                        return (
                          <RenderListItem item={item} type={item?.size_type} />
                        )
                      })}
                    </>
                  ) : innerItem.type == 'ONLY_MEDIUM' ? (
                    <>
                      <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        {innerItem.medium_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}

                        {innerItem.medium_list.length < 2 && (
                          <LinearGradient colors={['#7984ED', '#8759D5']} style={_styles.dummyArea('M')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                            <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} />
                          </LinearGradient>
                        )}
                      </SpaceView>
                    </>
                  ) : innerItem.type == 'ONLY_SMALL' ? (
                    <>
                      <SpaceView mb={5} viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        {innerItem.small_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}

                        {innerItem.medium_list.length < 2 && (
                          <LinearGradient colors={['#7984ED', '#8759D5']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                            <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} />
                          </LinearGradient>
                        )}
                      </SpaceView>
                    </>
                  ) : innerItem.type == 'COMPLEX_MEDIUM' ? (
                    <>
                      <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        {innerItem.medium_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}
                        <SpaceView viewStyle={{flexDirection: 'column'}}>
                          {innerItem.small_list.map((item, index) => {
                            return (
                              <SpaceView mb={index == 0 ? 5 : 0}>
                                <RenderListItem item={item} type={item?.size_type} />
                              </SpaceView>
                            )
                          })}

                          {innerItem.small_list.length < 2 && (
                            <LinearGradient colors={['#7984ED', '#8759D5']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                              <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} />
                            </LinearGradient>
                          )}
                        </SpaceView>
                      </SpaceView>
                    </>
                  ) : innerItem.type == 'COMPLEX_SMALL' ? (
                    <>
                      <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <SpaceView viewStyle={{flexDirection: 'column'}}>
                          {innerItem.small_list.map((item, index) => {
                            return (
                              <SpaceView mb={index == 0 ? 5 : 0}>
                                <RenderListItem item={item} type={item?.size_type} />
                              </SpaceView>
                            )
                          })}
                          {innerItem.small_list.length < 2 && (
                              <LinearGradient colors={['#7984ED', '#8759D5']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                                <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} />
                              </LinearGradient>
                          )}
                        </SpaceView>
                        {innerItem.medium_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}
                      </SpaceView>
                    </>
                  ) : (
                    <>
                      
                    </>
                  )}

                </SpaceView>
              </>
            )
          }}
        />
      </SpaceView>

      {/* ###################################################################################################### 하단 버튼 */}
      <SpaceView viewStyle={_styles.btnArea}>
        <SpaceView viewStyle={_styles.btnTextArea}>
          <TouchableOpacity onPress={() => { goStoryActive(); }} style={_styles.btnItemArea}>
            <Image source={ICON.clockIcon} style={styles.iconSquareSize(18)} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { goStoryRegister(); }} style={_styles.btnItemArea}>
            <Image source={ICON.storyPlusIcon} style={styles.iconSquareSize(18)} />
          </TouchableOpacity>
        </SpaceView>
      </SpaceView>

      {/* ###################################################################################################### 맨위 이동 버튼 */}

      {isTopBtn && (
        <SpaceView viewStyle={_styles.topBtnArea}>
          <TouchableOpacity onPress={() => { scrollToTop(); }}>
            <Text style={_styles.topBtnText}>TOP</Text>
            {/* <Image source={ICON.boxTipsIcon} style={styles.iconSquareSize(50)} /> */}
          </TouchableOpacity>
        </SpaceView>
      )}
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
    backgroundColor: '#fff',
  },
  contentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingBottom: 50,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    width: width,
    height: height-120,
  },
  itemWrap: (type:string) => {
    let loc = 'center';
    /* if(type == 'COMPLEX_RIGHT') {
      loc = 'flex-end';
    } else if(type == 'COMPLEX_LEFT') {
      loc = 'flex-start';
    } */

    return {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: loc,
      width: '100%',
    };
  },
  itemArea02: (width:number, height:number) => {
    return {
      width: width,
      height: height,
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 3,
    };
  },
  itemArea: (size:number) => {
    return {
      width: size,
      height: size,
      borderRadius: 10,
      overflow: 'hidden',
    };
  },
  dummyArea: (type:string) => {
    let _w = (width - 40) / 1.91;
    let _h = width - 40;

    if(type == 'S') {
      _w = (width - 40) / 1.91;
      _h = (width - 45) / 2;
    }

    return {
      width: _w,
      height: _h,
      backgroundColor: '#FE0456',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 3,
    };
  },
  dummyText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    color: '#fff',
  },
  btnArea: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  btnTextArea: {
    flexDirection: 'row',
  },
  btnItemArea: {
    width: 50,
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(38,38,38,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    color: '#fff',
  },
  profileArea: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  typeArea: (type:string) => {
    let bgColor = '#7986EE';

    if(type == 'VOTE') {
      bgColor = '#19DBE0';
    } else if(type == 'SECRET') {
      bgColor = '#FE0456';
    }

    return {
      position: 'absolute',
      top: 5,
      right: 5,
      backgroundColor: bgColor,
      borderRadius: 13,
      paddingVertical: 3,
      paddingHorizontal: 5,
    };
  },
  typeText: {
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 13,
    color: '#fff',
  },
  mstImgStyle: (size:number, bdRadius:number) => {
    return {
      width: size,
      height: size,
      borderRadius: bdRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#fff',
    };
  },
  contentsText: (_color:string) => {
    return {
      fontFamily: 'AppleSDGothicNeoR00',
      fontSize: 13,
      color: _color,
    };
  },
  activeText: (_color:string) => {
    return {
      fontFamily: 'AppleSDGothicNeoH00',
      fontSize: 13,
      color: _color,
    };
  },
  nicknameText: (_color:string) => {
    return {
      fontFamily: 'AppleSDGothicNeoEB00',
      fontSize: 13,
      color: _color,
      marginTop: -3,
    };
  },
  noImageArea: (gender:string) => {
    return {
      width: '100%',
      height: '100%',
      backgroundColor: gender == 'M' ? '#D5DAFC' : '#FEEFF2',
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
  topBtnArea: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBtnText: {
    textAlign: 'center',
    backgroundColor: '#222222',
    width: 100,
    paddingVertical: 2,
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 13,
    color: '#ACA6AB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dimsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.48,
    height: 60,
  },

});
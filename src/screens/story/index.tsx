import { useIsFocused, useNavigation, useFocusEffect  } from '@react-navigation/native';
import { CommonCode, FileInfo, LabelObj, ProfileImg, LiveMemberInfo, LiveProfileImg, ScreenNavigationProp } from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
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

  const [isBlackBg, setIsBlackBg] = useState(false);

  const [isLoad, setIsLoad] = useState(false); // 로딩 상태 체크
  const [isEmpty, setIsEmpty] = useState(false);

  const [storyList, setStoryList] = useState([]);



  const [itemList, setItemList] = useState([
    {
      idx: 1,
      type: 'ONLY_LARGE',
      lDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.manTmp3,
      }],
      mDataList: [],
      sDataList: [],
    },
    {
      idx: 2,
      type: 'COMPLEX_MEDIUM',
      lDataList: [],
      mDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.manTmp2,
      }],
      sDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.manTmp1,
      },
      {
        dummyYn: 'Y',
      }],
    },
    {
      idx: 3,
      type: 'ONLY_SMALL',
      lDataList: [],
      mDataList: [],
      sDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.womanTmp2,
      },
      {
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.womanTmp3,
      },
      {
        dummyYn: 'Y',
      }],
    },
    {
      idx: 2,
      type: 'COMPLEX_SMALL',
      lDataList: [],
      mDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.womanTmp1,
      }],
      sDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.manTmp5,
      },
      {
        dummyYn: 'Y',
      }],
    },
    {
      idx: 4,
      type: 'ONLY_LARGE',
      lDataList: [{
        dummyYn: 'N',
        imgUrl: PROFILE_IMAGE.womanTmp5,
      }],
      mDataList: [],
      sDataList: [],
    },
  ]);





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

  // ############################################################################# 스토리 목록 조회
  const getStoryBoardList = async () => {
    try {
      setIsLoading(true);

      const body = {
        
      };

      const { success, data } = await get_story_board_list(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setStoryList(data.story_list);
          
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

  /* ##################################################################################################################################
  ################## 아이템 렌더링 관련 함수
  ################################################################################################################################## */

  // ############################### 대 렌더링
  const LargeRenderItem = React.memo(({ item }) => {
    const storyBoardSeq = item.story_board_seq;
    const imgUrl = findSourcePathLocal(item?.story_img_path);
    const voteImgPath01 = findSourcePathLocal(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePathLocal(item?.vote_img_path_02);

    return (
      <>
        <SpaceView viewStyle={_styles.itemArea(width - 40)}>
          <TouchableOpacity onPress={() => { goStoryDetail(storyBoardSeq); }}> 
            <SpaceView>
              {item?.story_type == 'VOTE' ? (
                <Image source={voteImgPath01} style={styles.iconSquareSize(width - 40)} resizeMode={'cover'} />
              ) : (
                <Image source={imgUrl} style={styles.iconSquareSize(width - 40)} resizeMode={'cover'} />
              )}
            </SpaceView>

            <SpaceView viewStyle={_styles.topArea}>
              <Image source={findSourcePath(item?.mst_img_path)} style={_styles.mstImgStyle} resizeMode={'cover'} />
              <AuthLevel authAcctCnt={item?.auth_acct_cnt} type={'BASE'} />
              <ProfileGrade profileScore={item?.profile_score} type={'BASE'} />
            </SpaceView>

            <SpaceView viewStyle={_styles.bottomArea}>
              <SpaceView><Text style={_styles.contentsText}>{item?.contents}</Text></SpaceView>
              <SpaceView mt={8}><Text style={_styles.contentsText}>{item?.time_text}</Text></SpaceView>
            </SpaceView>

            <SpaceView viewStyle={_styles.typeArea(item?.story_type)}>
              <Text style={_styles.typeText}>{item?.story_type_name}</Text>
            </SpaceView>
          </TouchableOpacity>

        </SpaceView>
      </>
    );
  });

  // ############################### 중 렌더링
  const MediumRenderItem = React.memo(({ item }) => {
    const storyBoardSeq = item.story_board_seq;
    //const imgUrl = findSourcePath(item?.story_img_path); 운영 반영 시 적용
    const imgUrl = findSourcePathLocal(item?.story_img_path);
    const voteImgPath01 = findSourcePathLocal(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePathLocal(item?.vote_img_path_02);

    const voteImgList = [
      {url: findSourcePathLocal(item?.vote_img_path_01)},
      {url: findSourcePathLocal(item?.vote_img_path_02)},
    ];

    return (
      <>
        <SpaceView viewStyle={_styles.itemArea((width - 43) / 1.5)}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => { goStoryDetail(storyBoardSeq); }}>
            <SpaceView>
              {item?.story_type == 'VOTE' ? (
                <>
                  {/* <FlatList
                    data={voteImgList}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    pagingEnabled
                    renderItem={({ item, index }) => {

                      return (
                        <View style={{width: (width - 43) / 1.5, height: (width - 43) / 1.5}}>
                            <Image source={item.url} style={{width: (width - 43) / 1.5, height: (width - 43) / 1.5}} resizeMode={'cover'} />
                        </View>
                      )
                    }}
                  /> */}

                  <Image source={voteImgPath01} style={styles.iconSquareSize((width - 43) / 1.5)} resizeMode={'cover'} />
                </>
              ) : (
                <Image source={imgUrl} style={styles.iconSquareSize((width - 43) / 1.5)} resizeMode={'cover'} />
              )}
            </SpaceView>

            <SpaceView viewStyle={_styles.topArea}>
              <Image source={findSourcePath(item?.mst_img_path)} style={_styles.mstImgStyle} resizeMode={'cover'} />
              <AuthLevel authAcctCnt={item?.auth_acct_cnt} type={'BASE'} />
              <ProfileGrade profileScore={item?.profile_score} type={'BASE'} />
            </SpaceView>

            <SpaceView viewStyle={_styles.bottomArea}>
              <SpaceView><Text style={_styles.contentsText}>{item?.contents}</Text></SpaceView>
              <SpaceView mt={8}><Text numberOfLines={2} style={_styles.contentsText}>{item?.time_text}</Text></SpaceView>
            </SpaceView>

            <SpaceView viewStyle={_styles.typeArea(item?.story_type)}>
              <Text style={_styles.typeText}>{item?.story_type_name}</Text>
            </SpaceView>
          </TouchableOpacity>
        </SpaceView>
      </>
    );
  });

  // ############################### 소 렌더링
  const SmallRenderItem = React.memo(({ item }) => {
    const storyBoardSeq = item.story_board_seq;
    const imgUrl = findSourcePathLocal(item?.story_img_path);
    const voteImgPath01 = findSourcePathLocal(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePathLocal(item?.vote_img_path_02);

    return (
      <>
        <SpaceView viewStyle={_styles.itemArea((width - 55) / 3)}>
          <TouchableOpacity onPress={() => { goStoryDetail(storyBoardSeq); }}>
            <SpaceView>
              {item?.story_type == 'VOTE' ? (
                <Image source={voteImgPath01} style={{width: (width - 55) / 3, height: (width - 55) / 3}} resizeMode={'cover'} />
              ) : (
                <Image source={imgUrl} style={{width: (width - 55) / 3, height: (width - 55) / 3}} resizeMode={'cover'} />
              )}
            </SpaceView>

            <SpaceView viewStyle={_styles.bottomArea}>
              <SpaceView><Text style={_styles.contentsText}>{item?.contents}</Text></SpaceView>
              <SpaceView mt={8}><Text style={_styles.contentsText}>{item?.time_text}</Text></SpaceView>
            </SpaceView>

            <SpaceView viewStyle={_styles.typeArea(item?.story_type)}>
              <Text style={_styles.typeText}>{item?.story_type_name}</Text>
            </SpaceView>
          </TouchableOpacity>
        </SpaceView>
      </>
    );
  });











  // ###############################  목록 아이템 렌더링
  const RenderListItem = React.memo(({ item, type }) => {
    const storyBoardSeq = item.story_board_seq;
    const imgUrl = findSourcePathLocal(item?.story_img_path);
    const voteImgPath01 = findSourcePathLocal(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePathLocal(item?.vote_img_path_02);

    console.log('type :::::: ' , type);

    let _width = 0;
    let _height = 0;

    if(type == 'LARGE') {
      _width = width - 16;
      _height = width - 43;
      /* _width = (width - 43) / 2;
      _height = (width - 43) /1; */
    } else if(type == 'MEDIUM') {
      _width = (width - 40) / 1.64;
      _height = width - 40;
    } else {
      _width = (width - 40) / 2.27;
      _height = (width - 40);
    }

    return (
      <>
        <SpaceView mb={5} viewStyle={_styles.itemArea02(_width, _height)}>
          <TouchableOpacity onPress={() => { goStoryDetail(storyBoardSeq); }}>
            <SpaceView>
              {item?.story_type == 'VOTE' ? (
                <Image source={voteImgPath01} style={{width: _width, height: _height}} resizeMode={'cover'} />
              ) : (
                <Image source={imgUrl} style={{width: _width, height: _height}} resizeMode={'cover'} />
              )}
            </SpaceView>
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
      getStoryBoardList();
    };
  }, [isFocus]);

  return (
    <>
      <TopNavigation currentPath={'Story'} />

        {/* <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{backgroundColor: '#fff'}}> */}

          {/* <MasonryList
            data={storyList}
            //keyExtractor={(item): string => item.id}
            //numColumns={2}
            //showsVerticalScrollIndicator={false}
            //refreshing={isLoadingNext}
            //onRefresh={() => refetch({first: ITEM_CNT})}
            //onEndReachedThreshold={0.1}
            //onEndReached={() => loadNext(ITEM_CNT)}

            renderItem={({ item }) => (
              <>
                <View style={{width: item?.size_type == 'LARGE' ? '50%' : '50%'}}>
                  <ExampleRenderItem item={item} type={item?.size_type} />
                </View>
              </>
            )}
          /> */}

          <FlatList
            data={storyList}
            keyExtractor={(item) => item.id}
            //style={_styles.contentWrap}
            contentContainerStyle={_styles.contentWrap}
            showsVerticalScrollIndicator={false}
            //contentContainerStyle={{marginBottom: 50, paddingHorizontal: 10}}
            renderItem={({ item:innerItem, index:innerIndex }) => {

              return (
                <>
                  <SpaceView key={innerIndex} viewStyle={_styles.itemWrap}>
                    {innerItem.type == 'ONLY_LARGE' ? (
                      <>
                        {innerItem.large_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}
                      </>
                    ) : innerItem.type == 'COMPLEX' ? (
                      <>
                        {innerItem.complex_list.map((item, index) => {
                          return (
                            <RenderListItem item={item} type={item?.size_type} />
                          )
                        })}

                        {/* <SpaceView viewStyle={_styles.dummyArea(innerItem?.first_type)}>
                          <Text style={_styles.dummyText}>배너{innerItem.complex_list.length}</Text>
                        </SpaceView> */}

                        {innerItem.complex_list.length == 1 && (
                          <SpaceView viewStyle={_styles.dummyArea(innerItem?.first_type)}>
                            <Text style={_styles.dummyText}>배너</Text>
                          </SpaceView>
                        )}
                      </>
                    ) : (
                      <>
                        
                      </>
                    )}

                  </SpaceView>
                </>
              )
            }}


            /* renderItem={({ item }) => (
              <RenderListItem item={item} type={item?.size_type} />
            )} */
          />




          


          {/* ######################################################################### 첫번째 기존 UI */}
          {/* <FlatList
            contentContainerStyle={{marginBottom: 50, paddingHorizontal: 20}}
            //ref={noticeRef}
            data={storyList}
            renderItem={({ item:innerItem, index:innerIndex }) => {

              return (
                <>
                  <SpaceView key={innerIndex} viewStyle={{flexDirection: 'column'}} mb={10}>

                    {innerItem.type == 'ONLY_LARGE' ? (
                      <>
                        {innerItem.large_list.map((item, index) => {
                          return (
                            <LargeRenderItem item={item} />
                          )
                        })}
                      </>
                    ) : innerItem.type == 'ONLY_MEDIUM' ? (
                      <>
                        <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          {innerItem.medium_list.map((item, index) => {
                            return (
                              <MediumRenderItem item={item} />
                            )
                          })}

                          <SpaceView viewStyle={_styles.dummyArea('H')}>
                            <Text style={_styles.dummyText}>배너</Text>
                          </SpaceView>
                        </SpaceView>
                      </>
                    ) : innerItem.type == 'ONLY_SMALL' ? (
                      <>
                        <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          {innerItem.small_list.map((item, index) => {
                            return (
                              <SmallRenderItem item={item} />
                            )
                          })}

                          {innerItem.small_list.length == 1 ? (
                            <>
                              <SpaceView viewStyle={_styles.dummyArea('')}><Text style={_styles.dummyText}>배너</Text></SpaceView>
                              <SpaceView viewStyle={_styles.dummyArea('')}><Text style={_styles.dummyText}>배너</Text></SpaceView>
                            </>
                          ) : innerItem.small_list.length == 2 && (
                            <SpaceView viewStyle={_styles.dummyArea('')}><Text style={_styles.dummyText}>배너</Text></SpaceView>
                          )}

                        </SpaceView>
                      </>
                    ) : innerItem.type == 'COMPLEX_MEDIUM' ? (
                      <>
                        <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          {innerItem.medium_list.map((item, index) => {
                            return (
                              <MediumRenderItem item={item} />
                            )
                          })}
                          <SpaceView viewStyle={{flexDirection: 'column'}}>
                            {innerItem.small_list.map((item, index) => {
                              return (
                                <SpaceView mb={index == 0 ? 8 : 0}>
                                  <SmallRenderItem item={item} />
                                </SpaceView>
                              )
                            })}

                            {innerItem.small_list.length < 2 && (
                              <SpaceView viewStyle={_styles.dummyArea('')}><Text style={_styles.dummyText}>배너</Text></SpaceView>
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
                                <SpaceView mb={index == 0 ? 8 : 0}>
                                  <SmallRenderItem item={item} />
                                </SpaceView>
                              )
                            })}
                          </SpaceView>
                          {innerItem.small_list.length < 2 && (
                              <SpaceView viewStyle={_styles.dummyArea('')}><Text style={_styles.dummyText}>배너</Text></SpaceView>
                          )}
                          {innerItem.medium_list.map((item, index) => {
                            return (
                              <MediumRenderItem item={item} />
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
          /> */}

        {/* </ScrollView> */}

        <SpaceView viewStyle={_styles.btnArea}>
          <SpaceView viewStyle={_styles.btnTextArea}>
            <TouchableOpacity onPress={() => { goStoryActive(); }}>
              <Text style={_styles.btnText}>활동</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { goStoryRegister(); }}>
              <Text style={_styles.btnText}>등록</Text>
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
  },
  itemWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
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
    let _w = (width - 40) / 2.27;
    let _h = width - 40;

    if(type == 'SMALL') {
      _w = (width - 40) / 1.64;
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    width: 150,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  btnText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    color: '#fff',
  },
  topArea: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  typeArea: (type:string) => {
    return {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: '#7986EE',
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
  mstImgStyle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  contentsText: {
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 13,
    color: '#fff',
  },

  
});
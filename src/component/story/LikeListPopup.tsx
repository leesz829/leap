//import Modal from 'react-native-modal';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Image from 'react-native-fast-image';
import { findSourcePath, IMAGE, GIF_IMG, ICON } from 'utils/imageUtils';
import Carousel from 'react-native-snap-carousel';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { commonStyle, styles, modalStyle, layoutStyle } from 'assets/styles/Styles';
import { get_story_like_list } from 'api/models';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { usePopup } from 'Context';
import { ScrollView } from 'react-native-gesture-handler';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  closeModal: () => void;
  type: String;
  _storyBoardSeq: Number;
  selectedData: {};
  replyInfo: {};
  profileOpenFn: (memberSeq:number, openCnt:number, isSecret:boolean) => void;
}

export default function LikeListPopup({ isVisible, closeModal, type, _storyBoardSeq, selectedData, replyInfo, profileOpenFn }: Props) {
  const { show } = usePopup();
	const [isLoading, setIsLoading] = useState(false);

  const memberBase = useUserInfo(); // 본인 데이터

  // 좋아요 목록 갯수
  const [likeListCnt, setLikeListCnt] = React.useState(0);

  // 좋아요 목록 데이터
  const [likeListData, setLikeListData] = React.useState({
    likeList: [],
  });

  // 좋아요 목록 조회
	const getStoryLikeList = async () => {
		setIsLoading(true);
    setLikeListData({likeList: null});
    setLikeListCnt('0');

    // 스토리 게시물 좋아요 파람
    const boardBody = {
      story_board_seq: _storyBoardSeq,
      type: type,
    };

    // 스토리 댓글 좋아요 파람
    const replyBody = {
      story_reply_seq: replyInfo?.story_reply_seq,
      type: type,
    };

		try {
			const { success, data } = await get_story_like_list(type == 'BOARD' ? boardBody : replyBody);

			if (success) {
				if (data.result_code == '0000') {
          setLikeListData({likeList: data.like_list});
          setLikeListCnt(data.like_list.length);
				};
			} else {
				show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			}
		} catch (error) {
			show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

  // 프로필 카드 열기
  const profileOpen = async (memberSeq:number, openCnt:number) => {
    closeModal();
    profileOpenFn(memberSeq, openCnt, false);
  };

  React.useEffect(() => {
    if(isVisible){
      getStoryLikeList();
    }
	}, [isVisible]);

  // ############################################################################# 좋아요 목록 렌더링
  const LikeListRender = ({ item, index }) => {
    const storyType = item?.story_type;
    const expNickname = storyType == 'SECRET' ? item?.nickname_modifier + " " + item?.nickname_noun : item?.nickname; // 노출 닉네임

    let expMstImg = findSourcePath(item?.mst_img_path); // 노출 대표 이미지
    if(storyType == 'SECRET') {
      if(item?.gender == 'M') {
        expMstImg = ICON.storyMale;
      } else {
        expMstImg = ICON.storyFemale;
      }
    }

    return (
      <>
        <SpaceView mt={15} mb={5} viewStyle={_styles.likeListArea}>
          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>

            {/* 대표 이미지 */}
            <SpaceView viewStyle={_styles.circleImg}>
              <TouchableOpacity
                disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq}
                onPress={() => { profileOpen(item?.member_seq, item?.open_cnt); }}
              >
                <Image source={expMstImg} style={[_styles.imageStyle(45)]}/>
              </TouchableOpacity>
            </SpaceView>

            <SpaceView ml={3}>
              <SpaceView viewStyle={{flexDirection: 'row'}}>

                {memberBase?.member_seq != 905 && (
                  <>
                    {/* 프로필 평점 */}
                    {storyType != 'SECRET' && (
                      <>
                        <SpaceView mr={1} pl={5} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                          {(isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) &&
                            <SpaceView viewStyle={_styles.yellowBox, {marginRight: 5}}>
                              <Text style={_styles.profileText}>LV{item?.auth_acct_cnt}</Text>
                            </SpaceView>
                          }
                          {item?.best_face && 
                            <SpaceView viewStyle={[_styles.yellowBox]}>
                              <Text style={_styles.profileText}>{item?.best_face}</Text>
                            </SpaceView>
                          }
                        </SpaceView>
                      </>
                    )}
                  </>
                )}
              </SpaceView>

              {/* 닉네임 */}
              <SpaceView ml={2}>
                <Text style={_styles.nicknameText}>{expNickname}</Text>
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </SpaceView>
      </>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true} // 배경을 불투명하게 설정
      //onRequestClose={closeModal}
      onRequestClose={() => { closeModal(); }}
      //onBackdropPress={closeModal} 
    >
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>

        {/* 배경 영역 */}
        <Pressable style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} onPress={()=> { closeModal(); }} />

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={_styles.container}
			  >

          <SafeAreaView>
            <View style={_styles.titleBox}>
              <Text style={_styles.titleText}>좋아요 목록</Text>
            </View>

            {/* 댓글인 경우 표시 */}
            {type == 'REPLY' && (
              <SpaceView viewStyle={_styles.replyArea} mt={15}>
                <SpaceView viewStyle={_styles.circleImg}>
                  <TouchableOpacity
                    disabled={memberBase?.gender === replyInfo?.gender || memberBase?.member_seq === replyInfo?.reg_seq}
                    onPress={() => { profileOpen(replyInfo?.reg_seq, replyInfo?.open_cnt); }} >

                    {(replyInfo.story_type == 'SECRET' || selectedData?.isSecret) ? (
                      <Image source={replyInfo.gender == 'M' ? ICON.storyMale : ICON.storyFemale} style={[_styles.imageStyle(45)]} resizeMode={'cover'} />
                    ) : (
                      <Image source={findSourcePath(replyInfo.mst_img_path)} style={[_styles.imageStyle(45)]} resizeMode={'cover'} />
                    )}
                  </TouchableOpacity>
                </SpaceView>
                <SpaceView ml={5} pt={3} viewStyle={{flexDirection: 'column', flex: 1}}>
                  <Text style={[_styles.mainNicknameText]}>                  
                    {(replyInfo.story_type == 'SECRET' || selectedData?.isSecret) ? (
                      <>{replyInfo.story_type == 'SECRET' ? replyInfo.nickname_modifier + ' ' + replyInfo.nickname_noun : '비밀글'}</>
                    ) : replyInfo.nickname}
                    <Text style={_styles.timeText}> {replyInfo.time_text}</Text>
                  </Text>
                  <Text style={[_styles.replyText, {marginTop: 3}]}>
                    {selectedData?.isSecret ? '게시글 작성자에게만 보이는 글입니다.' : replyInfo.reply_contents}</Text>
                </SpaceView>
              </SpaceView>
            )}

            <SpaceView>
              <SpaceView viewStyle={_styles.likeCntArea}>
                <Text style={_styles.likeListText}>{likeListCnt}개의 좋아요</Text>
              </SpaceView>

              <SpaceView viewStyle={_styles.line} />  
              
              <FlatList
                style={{minHeight: 50, maxHeight: 500, marginBottom: 80}}
                data={likeListData.likeList}
                renderItem={({ item, index }) => {
                  return (
                    <View>
                      <LikeListRender 
                        item={item}
                        index={index} 
                      />
                    </View>
                  )
                }}
              />
            </SpaceView>
          </SafeAreaView>  
                        
          <SpaceView viewStyle={{position: 'absolute', bottom: 5, width: '100%'}}>
            <LinearGradient 
              colors={['rgba(255, 255, 255, 0.5)','rgba(59, 62, 61, 0.1)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={_styles.shadowArea} 
            />

            <SpaceView pl={18} pr={18} mb={10} viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyEnd]}>
              <TouchableOpacity style={_styles.closeBtn} onPress={() => closeModal()} hitSlop={commonStyle.hipSlop25}>
                <Text style={_styles.closeBtnText}>확인</Text>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const _styles = StyleSheet.create({
  container: {
    width: width - 40,
    borderRadius: 20,
  },
  titleBox: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
  },
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    textAlign: 'left',
    color: '#FFDD00',
  },
  contentBody: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 50,
  },
  likeListArea: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  likeCntArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  line: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  likeListText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    marginTop: 5,
    letterSpacing: 0,
    fontWeight: '300',
    textAlign: 'left',
    color: '#D5CD9E',
  },
  yellowBox: {
    backgroundColor: '#FFDD00',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderTopRightRadius: 8,
    marginTop: 5,
  },
  profileText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#FFF',
  },
  mainNicknameText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    color: '#D5CD9E',
  },
  nicknameText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    marginTop: 5,
    color: '#D5CD9E',
  },
  replyArea: {
    flexDirection: 'row',
    paddingHorizontal: 18,
  },
  timeText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#999',
  },
  replyText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    letterSpacing: 0,
    fontWeight: '300',
    textAlign: 'left',
    color: '#333',
  },
  imageStyle: (size:number) => {
    return {
      width: size,
      height: size,
      borderRadius: 50,
      overflow: 'hidden',
    };
  },
  iconSize: {
    width: 20,
    height: 20,
  },
  levelBadge: {
    width: 51,
    height: 21,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  openBtn: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#FF4381',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  circleImg: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFDD00',
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    overflow: 'hidden',
  },
  shadowArea: {
    width: '100%',
    height: 30,
    opacity: 0.2,
    marginBottom: 15,
  },
  closeBtn: {
    backgroundColor: '#FFDD00',
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  closeBtnText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#3D4348',
  },
});

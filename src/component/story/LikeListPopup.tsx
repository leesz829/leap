//import Modal from 'react-native-modal';
import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Pressable } from 'react-native';
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
import Modal from 'react-native-modal';
import { Modalize } from 'react-native-modalize';
import MemberMark from 'component/common/MemberMark';




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

//const LikeListPopup({ _ref, closeModal, type, _storyBoardSeq, selectedData, replyInfo, profileOpenFn }: Props) {
const LikeListPopup = forwardRef((props, ref) => {
  const modalizeRef = useRef(null);

  const { profileOpenFn } = props;

  // 부모 컴포넌트 handle
  useImperativeHandle(ref, () => ({
    openModal: (type:any, seq:any) => {
      console.log('type :::::: ' , type);
      getStoryLikeList(type, seq);
      //modalizeRef.current?.open();
      popup_onOpen();
    },
    closeModal: () => {
      //modalizeRef.current?.close();
      popup_onClose();
    },
  }));

  const { show } = usePopup();
	const [isLoading, setIsLoading] = useState(false);

  const memberBase = useUserInfo(); // 본인 데이터

  // 팝업 활성화
  const popup_onOpen = () => {
    modalizeRef.current?.open();
  }

  // 팝업 닫기
  const popup_onClose = () => {
    console.log('close!!');
    modalizeRef.current?.close();
  };

  // 좋아요 목록
  const [likeList, setLikeList] = React.useState([]);

  // 좋아요 목록 조회
	const getStoryLikeList = async (_type:any, _seq:any) => {
		setIsLoading(true);

    // 스토리 게시물 좋아요 파람
    const boardBody = {
      story_board_seq: _seq,
      type: _type,
    };

    // 스토리 댓글 좋아요 파람
    const replyBody = {
      //story_reply_seq: replyInfo?.story_reply_seq,
      type: _type,
    };

		try {
			const { success, data } = await get_story_like_list(_type == 'BOARD' ? boardBody : replyBody);

			if (success) {
				if (data.result_code == '0000') {
          //setLikeListData({likeList: data.like_list});
          console.log('data.like_list :::: ', data.like_list.length);

          setLikeList(data.like_list);
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
    //closeModal();
    //profileOpenFn(memberSeq, openCnt, false);
  };

  React.useEffect(() => {

    //console.log('_ref ::::: ' , _ref);

    //getStoryLikeList();

    /* if(isVisible){
      console.log('visible!!!!!!!!!!!');
      getStoryLikeList();
      popup_onOpen();
    } */
	}, [modalizeRef]);

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
            <SpaceView viewStyle={{flex: 0.15}}>
              <TouchableOpacity
                style={_styles.circleImg}
                disabled={memberBase?.gender === item?.gender || memberBase?.member_seq === item?.member_seq}
                onPress={() => { profileOpen(item?.member_seq, item?.open_cnt); }}
              >
                <Image source={expMstImg} style={[_styles.imageStyle(45)]}/>
              </TouchableOpacity>
            </SpaceView>

            <SpaceView ml={10} viewStyle={{flex: 0.9}}>
              <SpaceView viewStyle={{flexDirection: 'row'}}>

                <MemberMark sizeType={'S'} /* respectGrade={item?.respect_grade} */ />

                {/* 프로필 평점 */}
                {/* {storyType != 'SECRET' && (
                  <>
                    <SpaceView mr={1} pl={5} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      {(isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) &&
                        <SpaceView mr={5} viewStyle={_styles.yellowBox}>
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
                )} */}

              </SpaceView>

              {/* 닉네임 */}
              <SpaceView mt={8} ml={2} viewStyle={{flexDirection: 'row', alignItems: 'flex-end'}}>
                <Text style={styles.fontStyle('B', 15, '#FFFFFF')}>{expNickname}</Text>

                {/* 비공개 썸네일 표시 아이콘 */}
                {/* <SpaceView ml={5} mb={2}>
                  <Image source={ICON.story_lock} style={styles.iconSquareSize(10)} />
                </SpaceView> */}

                {/* 잠금해제 */}
                {/* <SpaceView ml={5} viewStyle={_styles.lockOpen}>
                  <Text style={styles.fontStyle('R', 8, '#46F66F')}>잠금해제</Text>

                  <SpaceView viewStyle={{flexDirection: 'row'}}>
                    <Image source={ICON.cube} style={styles.iconSquareSize(10)} />
                    <SpaceView ml={2}><Text style={styles.fontStyle('R', 8, '#fff')}>5개</Text></SpaceView>
                  </SpaceView>
                </SpaceView> */}
              </SpaceView>
              
            </SpaceView>
          </SpaceView>
        </SpaceView>
      </>
    );
  };

  return (
    <>
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
          <Text style={styles.fontStyle('H', 26, '#fff')}>좋아요 {likeList?.length}개</Text>
        </SpaceView>

        <SpaceView mt={30}>
          <FlatList
            style={{height: height - 350, marginBottom: 50}}
            data={likeList}
            renderItem={({ item, index }) => {
              return (
                <SpaceView>
                  <LikeListRender item={item} index={index} />
                </SpaceView>
              )
            }}
          />
        </SpaceView>

        <SpaceView viewStyle={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <TouchableOpacity style={_styles.confirmBtn} onPress={() => { popup_onClose(); }}>
            <Text style={styles.fontStyle('B', 12, '#fff')}>확인</Text>
          </TouchableOpacity>
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
  modalWrap: {
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden', 
    backgroundColor: '#1B1633',
    paddingHorizontal: 20,
  },
  likeListArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },
  imageStyle: (size:number) => {
    return {
      width: size,
      height: size,
      borderRadius: 50,
      overflow: 'hidden',
    };
  },
  circleImg: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#F7EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    overflow: 'hidden',
  },
  confirmBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 12,
  },
  lockOpen: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },

});


export default LikeListPopup;
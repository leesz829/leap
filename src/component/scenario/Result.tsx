import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_live_members, regist_profile_evaluation, get_common_code, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import { CommonLoading } from 'component/CommonLoading';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, Platform, Modal, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { useProfileImg } from 'hooks/useProfileImg';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ROUTES, STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { Slider } from '@miblanchard/react-native-slider';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';


/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 참여하기 결과 Component
###################################################################################################################
################################################################################################################ */

interface Props {
  ccsTitle: string; // 시나리오 제목
  answerList: any; // 시나리오 목록
  nickname: string; // 닉네임
  mstImgPath: string; // 대표사진경로
  answerAgreeRate: any; // 답변 일치율
  resultCallbackFn: (codeList:any) => void; // 결과 콜백 함수
  profileOpenFn: (passUseYn:string) => void; // 프로필 열람 함수
}

const { width, height } = Dimensions.get('window');

const Result: FC<Props> = React.memo((props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const { show } = usePopup(); // 공통 팝업

  const memberBase = useUserInfo(); // 본인 데이터

  const mbrProfileImgList = useProfileImg();

  const [isLoading, setIsLoading] = useState(false); // 로딩 여부


  // ################################################################ 초기 실행 함수
  React.useEffect(() => {
    if(isFocus) {

    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView mt={40} viewStyle={_styles.contentWrap}>
        <SpaceView viewStyle={_styles.titleWrap}>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>결과 확인</Text>
        </SpaceView>
        <SpaceView pl={13} pr={13}>
          <SpaceView pt={50} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start'}}>
            <SpaceView viewStyle={_styles.imgWrap}>
              <Image source={findSourcePath(props.mstImgPath)} style={_styles.imgStyle} />

              {props.answerAgreeRate < 80 && (
                <BlurView 
                  style={_styles.blurArea}
                  blurType='light'
                  blurAmount={10}
                />
              )}
            </SpaceView>

            <SpaceView ml={10} mt={13}>
              <SpaceView><Text style={styles.fontStyle('H', 30, '#fff')}>{props.nickname}</Text></SpaceView>
            </SpaceView>
          </SpaceView>

          <SpaceView mt={30} pl={40} pr={40}>
            <SpaceView viewStyle={_styles.resultWrap}>
              <SpaceView><Text style={styles.fontStyle('SB', 9, '#fff')}>답변 일치율</Text></SpaceView>
              <SpaceView mt={5}><Text style={styles.fontStyle('H', 24, '#fff')}>{props.answerAgreeRate.toFixed(1)}%</Text></SpaceView>
              <SpaceView mt={10}>
                <Text style={[styles.fontStyle('SB', 8, '#FFFF5D'), {textAlign: 'center'}]}>긍정 반응</Text>
                <SpaceView mt={4} viewStyle={layoutStyle.rowCenter}>
                  {props.answerList.map((item, index) => {
                    return isEmptyData(item.ccs_member_seq) && (
                      <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                    )
                  })}
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </SpaceView>

          <SpaceView mt={20}>
            {props.answerAgreeRate < 80 ? (
              <>
                <SpaceView mt={20}>
                  <SpaceView>
                    <Text style={[styles.fontStyle('SB', 14, '#fff'), {textAlign: 'center'}]}>
                      친구가 누군지 궁금하다면 일치율은 중요하지 않아요.{'\n'}
                      프로필 열람하고 먼저 다가가 보시는건 어떠세요?
                    </Text>
                  </SpaceView>
                </SpaceView>

                <SpaceView mt={20} mb={40} viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity 
                    style={_styles.detailBtnArea('#44B6E5')}
                    onPress={() => {
                      props.profileOpenFn('Y');
                    }} 
                  >
                    <Image source={ICON.lockIcon} style={styles.iconSquareSize(15)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('B', 13, '#fff')}>잠금해제</Text></SpaceView>

                    <SpaceView viewStyle={_styles.freeTextWrap}>
                      <Image source={ICON.cube} style={styles.iconSquareSize(12)} />
                      <SpaceView ml={4}><Text style={styles.fontStyle('R', 8, '#fff')}>15개</Text></SpaceView>
                    </SpaceView>
                  </TouchableOpacity>
                </SpaceView>
              </>
            ) : (
              <>
                <SpaceView mt={20}>
                  <SpaceView>
                    <Text style={[styles.fontStyle('SB', 14, '#fff'), {textAlign: 'center'}]}>
                      내 성향과 비슷한 사람 발견!{'\n'}
                      {props.nickname}님의 프로필 카드를 열람할 수 있습니다.
                    </Text>
                  </SpaceView>
                </SpaceView>

                <SpaceView mt={20} mb={40} viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity 
                    style={_styles.detailBtnArea('#46F66F')}
                    onPress={() => {
                      props.profileOpenFn('N');
                    }} 
                  >
                    <Image source={ICON.searchWhite} style={styles.iconSquareSize(15)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('B', 13, '#fff')}>열람하기</Text></SpaceView>
                  </TouchableOpacity>
                </SpaceView>
              </>
            )}
          </SpaceView>

        </SpaceView>
      </SpaceView>

      <SpaceView mt={40} viewStyle={[layoutStyle.rowBetween, {alignItems: 'flex-start'}]}>
        <TouchableOpacity 
          style={_styles.cancelBtnWrap}
          onPress={() => {
            props.resultCallbackFn('01');
          }}>
          <Text style={styles.fontStyle('B', 14, '#fff')}>나가기</Text>
        </TouchableOpacity>

        <SpaceView viewStyle={{width: '57%'}}>
          <TouchableOpacity 
            style={_styles.btnWrap}
            onPress={() => {
              props.resultCallbackFn('02');
            }}
          >
            <Image source={ICON.scenario_play} style={styles.iconSquareSize(17)} />
            <SpaceView ml={5}><Text style={styles.fontStyle('B', 14, '#fff')}>다른 사람 찾기</Text></SpaceView>
          </TouchableOpacity>

          <SpaceView viewStyle={_styles.etcSearchCubeWrap}>
            <Image source={ICON.cube} style={styles.iconSquareSize(12)} />
            <SpaceView ml={4}><Text style={styles.fontStyle('R', 8, '#fff')}>10개</Text></SpaceView>
          </SpaceView>
        </SpaceView>
      </SpaceView>
    </>
  );
});



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
 contentWrap: {
    backgroundColor: 'rgba(52,52,52,0.5)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleWrap: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  imgWrap: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  imgStyle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  blurArea: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		width: '100%',
		height: '100%',
		zIndex: 1,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
  resultWrap: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailBtnArea: (bg:string) => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      borderRadius: 25,
      paddingHorizontal: 13,
      height: 35,
    };
  },
  freeTextWrap: {
    position: 'absolute',
    bottom: -13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnWrap: {
    backgroundColor: '#46F66F',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  etcSearchCubeWrap: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnWrap: {
    backgroundColor: '#FF516F',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    height: 52,
  },

});


export default Result;
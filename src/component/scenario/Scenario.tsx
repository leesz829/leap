import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_live_members, regist_profile_evaluation, get_common_code, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, Platform, Modal, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ROUTES, STACK } from 'constants/routes';


/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 참여하기 Component
###################################################################################################################
################################################################################################################ */

interface Props {
  label: string;
  value?: string;
  callBackFunction?: (value: string, check: boolean) => void;
}

const { width, height } = Dimensions.get('window');

export const Scenario: FC<Props> = (props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const { show } = usePopup(); // 공통 팝업

  const memberBase = useUserInfo(); // 본인 데이터
  
  const [isLoad, setIsLoad] = React.useState(false); // 로딩 여부
  const [isEmpty, setIsEmpty] = React.useState(false); // 빈 데이터 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  // ####################################################################################### 라이브 등록
  /* const insertLiveMatch = async (pick:string, code:string, profileScore:string) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);

      try {
        const body = {
          profile_score: pick == 'SKIP' ? profileScore : pickProfileScore,
          face_code: pick == 'SKIP' ? code : pickFaceCode,
          member_seq: liveMemberSeq,
          approval_profile_seq: approvalProfileSeq,
          newYn: 'Y',
        };
  
        const { success, data } = await regist_profile_evaluation(body);
  
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              dispatch(myProfile());
              setIsLoad(false);
              setIsEmpty(false); 
              setLiveModalVisible(false);
              getLiveMatchTrgt();
  
              break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.' , });
              break;
          }
        }else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
        }
      } catch (error) {
        console.log(error);
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      } finally {
        setIsPopVisible(false);
        setIsClickable(true);
      }
    };
  }; */

  // 참여하기 클릭 함수
  const onSelect = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'Scenario' });
  }

  // ################################################################ 초기 실행 함수
  React.useEffect(() => {
    if(isFocus) {

    };
  }, [isFocus]);

  useFocusEffect(
    React.useCallback(() => {
      
      return () => {

      };
    }, []),
  );

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}> 
        <ImageBackground
            source={ICON.scenario_bgImg}
            style={{height: height}}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <SpaceView mt={130}>
                <SpaceView viewStyle={layoutStyle.alignCenter}>
                  <Image source={ICON.scenario_datingImg} style={styles.iconSquareSize(170)} />
                  <SpaceView><Text style={styles.fontStyle('EB', 24, '#fff')}>커플 시나리오</Text></SpaceView>
                  <SpaceView mt={5}><Text style={[styles.fontStyle('B', 14, '#fff'), {textAlign: 'center'}]}>리프에서 준비한 이야기들에 참여하고{'\n'}나와 잘 맞는 성향의 친구를 찾아 보세요!</Text></SpaceView>
                </SpaceView>
                <SpaceView mt={40} viewStyle={_styles.descWrap}>
                  <SpaceView viewStyle={layoutStyle.rowStart}>
                    <Image source={ICON.scenario_descIcon1} style={styles.iconSquareSize(25)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('SB', 11, '#fff')}>성향 비교 대상은 무작위로 뽑히며, 게임이 종료되면{'\n'}상대의 썸네일을 열람할 수 있습니다.</Text></SpaceView>
                  </SpaceView>
                  <SpaceView mt={15} viewStyle={layoutStyle.rowStart}>
                    <Image source={ICON.scenario_descIcon2} style={styles.iconSquareSize(25)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('SB', 11, '#fff')}>게임 완료 횟수가 많아 질수록 리프의 AI추천도 {'\n'}더 정확해집니다.</Text></SpaceView>
                  </SpaceView>
                  <SpaceView mt={15} viewStyle={layoutStyle.rowStart}>
                    <Image source={ICON.scenario_descIcon3} style={styles.iconSquareSize(25)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('SB', 11, '#fff')}>다양한 시나리오에서 성향 파악을 현실적으로 할 수{'\n'}있습니다.</Text></SpaceView>
                  </SpaceView>
                </SpaceView>
                <SpaceView mt={70} viewStyle={layoutStyle.alignCenter}>
                  <TouchableOpacity 
                    style={_styles.btnWrap}
                    onPress={onSelect}
                  >
                    <Image source={ICON.scenario_play} style={styles.iconSquareSize(17)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('B', 14, '#fff')}>참여하기</Text></SpaceView>

                    <SpaceView mr={5} viewStyle={_styles.cubeWrap}>
                      <Image source={ICON.cube} style={styles.iconSquareSize(12)} />
                      <SpaceView ml={2}><Text style={styles.fontStyle('R', 9, '#fff')}>10개</Text></SpaceView>
                    </SpaceView>
                  </TouchableOpacity>
                </SpaceView>
              </SpaceView>
            </ScrollView>
        </ImageBackground>
      </SpaceView>
    </>
  );
}



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
  },
  descWrap: {
    paddingHorizontal: 60,
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  btnWrap: {
    backgroundColor: '#46F66F',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 230,
    paddingVertical: 20,
  },
  cubeWrap: {
    flexDirection: 'row', 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    borderRadius: 25, 
    paddingHorizontal: 5, 
    paddingVertical: 2,
    position: 'absolute',
    top: -10,
    right: 5,
  },

});
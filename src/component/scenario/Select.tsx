import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_random_scnr_tmplt_list } from 'api/models';
import SpaceView from 'component/SpaceView';
import { CommonLoading } from 'component/CommonLoading';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, Platform, Modal, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ROUTES, STACK } from 'constants/routes';
import { useProfileImg } from 'hooks/useProfileImg';
import LinearGradient from 'react-native-linear-gradient';
import { Slider } from '@miblanchard/react-native-slider';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';

/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 참여하기 선택 Component
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

const Select = React.memo(({ resultCallbackFn }) => {

  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [ccsTitle, setCcsTitle] = useState(''); // 시나리오 제목
  const [ccsTitleCd, setCcsTitleCd] = useState(''); // 시나리오 제목 코드
  const [ccsList, setCcsList] = useState([]); // 시나리오 목록

  const [matchMemberSeq, setMatchMemberSeq] = useState(''); // 매칭 멤버 일련번호
  const [matchMemberNickname, setMatchMemberNickname] = useState(''); // 매칭 멤버 닉네임
  const [matchMemberMstImgPath, setMatchMemberMstImgPath] = useState(''); // 매칭 멤버 대표 사진

  const [selectCode, setSelectCode] = useState('');
  const [selectCodeList, setSelectCodeList] = useState([]);

  const codeList = [
    {code: '01', name: '코인 노래방'},
    {code: '02', name: '이자카야'},
    {code: '03', name: '심야영화'}
  ]

  // 회원 기본 정보
  const memberBase = useUserInfo();

  const mbrProfileImgList = useProfileImg();

  const answerSelect = async (code:string) => {
    setSelectCode(code);
  };

  const move = async () => {
    resultCallbackFn();
  };

  const getTextForNumber = (num:number) => {
    switch(num) {
      case 1: return '첫번째';
      case 2: return '두번째';
      case 3: return '세번째';
      case 4: return '네번째';
      case 5: return '다섯번째';
      case 6: return '여섯번째';
      case 7: return '일곱번째';
      case 8: return '여덞번째';
      case 9: return '아홉번째';
      case 10: return '열번째';
      default: return '첫번째';
    }
  };

  // ####################################################################### 커플 시나리오 조회
  const getScenario = async () => {
    setIsLoading(true);
    setSelectCodeList([]);

    const body = {

    };
    try {
      const { success, data } = await get_random_scnr_tmplt_list(body);
      if (success) {
        if (data.result_code == '0000') {          
          const ccsData = data.result;
          console.log('list ::::::: ' , ccsData?.list);

          setCcsTitle(ccsData?.ccs_title);
          setCcsTitleCd(ccsData?.ccs_title_cd);
          setCcsList(ccsData?.list);

          setMatchMemberSeq(ccsData?.match_member_seq);
          setMatchMemberNickname(ccsData?.nickname);
          setMatchMemberMstImgPath(ccsData?.mst_img_path);

        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getScenario();
      setSelectCode('');
      
      return () => {
        
      };
    }, []),
  );

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView mt={40} viewStyle={_styles.contentWrap}>
        <SpaceView viewStyle={_styles.titleWrap}>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>{ccsTitle}</Text>
        </SpaceView>
        <SpaceView pl={13} pr={13}>
          <SpaceView pt={50} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start'}}>
            <SpaceView viewStyle={_styles.imgWrap}>
              <Image source={findSourcePath(matchMemberMstImgPath)} style={_styles.imgStyle} />
              <BlurView 
                style={_styles.blurArea}
                blurType='light'
                blurAmount={10}
              />
            </SpaceView>
            <SpaceView ml={10} mt={13}>
              <SpaceView><Text style={styles.fontStyle('H', 30, '#fff')}>{matchMemberNickname}</Text></SpaceView>
              <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={styles.fontStyle('SB', 9, '#8BAAFF')}>예상 친밀도</Text></SpaceView>
                <SpaceView ml={10} viewStyle={{overflow: 'hidden', width: 80}}>
                  <LinearGradient
                    colors={['#8BAAFF', '#8BAAFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={_styles.sliderActiveStyle(40 / 100)}>
                  </LinearGradient>
                  <Slider
                    animateTransitions={true}
                    renderThumbComponent={() => null}
                    containerStyle={_styles.sliderContainerStyle}
                    trackStyle={_styles.sliderThumbStyle}
                    trackClickable={false}
                    disabled
                  />
                </SpaceView>
                <SpaceView ml={5}>
                  <Text style={styles.fontStyle('R', 6, '#8BAAFF')}>40%</Text>
                </SpaceView>
              </SpaceView>
              <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={[styles.fontStyle('SB', 9, '#FFFF5D'), {textAlign: 'right'}]}>긍정 반응</Text></SpaceView>
                <SpaceView ml={18} viewStyle={layoutStyle.rowStart}>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </SpaceView>
          <SpaceView mt={30}>
            <SpaceView><Text style={styles.fontStyle('SB', 16, '#fff')}>{getTextForNumber(selectCodeList.length+1)} 상황</Text></SpaceView>
            <SpaceView mt={5}>
              <Text style={styles.fontStyle('SB', 14, '#fff')}>{ccsList.length > 0 && ccsList[selectCodeList.length+1]?.ccs_contents}</Text>
            </SpaceView>
          </SpaceView>
          <SpaceView mt={50} mb={20}>
            {ccsList.length > 0 && (
              <>
                {ccsList[selectCodeList.length]?.ans_list.map((item, index) => {
                  const ccsCd = item?.ccs_cd;
                  const ccsAnsCd = item?.ccs_ans_cd;

                  return (
                    <TouchableOpacity
                      style={_styles.answerItemWrap}
                      activeOpacity={0.7}
                      onPress={() => {
      
                        if(selectCode == ccsAnsCd) {
                          console.log('111111111111111111111111111111111 ::::: ', ccsCd);
                          //setSelectCodeList((prevItems) => [...prevItems, selectCode]);
                          setSelectCodeList((prevItems) => [...prevItems, {'ccs_cd': ccsCd, 'ccs_ans_cd': ccsAnsCd}]);
                          //move();

                          console.log('ccsList.length ::::: ' , ccsList.length);
                          console.log('selectCodeList.length ::::: ' , selectCodeList.length);

                          if(ccsList.length-1 == selectCodeList.length) {
                            move();
                          }

                        } else {
                          console.log('222222222222222222222222222222222 ::::: ', ccsAnsCd);
                          answerSelect(ccsAnsCd);
                        }
                        
                      }}
                    >
                      <Text style={styles.fontStyle('SB', 16, '#fff')}>{item.ccs_ans_contents}</Text>
                      {isEmptyData(selectCode) && selectCode == ccsAnsCd && ( <SpeechBubble />)}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
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
  answerItemWrap: {
    backgroundColor: 'rgba(162,223,255,0.5)',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  sliderActiveStyle: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 5,
      zIndex: 1,
      borderRadius: 25,
    };
  },
  sliderContainerStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
  },
  sliderThumbStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
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

});


export default Select;
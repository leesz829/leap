import { layoutStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Color } from 'assets/styles/Color';
import { useDispatch, useSelector } from 'react-redux';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ICON, findSourcePath } from 'utils/imageUtils';
import { STACK, ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { useUserInfo } from 'hooks/useUserInfo';
import SocialGrade from 'component/common/SocialGrade';



const { width, height } = Dimensions.get('window');

//export default function ListItem ({ item, fnDetail, fnProfileOpen, freeOpenCnt, respectGrade, isLastItem }) {
const ListItem = React.memo(({ item, fnDetail, fnProfileOpen, freeOpenCnt, respectGrade, isLastItem }) => {
  const imgList = item?.img_list; // 이미지 목록
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const memberBase = useUserInfo(); // 본인 데이터

  const _renderWidth = width - 20;
  const _renderHeight = height * 0.65;

  let maxFreeCnt = 0;

  if(memberBase?.respect_grade == 'SILVER') {
    maxFreeCnt = 1;
  } else if(memberBase?.respect_grade == 'GOLD') {
    maxFreeCnt = 2;
  } else if(memberBase?.respect_grade == 'PLATINUM') {
    maxFreeCnt = 3;
  } else if(memberBase?.respect_grade == 'DIAMOND') {
    maxFreeCnt = 4;
  }

  // 이전 이미지
  const prevImage = async () => {
    if(currentImgIdx > 0) {
      setCurrentImgIdx(currentImgIdx-1);
    }
  };

  // 다음 이미지
  const nextImage = async () => {
    if(currentImgIdx+1 < imgList.length && currentImgIdx < 2) {
      setCurrentImgIdx(currentImgIdx+1);
    }
  };

  // 상세 실행
  const detailProc = async () => {
    /* if(item?.open_yn == 'Y') {
      fnDetail(item?.member_seq);
    } else {
      setIsOpen(true);
    } */

    fnProfileOpen(item?.member_seq);
  };

  // 열람 실행
  const openProc = async() => {
    if(item?.open_yn == 'Y') {
      fnDetail(item?.member_seq);
    } else {
      fnProfileOpen(item?.member_seq);
    }
  };

  // 열람 취소
  const openCancel = async() => {
    setIsOpen(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsOpen(false);
      };
    }, []),
  );

  return (
    <>
      <SpaceView mb={isLastItem ? 130 : 30}>
        <SpaceView viewStyle={_styles.blindCardShadow}>

          <LinearGradient
            colors={['#46F66F', '#FFFF5D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{borderRadius: 10, overflow: 'hidden', paddingHorizontal: 2, paddingVertical: 2}}
          >
            {/* ########################################################################## 상단 정보 표시 */}
            <SpaceView viewStyle={_styles.topArea}>

              {/* 리스펙트 등급 표시 */}
              <SpaceView viewStyle={_styles.gradeArea}>
                <Image source={ICON.sparkler} style={styles.iconSquareSize(15)} />
                <Text style={_styles.gradeText}>{item?.respect_grade}</Text>
              </SpaceView>
              
              {/* 인상 수식어 표시 */}
              {isEmptyData(item?.face_modifier) && (
                <LinearGradient
                  colors={['#40E0D0', '#4C4CC2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={_styles.faceModifierArea}
                >
                  <Text style={_styles.faceModifierText}>#{item?.face_modifier}</Text>
                </LinearGradient>
              )}
            </SpaceView>

            {/* ########################################################################## 이미지 인디케이터 */}
            <SpaceView viewStyle={_styles.pagingContainer}>
              <Text style={styles.fontStyle('SB', 12, '#000')}>{currentImgIdx+1}/{imgList.length > 2 ? 3 : imgList.length}</Text>
            </SpaceView>

            {/* ########################################################################## 이미지 영역 */}
            {imgList.length > 0 && (
              <Image
                source={findSourcePath(imgList[currentImgIdx].img_file_path)}
                style={{ width: _renderWidth, height: _renderHeight, borderRadius: 10 }}
              />
            )}

            <SpaceView viewStyle={_styles.bottomArea}>

              {/* ########################################################################## 메인 정보 영역 */}
              <SpaceView ml={15} mr={15} mb={5}>

                {/* 한줄 소개 */}
                {currentImgIdx == 0 && (
                  <SpaceView><Text style={styles.fontStyle('B', 12, '#fff')}>{item.comment}</Text></SpaceView>
                )}

                {/* 관심사 목록 */}
                {currentImgIdx == 1 && (
                  <SpaceView viewStyle={_styles.interestArea}>
                    {item?.interest_list?.map((i, n) => {
                      return isEmptyData(i.code_name) && (
                        <>
                          <SpaceView key={'interest_' + i.common_code} mb={7} mr={5} viewStyle={_styles.interestItem(i.dup_chk > 0 ? '#FFFF5D' : '#fff')}>
                            <Text style={styles.fontStyle('SB', 10, '#44B6E5')}>#{i.code_name}</Text>
                          </SpaceView>
                        </>
                      )
                    })}
                  </SpaceView>
                )}

                {/* 인증 목록 */}
                {currentImgIdx == 2 && (
                  <SpaceView viewStyle={_styles.authArea}>
                    {item?.auth_list.length > 0 && (
                      <>
                        {item?.auth_list?.map((i, n) => {
                          const authCode = i.common_code;
                          let authIcon = ICON.authJob;

                          if(authCode == 'EDU') {
                            authIcon = ICON.authEdu;
                          } else if(authCode == 'INCOME') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'ASSET') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'SNS') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'VEHICLE') {
                            authIcon = ICON.authAsset;
                          }

                          return isEmptyData(i.auth_type_name) && (
                            <>
                              <LinearGradient
                                key={i.member_auth_seq}
                                colors={['rgba(64,224,208,0.6)', 'rgba(76,76,194,0.6)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={_styles.authItem}
                              >
                                <Image source={ICON.jobIcon} style={styles.iconSquareSize(22)} />
                                <Text style={styles.fontStyle('SB', 12, '#fff')}>{i.auth_type_name}</Text>
                              </LinearGradient>
                            </>
                          )
                        })}
                      </>
                    )}
                  </SpaceView>
                )}
              </SpaceView>

              {/* ########################################################################## 하단 정보 표시 */}
              <SpaceView viewStyle={_styles.baseInfoArea}>
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-end', width: '70%', flexWrap: 'wrap'}}>
                  <Text style={styles.fontStyle('H', 26, '#fff')}>{item.nickname}</Text>

                  {isEmptyData(item.distance) && item.distance > 0 && (
                    <>
                      <SpaceView ml={5} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={ICON.distanceIcon} style={styles.iconSquareSize(18)} />
                        <SpaceView ml={3}><Text style={styles.fontStyle('SB', 12, '#3AF246')}>{item.distance}Km</Text></SpaceView>
                      </SpaceView>
                    </>
                  )}
                </SpaceView>

                {item?.open_yn == 'Y' ? (
                  <>
                    <TouchableOpacity onPress={() => { fnDetail(item?.member_seq); }} style={_styles.detailBtnArea('#46F66F')}>
                      <Image source={ICON.searchWhite} style={styles.iconSquareSize(15)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 13, '#fff')}>열람하기</Text></SpaceView>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => { openProc(); }} style={_styles.detailBtnArea('#44B6E5')}>
                      <Image source={ICON.lockIcon} style={styles.iconSquareSize(15)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 13, '#fff')}>잠금해제</Text></SpaceView>

                      <SpaceView viewStyle={_styles.freeTextWrap}>
                        {freeOpenCnt == 0 ? (
                          <>
                            <Image source={ICON.cube} style={styles.iconSquareSize(12)} />
                            <SpaceView ml={4}><Text style={styles.fontStyle('R', 8, '#fff')}>30개</Text></SpaceView>
                          </>
                        ) : (
                          <>
                            <SpaceView pb={2} pt={2}>
                              <Text style={styles.fontStyle('R', 8, '#46F66F')}>FREE {maxFreeCnt-freeOpenCnt}/{maxFreeCnt}회</Text>
                            </SpaceView>
                          </>
                        )}
                      </SpaceView>
                    </TouchableOpacity>
                  </>
                )}
              </SpaceView>

            </SpaceView>

            {/* ############################ 이전 버튼 */}
            <TouchableOpacity 
              onPress={() => { prevImage(); }}
              style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: (width * 0.85) / 2}} />

            {/* ############################ 다음 버튼 */}
            <TouchableOpacity 
              onPress={() => { nextImage(); }}
              style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: (width * 0.85) / 2}} />

            {/* ############################### 하단 딤 처리 영역 */}
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.thumnailDimArea} />












            {/* ############################### 열람 블러 영역 */}
            {isOpen && (
              <>
                <BlurView 
                  style={_styles.blurArea(_renderWidth, _renderHeight)}
                  blurType='light'
                  blurAmount={15}
                />

                <SpaceView viewStyle={_styles.blurArea(_renderWidth, _renderHeight)}>
                  {freeOpenCnt > 0 ? (
                    <SpaceView>
                      <SpaceView viewStyle={_styles.blurDesc}>
                        <SpaceView mr={5}><SocialGrade grade={respectGrade} sizeType={'SMALL'} /></SpaceView>
                        <Text style={styles.fontStyle('M', 12, '#D5CD9E')}>무료 열람 활성화</Text>
                      </SpaceView>

                      <SpaceView mt={10} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={_styles.blurAddText('#FFDD00')}>{freeOpenCnt}회남음</Text>
                      </SpaceView>
                    </SpaceView>
                  ) : (
                    <SpaceView>
                      <SpaceView viewStyle={_styles.blurDesc}>
                        <Text style={styles.fontStyle('M', 12, '#D5CD9E')}>큐브를 사용하여 블라인드 카드를 열람합니다.</Text>
                      </SpaceView>

                      <SpaceView mt={10} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <SpaceView mr={3}><Image source={ICON.cubeYCyan} style={styles.iconSquareSize(30)} /></SpaceView>
                        <Text style={_styles.blurAddText('#32F9E4')}>15</Text>
                      </SpaceView>
                    </SpaceView>
                  )}

                  <SpaceView viewStyle={_styles.bluBtnArea}>
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={_styles.bluBtnGradient}>
                      
                      <TouchableOpacity style={_styles.bluBtnTouch(true)} onPress={() => { openCancel(); }}>
                        <Text style={_styles.bluBtnText('#E1DFD1')}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={_styles.bluBtnTouch(false)} onPress={() => { openProc(); }}>
                        <Text style={_styles.bluBtnText('#FFDD00')}>열람하기</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </SpaceView>

                  <SpaceView viewStyle={_styles.cubeInfoArea}>
                    <SpaceView mr={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <SpaceView mr={3}><Image source={ICON.cubeYCyan} style={styles.iconSquareSize(15)} /></SpaceView>
                      <Text style={styles.fontStyle('M', 12, '#32F9E4')}>{CommaFormat(memberBase?.pass_has_amt)}</Text>
                    </SpaceView>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <SpaceView mr={1}><Image source={ICON.megaCubeCyan} style={styles.iconSquareSize(20)} /></SpaceView>
                      <Text style={styles.fontStyle('M', 12, '#32F9E4')}>{CommaFormat(memberBase?.royal_pass_has_amt)}</Text>
                    </SpaceView>
                  </SpaceView>
                </SpaceView>
              </>
            )}

          </LinearGradient>
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
  wrap: {
    minHeight: height,
  },
  thumnailDimArea: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    opacity: 0.8,
    height: height * 0.24,
    borderRadius: 10,
  },
  blindCardShadow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,

    shadowColor: '#000000',   
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  pagingContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 6,
  },
  faceModifierArea: {
    borderRadius: 12, 
    overflow: 'hidden', 
    paddingHorizontal: 12, 
    paddingVertical: 3,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceModifierText: {
    fontFamily: 'SUITE-SemiBold',
    fontSize: 14,
    color: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  blurArea: (_width:number, _height:number) => {
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: _width,
      height: _height,
      zIndex: 2,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
  },
  blurDesc: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurAddText: (cr:string) => {
    return {
      fontFamily: 'SUITE-Medium',
      fontSize: 23,
      color: '#32F9E4',
    };
  },
  bluBtnArea: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  bluBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  bluBtnTouch: (isBorder:boolean) => {
    return {
      width: '50%',
      paddingVertical: 20,
      borderRightWidth: isBorder ? 1 : 0,
      borderRightColor: '#64614B',
    };
  },
  bluBtnText: (cr:string) => {
    return {
      fontFamily: 'SUITE-SemiBold',
      fontSize: 16,
      color: cr,
      textAlign: 'center',
    };
  },
  cubeInfoArea: {
    position: 'absolute',
    top: 10,
    right: 20,
    flexDirection: 'row',
    zIndex: 2,
  },
  topArea: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    zIndex: 1,
  },
  gradeArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gradeText:  {
    fontFamily: 'SUITE-SemiBold',
    fontSize: 13,
    color: '#000000',
    marginLeft: 2,
    marginBottom: 2,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  baseInfoArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 15,
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
  interestArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestItem: (bg:string) => {
    return {
      backgroundColor: bg,
      borderRadius: 5,
      paddingHorizontal: 12,
      paddingVertical: 4,
    };
  },
  authArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  authItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '46%',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 5,
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



});


export default ListItem;
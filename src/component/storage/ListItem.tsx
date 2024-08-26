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
import MemberMark from 'component/common/MemberMark';


const { width, height } = Dimensions.get('window');

export default function ListItem({ type, item, index, profileOpenFn }) {

  //const _type = item?.type; // 유형
  const _matchType = item?.match_type; // 매칭 유형
  const _matchStatus = item?.match_status; // 매칭 상태
  const _trgtMemberSeq = item?.trgt_member_seq; // 
  const _imgFilePath = findSourcePath(item?.img_file_path);
  const _comment = item?.comment;
  const _nickname = item?.nickname;
  const _age = item?.age;
  const _faceModifier = item?.face_modifier; // 인상 수식어
  const _socialGrade = item?.social_grade;
  const _profileOpenYn = item?.profile_open_yn;

  const _authList = item?.auth_list;
  const _imgList = item?.img_list;

  let isShow = true;  // 노출 여부
  let profileOpenYn = item?.profile_open_yn; // 프로필 열람 여부
  let isBlur = false;

  let bgColor = '#F1D30E';
  let matchStatusKor = '라이크';

  if(_matchStatus == 'REFUSE') {
    bgColor = '#333B41';
  } else {
    if((_matchStatus == 'PROGRESS' ||  _matchStatus == 'ACCEPT') && item?.special_interest_yn == 'Y') {
      bgColor = '#E95B36';
      matchStatusKor = '슈퍼 라이크';
    } else if(_matchStatus == 'LIVE_HIGH') {
      bgColor = '#D5CD9E';
      matchStatusKor = '플러팅';
    } else if(_matchStatus == 'ZZIM') {
      bgColor = '#32F9E4';
      matchStatusKor = '찜';
    };
  }

  // 대상 회원 번호, 프로필 열람 여부 설정
  /* if(_type == 'RES' || matchType == 'LIVE_RES') {
    profile_open_yn = item?.res_profile_open_yn;

    if(item?.res_profile_open_yn == 'N') {
      isBlur = true;
    };

  } else if(_type == 'REQ' || matchType == 'LIVE_REQ') {
    profile_open_yn = 'Y';

  } else if(type == 'MATCH' || type == 'ZZIM') {
    profile_open_yn = 'Y';
  }; */


  /* 상세 이동 함수 */
  const goDetailFn = () => {
    profileOpenFn(
      item?.match_seq,
      _trgtMemberSeq,
      'STORAGE',
      _profileOpenYn,
      item?.member_status,
      _matchType,
      item?.special_interest_yn,
      item?.message,
      item?.nickname,
      _imgFilePath,
    );
  };

  return (
    <>
      {isShow && 
        <SpaceView>
          {/* ############################################################################# 찐심 UI 구분 */}
          {/* {item?.special_interest_yn == 'Y' ? ( */}
          {type == 'SPECIAL' ? (
            <>
              <TouchableOpacity
                style={{marginBottom: 20}}
                activeOpacity={0.7}
                onPress={goDetailFn}
              >
                <SpaceView>
                  <SpaceView>
                    {/* <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                      <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                        <Image source={ICON.sparkler} style={styles.iconSquareSize(16)} />
                        <Text style={_styles.listHeaderText}>{_socialGrade}</Text>
                      </SpaceView>

                      <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                        <Text style={_styles.listHeaderDdayText}>
                          {item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}
                          {_matchStatus == 'REFUSE' && '(매칭거절)'}
                        </Text>
                      </SpaceView>
                    </SpaceView> */}

                    <SpaceView viewStyle={_styles.listBody}>
                      <SpaceView>
                        <SpaceView viewStyle={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', overflow: 'hidden'}}>
                          <Image source={findSourcePath(_imgList[0]?.img_file_path)} style={{width: '33%', height: 170}} />
                          <Image source={findSourcePath(_imgList[1]?.img_file_path)} style={{width: '33%', height: 170}} />
                          <Image source={findSourcePath(_imgList[2]?.img_file_path)} style={{width: '33%', height: 170}} />
                        </SpaceView>

                        <SpaceView viewStyle={{position: 'absolute', top: 0, right: 0}}>
                          <SpaceView mt={5} mr={10} viewStyle={_styles.specialDayArea}>
                            <Text style={styles.fontStyle('B', 14, '#fff')}>
                              {item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}
                              {_matchStatus == 'REFUSE' && '(매칭거절)'}
                            </Text>
                          </SpaceView>
                        </SpaceView>

                        {/* <LinearGradient
                          colors={['rgba(31, 36, 39, 0.9)', 'rgba(36, 36, 36, 0.1)']}
                          start={{ x: 1, y: 0 }}
                          end={{ x: 0, y: 0 }}
                          style={{position: 'absolute', top: 0, right: 0, paddingRight: 5}}
                        >
                          {isEmptyData(_faceModifier) && (
                            <SpaceView viewStyle={[_styles.faceArea, {marginLeft: 'auto'}]}>
                              <Text style={[_styles.faceText, {textAlign: 'center'}]}>#{_faceModifier}</Text>
                            </SpaceView>
                          )}
                          <SpaceView mt={5} ml={10}>
                            <Text style={styles.fontStyle('B', 14, '#fff')}>{item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}</Text>
                          </SpaceView>
                        </LinearGradient> */}
                      </SpaceView>
                    </SpaceView>

                    <LinearGradient
                      colors={['rgba(119, 119, 119, 0.4)', 'rgba(104, 103, 103, 0.2)']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={_styles.specialBottomWrap}
                    >
                      <SpaceView mb={10} viewStyle={{flexDirection: 'row'}}>
                        <SpaceView viewStyle={_styles.gradeArea}>
                          <Image source={ICON.sparkler} style={styles.iconSquareSize(12)} />
                          <Text style={styles.fontStyle('SB', 9, '#000000')}>{item?.respect_grade}</Text>
                        </SpaceView>
                      </SpaceView>

                      <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.fontStyle('H', 25, '#C4B6AA')}>{_nickname}</Text>

                        <TouchableOpacity 
                          onPress={goDetailFn}
                          style={_styles.detailBtn}>
                          <Image source={ICON.searchWhite} style={[styles.iconSquareSize(13), {marginTop: 2}]} />
                          <SpaceView ml={3}><Text style={styles.fontStyle('B', 12, '#fff')}>열람하기</Text></SpaceView>
                        </TouchableOpacity>
                      </SpaceView>
                    </LinearGradient>

                  </SpaceView>
                </SpaceView>
              </TouchableOpacity>

              {/* <ScrollView
                style={{position: 'absolute', top: 150, right: 10, overflow: 'hidden', height: 100}}
                showsHorizontalScrollIndicator={false}
              >
                <SpaceView>
                  {_authList.map((i, n) => {
                    const isLast = _authList.length == (n+1) ? true : false;
                    return (
                      <SpaceView key={_trgtMemberSeq + n} mb={5} viewStyle={_styles.authArea}>
                        <Image source={ICON.authEdu} style={styles.iconSize16} />
                        <Text style={_styles.authText}>{i.slogan_name}</Text>
                      </SpaceView>
                    )
                  })}
                </SpaceView>
              </ScrollView> */}

              <ScrollView
                style={{position: 'absolute', bottom: -40, left: 10, right: 10, overflow: 'hidden', height: 100}}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
              >
                <SpaceView viewStyle={{flexDirection: 'row'}}>
                  {_authList.map((i, n) => {
                    const isLast = _authList.length == (n+1) ? true : false;

                    const authCode = i?.common_code;
                    let authIcon = ICON.authJob;

                    if(authCode == 'EDU') {
                      authIcon = ICON.authEdu;
                    } else if(authCode == 'INCOME') {
                      authIcon = ICON.authIncome;
                    } else if(authCode == 'ASSET') {
                      authIcon = ICON.authAsset;
                    } else if(authCode == 'SNS') {
                      authIcon = ICON.authSns;
                    } else if(authCode == 'VEHICLE') {
                      authIcon = ICON.authVehicle;
                    }

                    return i.auth_type_name && ( 
                      <SpaceView key={_trgtMemberSeq + n} mr={isLast ? 10 : 5} viewStyle={_styles.authArea}>
                        <Image source={authIcon} style={styles.iconSquareSize(18)} />
                        <Text style={_styles.authText}>{i.auth_type_name}</Text>
                      </SpaceView>
                    )
                  })}
                </SpaceView>
              </ScrollView>
            </>
          ) : (
            <>
              <SpaceView mb={20}>
                <SpaceView viewStyle={_styles.listArea}>
                  
                  {/* <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                    <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                      <Image source={ICON.sparkler} style={styles.iconSquareSize(16)} />
                      <Text style={_styles.listHeaderText}>{_socialGrade}</Text>

                      {isEmptyData(item?.live_face) && (
                        <SpaceView ml={15}>
                          <Text style={_styles.listHeaderLiveFaceText}><Text style={{fontFamily: 'Pretendard-Bold'}}>|</Text>  "{item?.live_face}"</Text>
                        </SpaceView>
                      )}
                    </SpaceView>
                    <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                      <Text style={_styles.listHeaderDdayText}>
                        {item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}
                        {_matchStatus == 'REFUSE' && '(매칭거절)'}
                      </Text>
                    </SpaceView>
                  </SpaceView> */}

                  <SpaceView viewStyle={_styles.listBody}>

                    {/* 대표 이미지 */}
                    <TouchableOpacity onPress={goDetailFn}>
                      <Image source={_imgFilePath} style={_styles.mstImg} />

                      {/* 열람 여부 표시 */}
                      {/* {profileOpenYn == 'N' && (
                        <SpaceView viewStyle={_styles.openYnMark}>
                          <Image source={ICON.yBlue} style={styles.iconSquareSize(18)} />
                        </SpaceView>
                      )} */}
                    </TouchableOpacity>

                    <LinearGradient
                      colors={['rgba(104, 103, 103, 0.3)', 'rgba(119, 119, 119, 0.8)', 'rgba(190, 190, 190, 0.6)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 8, y: 6 }}
                      style={{flex :1, flexWrap: 'nowrap', paddingVertical: 7, paddingHorizontal: 10, justifyContent: 'space-between'}}
                    >

                      {/* 유형, 남은 기간 노출 */}
                      <SpaceView viewStyle={{flexDirection: 'row'}}>
                        <SpaceView viewStyle={_styles.cateType()}>
                          <Text style={styles.fontStyle('B', 14, '#fff')}>관심</Text>
                        </SpaceView>
                        <SpaceView ml={5} viewStyle={_styles.dayArea}>
                          <Text style={styles.fontStyle('B', 14, '#fff')}>{item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}</Text>
                        </SpaceView>
                      </SpaceView>

                      {/* 회원 마크 */}
                      <SpaceView viewStyle={_styles.etcInfoWrap}>

                        <MemberMark 
                          sizeType={'S'} 
                          respectGrade={item?.respect_grade} 
                          bestFaceName={item?.best_face_name}
                          highAuthYn={item?.high_auth_yn}
                          variousAuthYn={item?.various_auth_yn} />
                      </SpaceView>

                      {/* 인상, 인증 정보 노출 */}
                      {/* {(isEmptyData(_faceModifier) || _authList.length > 0) && (
                        <ScrollView
                          style={{marginLeft: 10, marginTop: 5,}}
                          showsHorizontalScrollIndicator={false}
                          horizontal={true}
                        >
                          <SpaceView viewStyle={[layoutStyle.row]}>

                            {isEmptyData(_faceModifier) && (
                              <SpaceView mr={5} viewStyle={_styles.faceArea}><Text style={_styles.faceText}>#{_faceModifier}</Text></SpaceView>
                            )}

                            {_authList.map((i, n) => {
                              const isLast = _authList.length == (n+1) ? true : false;

                              const authCode = i?.common_code;
                              let authIcon = ICON.authJob;

                              if(authCode == 'EDU') {
                                authIcon = ICON.authEdu;
                              } else if(authCode == 'INCOME') {
                                authIcon = ICON.authIncome;
                              } else if(authCode == 'ASSET') {
                                authIcon = ICON.authAsset;
                              } else if(authCode == 'SNS') {
                                authIcon = ICON.authSns;
                              } else if(authCode == 'VEHICLE') {
                                authIcon = ICON.authVehicle;
                              }

                              return i.auth_type_name && (
                                <SpaceView key={_trgtMemberSeq + n} mr={isLast ? 90 : 5} viewStyle={_styles.authArea}>
                                  <Image source={authIcon} style={styles.iconSquareSize(18)} />
                                  <Text style={_styles.authText}>{i.auth_type_name}</Text>
                                </SpaceView>
                              )
                            })}
                          </SpaceView>
                        </ScrollView>
                      )} */}

                      {/* 닉네임, 나이, 소개 정보 */}
                      <SpaceView mb={5} viewStyle={_styles.bottomArea}>
                        <SpaceView><Text style={styles.fontStyle('H', 25, '#C4B6AA')}>{_nickname}</Text></SpaceView>

                        <TouchableOpacity 
                          onPress={goDetailFn}
                          style={_styles.detailBtn}>
                          <Image source={ICON.searchWhite} style={[styles.iconSquareSize(13), {marginTop: 2}]} />
                          <SpaceView ml={3}><Text style={styles.fontStyle('B', 12, '#fff')}>열람하기</Text></SpaceView>
                        </TouchableOpacity>
                      </SpaceView>
                    </LinearGradient>

                  </SpaceView>
                </SpaceView>
              </SpaceView>
            </>
          )}
        </SpaceView>
      }
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
    padding: 10,
  },
  tabArea: {
    flexDirection: 'row',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingVertical: 5,
    //width: '60%',
  },
  tabText: (isOn: boolean) => {
		return {
			fontFamily: 'SUITE-ExtraBold',
      fontSize: 16,
			color: isOn ? '#46F66F' : '#A6B8CF',
      backgroundColor: isOn ? '#fff' : 'transparent',
      borderRadius: 25,
      paddingHorizontal: 13,
      paddingVertical: 6,
		};
	},
  listArea: {
    backgroundColor: '#1A1E1C',
    borderRadius: 5,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1D30E',
    paddingHorizontal: 5,
  },
  listHeaderText: {
    fontFamily: 'SUITE-Bold',
    color: '#000000',
  },
  listHeaderDdayText: {
    fontFamily: 'Pretendard-Bold',
    color: '#000000',
  },
  listHeaderLiveFaceText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    color: '#000000',
  },
  listBody: {
    flexDirection: 'row',
  },
  mstImg: {
    width: (width - 20) / 4,
    height: (width) / 3,
    backgroundColor: '#FFDD00',
    overflow: 'hidden',
  },
  faceArea: {
    backgroundColor: '#FFF8CC',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
  },
  faceText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#4A4846',
  },
  authArea: {
    backgroundColor: 'rgba(112, 112, 112, 0.6)',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 25,
  },
  authText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#FFF',
    marginLeft: 5,
  },
  memberInfo: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#FFDD00',
  },
  comment: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
  },
  noData: {
    paddingHorizontal: 20,
    height: height - 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#445561',
  },
  openPopupMessageArea: {
    width: '100%',
    backgroundColor: '#445561',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  openPopupMessageTit: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
    marginBottom: 10,
  },
  openPopupMessageText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
  },
  openPopupDescArea: {
    alignItems: 'center',
  },
  openPopupDescText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
  },
  openPopupDescIcon: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    color: '#32F9E4',
    marginLeft: 3,
  },
  openYnMark: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cateType: (isOn: boolean) => {
		return {
      backgroundColor: isOn ? '#46F66F' : '#46F66F',
      paddingHorizontal: 13,
      paddingVertical: 4,
		};
	},
  dayArea: {
    backgroundColor: '#6C648A',
    paddingHorizontal: 13,
    paddingVertical: 4,
  },
  etcInfoWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradeArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS == 'ios' ? 8 : 15,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginVertical: 2,
    marginRight: 5,
  },
  detailBtn: {
    flexDirection: 'row',
    backgroundColor: '#46F66F',
    borderRadius: 25,
    width: 90,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialBottomWrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  specialDayArea: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 25,
    justifyContent: 'center'
  },

});
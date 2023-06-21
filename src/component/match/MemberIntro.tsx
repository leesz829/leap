import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { STACK } from 'constants/routes';
import { modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';




const { width, height } = Dimensions.get('window');

export default function MemberIntro({ memberData, imgList, interestList, isNoDataArea }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  return (
    <>
      {((isEmptyData(memberData?.height) || isEmptyData(memberData?.form_body) || isEmptyData(memberData?.job_name) || isEmptyData(memberData?.religion) ||
        isEmptyData(memberData?.drinking) || isEmptyData(memberData?.smoking) || interestList.length > 0) || isNoDataArea) ? (

        <SpaceView mt={10}>
          <Text style={_styles.title}>{memberData?.nickname}님 소개</Text>

          <SpaceView mt={90} viewStyle={_styles.introWrap}>
            <SpaceView viewStyle={{alignItems: 'center'}}>
              <SpaceView viewStyle={_styles.profileImageWrap}>
                {imgList != null && typeof imgList != 'undefined' && imgList.length > 0 &&
                  <Image source={findSourcePath(imgList[0]?.img_file_path)} style={_styles.profileImg} />
                }
              </SpaceView>
            </SpaceView>

            <SpaceView mt={10} viewStyle={{alignItems: 'center'}}>
              <SpaceView>
                <Text style={_styles.commentText}>"{memberData?.comment}"</Text>
              </SpaceView>

              <SpaceView mt={10} viewStyle={{flexDirection: 'row'}}>
                {/* ####################################################################################################
                ##################################### 인증 레벨 노출 영역
                #################################################################################################### */}
                {memberData?.auth_acct_cnt > 0 && memberData?.auth_acct_cnt < 10 &&
                  <LinearGradient colors={['#7986EE', '#7986EE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Text style={_styles.whiteText}>LV.{memberData.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {memberData?.auth_acct_cnt >= 10 && memberData?.auth_acct_cnt < 15 &&
                  <LinearGradient colors={['#E0A9A9', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Image source={ICON.level10Icon} style={[_styles.authBadgeImg, {width: 23, height: 23}]} />
                    <Text style={_styles.whiteText}>LV.{memberData?.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {memberData?.auth_acct_cnt >= 15 && memberData?.auth_acct_cnt < 20 &&
                  <LinearGradient colors={['#A9BBE0', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Image source={ICON.level15Icon} style={[_styles.authBadgeImg, {width: 23, height: 23}]} />
                    <Text style={_styles.whiteText}>LV.{memberData?.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {memberData?.auth_acct_cnt >= 20 && memberData?.auth_acct_cnt < 25 &&
                  <LinearGradient colors={['#FEB961', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Image source={ICON.level20Icon} style={[_styles.authBadgeImg02, {width: 30, height: 30}]} />
                    <Text style={_styles.whiteText}>LV.{memberData?.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {memberData?.auth_acct_cnt >= 25 && memberData?.auth_acct_cnt < 30 &&
                  <LinearGradient colors={['#9BFFB5', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Image source={ICON.level25Icon} style={[_styles.authBadgeImg02, {width: 30, height: 30}]} />
                    <Text style={_styles.whiteText}>LV.{memberData?.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {memberData?.auth_acct_cnt >= 30 &&
                  <LinearGradient colors={['#E84CEE', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                    <Image source={ICON.level30Icon} style={[_styles.authBadgeImg02, {width: 30, height: 30}]} />
                    <Text style={_styles.whiteText}>LV.{memberData?.auth_acct_cnt}</Text>
                  </LinearGradient>
                }

                {/* ####################################################################################################
                ##################################### 프로필 평점 노출 영역
                #################################################################################################### */}
                {memberData?.profile_score < 6.0 &&
                  <LinearGradient colors={['#FF7EA6', '#FF7EA6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.score5Icon} style={[{width: 12, height: 12}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }

                {memberData?.profile_score >= 6.0 && memberData?.profile_score < 7.0 &&
                  <LinearGradient colors={['#FF4381', '#FF4381']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.score6Icon} style={[{width: 16, height: 16}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }

                {memberData?.profile_score >= 7.0 && memberData?.profile_score < 8.0 &&
                  <LinearGradient colors={['#FF4381', '#FF4381']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.scoreKingIcon} style={[{width: 16, height: 16}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }

                {memberData?.profile_score >= 8.0 && memberData?.profile_score < 9.0 &&
                  <LinearGradient colors={['#FE0456', '#FF82AB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.scoreKingIcon} style={[{width: 16, height: 16}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }

                {memberData?.profile_score >= 9.0 && memberData?.profile_score < 10.0 &&
                  <LinearGradient colors={['#FE0456', '#9E6DF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.scoreKingIcon} style={[{width: 16, height: 16}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }

                {memberData?.profile_score >= 10.0 &&
                  <LinearGradient colors={['#FE0456', '#9E41E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                    <Image source={ICON.scoreDiamondIcon} style={[{width: 16, height: 16}]} />
                    <Text style={_styles.yellowText}>{memberData?.profile_score}</Text>
                  </LinearGradient>
                }
              </SpaceView>

              {/* ############################################################################################### 추가 정보 영역 */}
              {(isEmptyData(memberData?.height) || isEmptyData(memberData?.form_body) || isEmptyData(memberData?.job_name) || isEmptyData(memberData?.religion) ||
                isEmptyData(memberData?.drinking) || isEmptyData(memberData?.smoking)) ? (

                  <SpaceView mt={20}>
                    <Text style={_styles.addText}>
    
                      {(isEmptyData(memberData?.height) || isEmptyData(memberData?.form_body) || isEmptyData(memberData?.job_name)) && (
                        <>
                          저는{' '}
                          {isEmptyData(memberData?.height) && (
                            <>
                              <Text style={_styles.addActiveText}>{memberData?.height}cm</Text>
                              {(isEmptyData(memberData?.form_body) || isEmptyData(memberData?.job_name)) ? (
                                <>이고,{' '}</>
                              ) : (
                                <>{' '}입니다.</>
                              )}
                            </>
                          )}
                          {isEmptyData(memberData?.form_body) && (
                            <>
                              {memberData?.gender == 'M' ? (
                                <>
                                  {(memberData?.form_body == 'NORMAL' || memberData?.form_body == 'SKINNY') && (
                                    <>
                                      <Text style={_styles.addActiveText}>{memberData?.form_body == 'NORMAL' ? '보통 체형' : memberData?.form_body_type}</Text>
                                      {memberData?.job_name != null ? '의' : ' 입니다.'}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'FIT' && (
                                    <>
                                      {memberData?.job_name != null ? (
                                        <>
                                          <Text style={_styles.addActiveText}>헬스를 즐기는</Text>
                                        </>
                                      ) : (
                                        <>
                                          평소에 <Text style={_styles.addActiveText}>헬스를 즐기는</Text> 편이에요.
                                        </>
                                      )} 
                                    </> 
                                  )}
                                  {memberData?.form_body == 'GIANT' && (
                                    <>
                                      {memberData?.job_name != null ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>건장한 피지컬</Text>의
                                        </>
                                      ) : ( 
                                        <>
                                          <Text style={_styles.addActiveText}>건장한 피지컬</Text>의 소유자 입니다.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'SLIM' && (
                                    <>
                                      {memberData?.job_name != null ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>운동을 즐기는</Text>
                                        </>
                                      ) : ( 
                                        <>
                                          <Text style={_styles.addActiveText}>운동으로 단련된 몸</Text>을 갖고 있어요.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'CHUBBY' && (
                                    <>
                                      {memberData?.job_name != null ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>통통한</Text> 체형의
                                        </>
                                      ) : ( 
                                        <>
                                          <Text style={_styles.addActiveText}>통통한</Text> 체형 입니다.
                                        </>
                                      )}
                                    </> 
                                  )}
                                </>
                              ) : (
                                <>
                                  {(memberData?.form_body == 'NORMAL' || memberData?.form_body == 'SEXY' || memberData?.form_body == 'CHUBBY') && (
                                    <>
                                      {isEmptyData(memberData?.job_name) ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>{memberData?.form_body_type}</Text> 체형의
                                        </>
                                      ) : (
                                        <>
                                          <Text style={_styles.addActiveText}>{memberData?.form_body_type}</Text> 체형 입니다.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'SKINNY' && (
                                    <>
                                      {isEmptyData(memberData?.job_name) ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>날씬한</Text> 체형의
                                        </>
                                      ) : (
                                        <>
                                          매끄럽고 <Text style={_styles.addActiveText}>날씬한</Text> 체형 이에요.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'GLAMOUR' && (
                                    <>
                                      {isEmptyData(memberData?.job_name) ? ( 
                                        <Text style={_styles.addActiveText}>글래머러스한</Text>
                                      ) : (
                                        <>
                                          <Text style={_styles.addActiveText}>글래머러스{' '}</Text>합니다.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'COMPACT' && (
                                    <>
                                      {isEmptyData(memberData?.job_name) ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>아담한 </Text>체형의
                                        </>
                                      ) : (
                                        <>
                                          <Text style={_styles.addActiveText}>아담하고 귀여운{' '}</Text>편이에요.
                                        </>
                                      )}
                                    </> 
                                  )}
                                  {memberData?.form_body == 'MODEL' && (
                                    <>
                                      {isEmptyData(memberData?.job_name) ? ( 
                                        <>
                                          <Text style={_styles.addActiveText}>비율이 좋은</Text>
                                        </>
                                      ) : (
                                        <>
                                          <Text style={_styles.addActiveText}>비율이 좋은{' '}</Text>편입니다.
                                        </>
                                      )}
                                    </> 
                                  )}
                                </>
                              )}
                            </>
                          )}
                          {' '}
                          {isEmptyData(memberData?.job_name) && (
                            <>
                              <Text style={_styles.addActiveText}>{memberData?.job_name}</Text> 입니다.{' '}
                            </>
                          )}
                        </>
                      )}
    
                      {(isEmptyData(memberData?.religion) || isEmptyData(memberData?.drinking)) && (
                        <>
                          {isEmptyData(memberData?.religion) && (
                            <>
                              종교는{' '}
                              
                              {memberData?.religion == 'NONE' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      <Text style={_styles.addActiveText}>무신론자</Text>이며{' '}
                                    </>
                                  ) : (
                                    <>
                                      <Text style={_styles.addActiveText}>무신론자{' '}</Text>입니다.
                                    </>
                                  )}
                                </> 
                              }
                              {memberData?.religion == 'THEIST' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      <Text style={_styles.addActiveText}>무교이지만 신앙은 존중</Text>하며{' '}
                                    </>
                                  ) : (
                                    <>
                                      <Text style={_styles.addActiveText}>무교이지만 신앙은 존중{' '}</Text>입니다.
                                    </>
                                  )}
                                </> 
                              }
                              {memberData?.religion == 'JEJUS' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>기독교</Text>이고{' '}
                                    </>
                                  ) : (
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>기독교{' '}</Text>입니다.
                                    </>
                                  )}
                                </>
                              }
                              {memberData?.religion == 'BUDDHA' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>불교</Text>이고{' '}
                                    </>
                                  ) : (
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>불교{' '}</Text>입니다.
                                    </>
                                  )}
                                </>
                              }
                              {memberData?.religion == 'ALLAH' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>이슬람교</Text>이고{' '}
                                    </>
                                  ) : (
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>이슬람교{' '}</Text>입니다.
                                    </>
                                  )}
                                </>
                              }
                              {memberData?.religion == 'MARIA' &&
                                <>
                                  {isEmptyData(memberData?.drinking) ? ( 
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>천주교</Text>이고{' '}
                                    </>
                                  ) : (
                                    <>
                                      신앙이 있으며{' '}<Text style={_styles.addActiveText}>천주교{' '}</Text>입니다.
                                    </>
                                  )}
                                </>
                              }
                            </>
                          )}
    
                          {isEmptyData(memberData?.drinking) && (
                            <>
                              {memberData?.drinking == 'NONE' &&
                                <>
                                  술은 <Text style={_styles.addActiveText}>멀리하며</Text> 마시지 않습니다.
                                </>
                              }
                              {memberData?.drinking == 'LIGHT' &&
                                <>
                                  술은 <Text style={_styles.addActiveText}>가볍게 즐기는</Text> 편이에요.
                                </>
                              }
                              {memberData?.drinking == 'HARD' &&
                                <>
                                  술은 <Text style={_styles.addActiveText}>자주 즐기는</Text> 편이에요.
                                </>
                              }
                            </>
                          )}
                          {' '}
                        </>
                      )}
    
                      {isEmptyData(memberData?.smoking) && (
                        <>
                          {memberData?.smoking == 'NONE' &&
                            <>
                              그리고 <Text style={_styles.addActiveText}>비흡연가</Text>이니 참고해 주세요.
                            </>
                          }
                          {memberData?.smoking == 'LIGHT' &&
                            <>
                              <Text style={_styles.addActiveText}>흡연은 가끔</Text> 하는 편이니 참고해 주세요.
                            </>
                          }
                          {memberData?.smoking == 'HARD' &&
                            <>
                            <Text style={_styles.addActiveText}>애연가</Text>이니 참고해 주세요.
                          </>
                          }
                        </>
                      )}
    
                    </Text>
                  </SpaceView>

              ) : (
                <>
                  {isNoDataArea &&
                    <SpaceView mt={15} viewStyle={_styles.authEmptyArea}>
                      <SpaceView mb={13}>
                        <Text style={_styles.authEmptyTit}>
                          등록된 소개 정보가 없어요.{'\n'}
                          나를 궁금해 할 이성을 위해 소개 정보를 입력해 주세요.
                        </Text>
                      </SpaceView>
                      <SpaceView mt={5} viewStyle={{paddingHorizontal: 20}}>
                        <TouchableOpacity 
                          onPress={() => { navigation.navigate(STACK.COMMON, { screen: 'Introduce' }); }}
                          hitSlop={commonStyle.hipSlop15}>
                          
                          <Text style={_styles.authEmptyBtn}>소개 정보 등록하기</Text>
                        </TouchableOpacity>
                      </SpaceView>
                    </SpaceView>
                  }
                </>
              )}
            </SpaceView>

            {/* ############################################################################################### 관심사 영역 */}
            {interestList.length > 0 &&
              <SpaceView mt={20} mb={15} viewStyle={_styles.interestWrap}>
                <Text style={_styles.interestTitle}>관심사를 공유해요 : )</Text>
                <SpaceView viewStyle={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 13, marginBottom: 10 }}>
                  {interestList.map((item, index) => {
                    const isOn = item.dup_chk == 0 ? false : true;
                    return (
                      <View key={index} style={_styles.interestItem(isOn)}>
                        <Text style={_styles.interestText(isOn)}>{item.code_name}</Text>
                      </View>
                    );
                  })}
                </SpaceView>
              </SpaceView>
            }

          </SpaceView>
        </SpaceView>

      ) : (
        <>

        </>
      )}
    </>
  );

}


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({

  title: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 19,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#333333',
    marginTop: 20,
  },
  profileImageWrap: {
    width: 140,
    height: 140,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#FFDA82',
    borderRadius: 80,
    alignItems: `center`,
    justifyContent: `center`,
    marginTop: -70,
  },
  profileImg: {
    width: 128,
    height: 128,
    borderRadius: 80,
  },
  authBadge: {
    width: 48,
    height: 21,
    borderRadius: 5,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginRight: 5,
  },
  authBadgeImg: {
    marginLeft: -5,
    marginRight: -2,
    marginTop: -2
  },
  authBadgeImg02: {
    marginLeft: -9,
    marginRight: -4,
    marginTop: -3
  },
  whiteText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 10,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  yellowText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 11,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#FDFFD8',
  },
  scoreBadge: {
    width: 48,
    height: 21,
    borderRadius: 5,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `space-between`,
    marginRight: 5,
    paddingHorizontal: 5,
  },
  introWrap: {
    backgroundColor: '#FFFCEE',
    borderRadius: 20,
    paddingHorizontal: 25,
  },
  commentText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  addText: {
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 20,
  },
  addActiveText: {
    color: '#7986EE',
  },
  interestTitle: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 15,
    color: '#333333',
    textAlign: 'left',
  },
  interestWrap: {
    
  },
  interestItem: (isOn) => {
    return {
      borderRadius: 5,
      backgroundColor: '#ffffff',
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 6,
      marginBottom: 6,
      borderColor: isOn ? '#697AE6' : '#A6A9C5',
      borderWidth: 1,
    };
  },
  interestText: (isOn) => {
    return {
      fontFamily: 'AppleSDGothicNeoR00',
      fontSize: 12,
      color: isOn ? '#697AE6' : '#A6A9C5',
    };
  },
  authEmptyArea: {
    width: '100%',
    backgroundColor: '#ffffff', 
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1, 
    borderRadius: 10, 
    borderColor: '#8E9AEB', 
    borderStyle: 'dotted',
  },
  authEmptyTit: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 11,
    color: '#7986EE',
    textAlign: 'center',
  },
  authEmptyBtn: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 12,
    color: '#ffffff',
    backgroundColor: '#697AE6',
    borderRadius: 7,
    textAlign: 'center',
    paddingVertical: 8,
  }

});
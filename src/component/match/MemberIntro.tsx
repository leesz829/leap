import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { STACK, ROUTES } from 'constants/routes';
import { modalStyle, layoutStyle, commonStyle, styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { useUserInfo } from 'hooks/useUserInfo';


const { width, height } = Dimensions.get('window');

export default function MemberIntro({ addData, faceModifier, nickname, gender, isEditBtn, isNoDataArea }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  const memberBase = useUserInfo();

  return (
    <>
      {((isEmptyData(addData?.height) || isEmptyData(addData?.form_body) || isEmptyData(addData?.job_name) || isEmptyData(addData?.religion) ||
        isEmptyData(addData?.drinking) || isEmptyData(addData?.smoking)) || isNoDataArea) ? (

        <SpaceView>

          {/* <SpaceView mb={10} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <SpaceView>
              <Text style={_styles.introTitleText}>{nickname}님의 간단 소개🙂</Text>
            </SpaceView>

            {(isEmptyData(isEditBtn) && isEditBtn) && (
              <TouchableOpacity 
                onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_ADDINFO }); }} 
                style={_styles.modBtn}>
                <Image source={ICON.squarePen} style={styles.iconSize16} />
                <Text style={_styles.modBtnText}>수정</Text>
              </TouchableOpacity>
            )}
          </SpaceView> */}

          {/* ############################################################################################### 간단 소개 영역 */}
          
          {(isEmptyData(faceModifier) || isEmptyData(addData?.mbti_type_name) || isEmptyData(addData?.prefer_local1_name) || isEmptyData(addData?.prefer_local2_name)) &&
            <SpaceView mb={40}>
              {/* <SpaceView mb={5} viewStyle={{flexDirection: 'row'}}>
                {isEmptyData(faceModifier) && (
                  <SpaceView viewStyle={_styles.faceArea}><Text style={_styles.faceText}>#{faceModifier}</Text></SpaceView>
                )}
                {isEmptyData(addData?.mbti_type_name) && (
                  <SpaceView viewStyle={_styles.faceArea}><Text style={_styles.faceText}>{addData?.mbti_type_name}</Text></SpaceView>
                )}
                {isEmptyData(addData?.prefer_local1_name) && (
                  <SpaceView viewStyle={_styles.faceArea}><Text style={_styles.faceText}>{addData?.prefer_local1_name}</Text></SpaceView>
                )}
                {isEmptyData(addData?.prefer_local2_name) && (
                  <SpaceView viewStyle={_styles.faceArea}><Text style={_styles.faceText}>{addData?.prefer_local2_name}</Text></SpaceView>
                )}
              </SpaceView>

              {isEmptyData(faceModifier) && (
                <SpaceView mt={2}>
                  <Text style={_styles.faceDesc}>LIVE에서 HOT한 반응을 받으셨어요!</Text>
                </SpaceView>
              )} */}
            </SpaceView>
          }

          <SpaceView>
            {(isEmptyData(addData?.height) || isEmptyData(addData?.form_body) || isEmptyData(addData?.job_name) || isEmptyData(addData?.religion) ||
              isEmptyData(addData?.drinking) || isEmptyData(addData?.smoking)) ? (

                <SpaceView ml={20} mr={20}>
                  <Text style={[styles.fontStyle('EB', 22, '#fff'), {textAlign: 'center'}]}>
                    "
                    {(isEmptyData(addData?.height) || isEmptyData(addData?.form_body) || isEmptyData(addData?.job_name)) && (
                      <>
                        저는{' '}
                        {isEmptyData(addData?.height) && (
                          <>
                            <Text style={_styles.addActiveText}>{addData?.height}cm</Text>
                            {(isEmptyData(addData?.form_body) || isEmptyData(addData?.job_name)) ? (
                              <>이고, </>
                            ) : (
                              <> 입니다.{'\n'}</>
                            )}
                          </>
                        )}
                        {isEmptyData(addData?.form_body) && (
                          <>
                            {gender == 'M' ? (
                              <>
                                {(addData?.form_body == 'NORMAL' || addData?.form_body == 'SKINNY') && (
                                  <>
                                    <Text style={_styles.addActiveText}>{addData?.form_body == 'NORMAL' ? '보통 체형' : addData?.form_body_type}</Text>
                                    {isEmptyData(addData?.job_name) ? (
                                      <>의 </>
                                    ) : (
                                      <>입니다.{'\n'}</>
                                    )}
                                  </>
                                )}
                                {addData?.form_body == 'FIT' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? (
                                      <>
                                        <Text style={_styles.addActiveText}>헬스를 즐기는</Text>{' '}
                                      </>
                                    ) : (
                                      <>
                                        평소에 <Text style={_styles.addActiveText}>헬스를 즐기는</Text> 편이에요.{'\n'}
                                      </>
                                    )} 
                                  </> 
                                )}
                                {addData?.form_body == 'GIANT' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>건장한 피지컬</Text>의{' '}
                                      </>
                                    ) : ( 
                                      <>
                                        <Text style={_styles.addActiveText}>건장한 피지컬</Text>의 소유자 입니다.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'SLIM' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>운동을 즐기는</Text>{' '}
                                      </>
                                    ) : ( 
                                      <>
                                        <Text style={_styles.addActiveText}>운동으로 단련된 몸</Text>을 갖고 있어요.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'CHUBBY' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>통통한</Text> 체형의{' '}
                                      </>
                                    ) : ( 
                                      <>
                                        <Text style={_styles.addActiveText}>통통한</Text> 체형 입니다.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                              </>
                            ) : (
                              <>
                                {(addData?.form_body == 'NORMAL' || addData?.form_body == 'SEXY' || addData?.form_body == 'CHUBBY') && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>{addData?.form_body_name}</Text> 체형의{' '}
                                      </>
                                    ) : (
                                      <>
                                        <Text style={_styles.addActiveText}>{addData?.form_body_name}</Text> 체형 입니다.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'SKINNY' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>날씬한</Text> 체형의{' '}
                                      </>
                                    ) : (
                                      <>
                                        매끄럽고 <Text style={_styles.addActiveText}>날씬한</Text> 체형 이에요.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'GLAMOUR' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <Text style={_styles.addActiveText}>글래머러스한{' '}</Text>
                                    ) : (
                                      <>
                                        <Text style={_styles.addActiveText}>글래머러스{' '}</Text>합니다.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'COMPACT' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>아담한 </Text>체형의{' '}
                                      </>
                                    ) : (
                                      <>
                                        <Text style={_styles.addActiveText}>아담하고 귀여운{' '}</Text>편이에요.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                                {addData?.form_body == 'MODEL' && (
                                  <>
                                    {isEmptyData(addData?.job_name) ? ( 
                                      <>
                                        <Text style={_styles.addActiveText}>비율이 좋은</Text>{' '}
                                      </>
                                    ) : (
                                      <>
                                        <Text style={_styles.addActiveText}>비율이 좋은{' '}</Text>편입니다.{'\n'}
                                      </>
                                    )}
                                  </> 
                                )}
                              </>
                            )}
                          </>
                        )}

                        {isEmptyData(addData?.job_name) && (
                          <>
                            <Text style={_styles.addActiveText}>{addData?.job_name}</Text> 입니다.{'\n'}
                          </>
                        )}
                      </>
                    )}
  
                    {(isEmptyData(addData?.religion) || isEmptyData(addData?.drinking)) && (
                      <>
                        {isEmptyData(addData?.religion) && (
                          <>
                            종교는{' '}
                            
                            {addData?.religion == 'NONE' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    <Text style={_styles.addActiveText}>무신론자</Text>이며{' '}
                                  </>
                                ) : (
                                  <>
                                    <Text style={_styles.addActiveText}>무신론자{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </> 
                            }
                            {addData?.religion == 'THEIST' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    <Text style={_styles.addActiveText}>무교이지만 신앙은 존중</Text>하며{' '}
                                  </>
                                ) : (
                                  <>
                                    <Text style={_styles.addActiveText}>무교이지만 신앙은 존중{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </> 
                            }
                            {addData?.religion == 'JEJUS' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>기독교</Text>이고{' '}
                                  </>
                                ) : (
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>기독교{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </>
                            }
                            {addData?.religion == 'BUDDHA' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>불교</Text>이고{' '}
                                  </>
                                ) : (
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>불교{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </>
                            }
                            {addData?.religion == 'ALLAH' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>이슬람교</Text>이고{' '}
                                  </>
                                ) : (
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>이슬람교{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </>
                            }
                            {addData?.religion == 'MARIA' &&
                              <>
                                {isEmptyData(addData?.drinking) ? ( 
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>천주교</Text>이고{' '}
                                  </>
                                ) : (
                                  <>
                                    신앙이 있으며{' '}<Text style={_styles.addActiveText}>천주교{' '}</Text>입니다.{'\n'}
                                  </>
                                )}
                              </>
                            }
                          </>
                        )}
  
                        {isEmptyData(addData?.drinking) && (
                          <>
                            {addData?.drinking == 'NONE' &&
                              <>
                                술은 <Text style={_styles.addActiveText}>멀리하며</Text> 마시지 않습니다.{'\n'}
                              </>
                            }
                            {addData?.drinking == 'LIGHT' &&
                              <>
                                술은 <Text style={_styles.addActiveText}>가볍게 즐기는</Text> 편이에요.{'\n'}
                              </>
                            }
                            {addData?.drinking == 'HARD' &&
                              <>
                                술은 <Text style={_styles.addActiveText}>자주 즐기는</Text> 편이에요.{'\n'}
                              </>
                            }
                          </>
                        )}
                      </>
                    )}
  
                    {isEmptyData(addData?.smoking) && (
                      <>
                        {addData?.smoking == 'NONE' &&
                          <>
                            그리고 <Text style={_styles.addActiveText}>비흡연가</Text>이니 참고해 주세요.
                          </>
                        }
                        {addData?.smoking == 'LIGHT' &&
                          <>
                            <Text style={_styles.addActiveText}>흡연은 가끔</Text> 하는 편이니 참고해 주세요.
                          </>
                        }
                        {addData?.smoking == 'HARD' &&
                          <>
                          <Text style={_styles.addActiveText}>애연가</Text>이니 참고해 주세요.
                        </>
                        }
                      </>
                    )}
                    "
                  </Text>
                </SpaceView>

            ) : (
              <>
                {isNoDataArea &&
                  <SpaceView mt={15} viewStyle={_styles.authEmptyArea}>
                    <SpaceView mb={13}>
                      <Text style={styles.fontStyle('B', 11, '#7986EE')}>
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

  addActiveText: {
    color: '#C4B6AA',
    textAlign: 'left',
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
  authEmptyBtn: {
    backgroundColor: '#697AE6',
    borderRadius: 7,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
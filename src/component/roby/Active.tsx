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
import { ScrollView } from 'react-native-gesture-handler';
import RecommendBanner from 'component/common/RecommendBanner';



const { width, height } = Dimensions.get('window');

const Active = React.memo(({ memberBase, authList, realTimeData, fnRewardPass }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const [currentRespectType, setCurrentRespectType] = React.useState(memberBase?.respect_grade); // repsect 등급 타입

  const respectGradeList = [
    {type: 'MEMBER', freeCnt: 0, cubeCnt: 0, megaCubeCnt: 0},
    {type: 'SILVER', freeCnt: 1, cubeCnt: 10, megaCubeCnt: 0},
    {type: 'GOLD', freeCnt: 2, cubeCnt: 20, megaCubeCnt: 2},
    {type: 'PLATINUM', freeCnt: 3, cubeCnt: 30, megaCubeCnt: 3},
    {type: 'DIAMOND', freeCnt: 4, cubeCnt: 50, megaCubeCnt: 5},
  ];

  // 인상수식어 memberBase?.face_modifier
  // memberPeekData
  // resLikeList
  // matchTrgtList

  return (
    <>
      <LinearGradient
        colors={['#706fc6', '#16112A']}
        style={{ paddingHorizontal: 10, paddingTop: 20}}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }} >

        {/* ################################################################################ 리프로운 매너 생활 영역 */}
        <LinearGradient
          colors={['#411968', '#3B5FD4']}
          style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 }}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }} >

          <SpaceView>
            <SpaceView mb={10}><Text style={styles.fontStyle('EB', 18, '#fff')}>리프로운 매너 생활</Text></SpaceView>
            <Text style={styles.fontStyle('SB', 11, '#fff')}>서로를 배려하며 리프를 즐기면 자연스럽게 리스펙트 등급 UP! 보상도 UP!</Text>
          </SpaceView>

          <SpaceView mt={20} viewStyle={_styles.respectTabWrap}>
            {respectGradeList.map((item, index) => (
              <TouchableOpacity onPress={() => (setCurrentRespectType(item.type))} style={_styles.respectTabItem((memberBase?.respect_grade == 'UNKNOWN' && item.type == 'MEMBER') || (memberBase?.respect_grade == item.type))}>
                <Text style={[_styles.respectText(currentRespectType == item.type)]}>{item.type}</Text>

                {((memberBase?.respect_grade == 'UNKNOWN' && item.type == 'MEMBER') || (memberBase?.respect_grade == item.type)) && (
                  <SpaceView viewStyle={_styles.respectTabCurrentWrap}>
                    <SpaceView viewStyle={_styles.respectTabCurrentMark}><Text style={styles.fontStyle('R', 8, '#8BAAFF')}>현재 등급</Text></SpaceView>
                  </SpaceView>
                )}
              </TouchableOpacity>
            ))}
          </SpaceView>

          <SpaceView mt={20} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            {['FREE', 'CUBE', 'MEGACUBE'].map((item, index) => {
              let respectItem = respectGradeList.filter((item, index) => item.type == currentRespectType);
              let freeCnt = respectItem[0]?.freeCnt;
              let cubeCnt = respectItem[0]?.cubeCnt;
              let megaCubeCnt = respectItem[0]?.megaCubeCnt;

              let isBtnDisabled = false;

              if(item == 'FREE' || (item == 'CUBE' && realTimeData.reward_pass_cnt > 0) || (item == 'MEGACUBE' && realTimeData.reward_royal_pass_cnt > 0)) {
                isBtnDisabled = true;
              }

              return (
                <LinearGradient
                  colors={['rgba(77,190,182,0.8)', 'rgba(28,41,97,0.5)', 'rgba(41,45,54,0.8)']}
                  style={[_styles.respectItemWrap, {marginHorizontal: index == 1 ? 10 : 0}]}
                  start={{ x: 0.7, y: 0.7 }}
                  end={{ x: 0, y: 0 }} >

                  <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>
                    {item == 'FREE' && ( <>블라인드 카드{'\n'}매일 {freeCnt}회 무료 열람</> )}
                    {item == 'CUBE' && ( <>매주 월요일{'\n'}큐브 {cubeCnt}개 지급</> )}
                    {item == 'MEGACUBE' && ( <>매주 월요일{'\n'}메가 큐브 {megaCubeCnt}개 지급</> )}
                  </Text>

                  <SpaceView mt={10} mb={20}>
                    {item == 'FREE' && ( <Image source={ICON.respectFree} style={styles.iconSquareSize(60)} /> )}
                    {item == 'CUBE' && ( <Image source={ICON.respectCube} style={styles.iconSquareSize(60)} /> )}
                    {item == 'MEGACUBE' && ( <Image source={ICON.respectMegaCube} style={styles.iconSquareSize(60)} /> )}
                  </SpaceView>

                  <TouchableOpacity
                    disabled={isBtnDisabled}
                    style={_styles.respectBtnWrap(item, isBtnDisabled)}
                    onPress={() => {
                      fnRewardPass(item == 'CUBE' ? 'PASS' : 'ROYAL_PASS');
                    }}>

                    {item == 'FREE' && <Text style={styles.fontStyle('B', 12, '#fff')}>적용중</Text>}
                    {item != 'FREE' && <Text style={styles.fontStyle('B', 12, isBtnDisabled ? '#606060' : '#000')}>받기</Text>}
                  </TouchableOpacity>
                </LinearGradient>
              )
            })}
          </SpaceView>

          <SpaceView mt={30}>
            <SpaceView mb={5}><Text style={styles.fontStyle('EB', 15, '#fff')}>리스펙트 등급이 뭔가요?</Text></SpaceView>
            <Text style={styles.fontStyle('SB', 11, '#fff')}>리스펙트 등급은 유령 회원, 허위 프로필, 보이스 피싱을 포함하여 악성 회원과 클린
            회원을 구분해주는 리프의 클린 매칭 시스템입니다.</Text>
          </SpaceView>

          <SpaceView mt={20} viewStyle={{alignItems: 'flex-end'}}>
            <TouchableOpacity style={_styles.respectBtn}>
              <Text style={styles.fontStyle('B', 11, '#fff')}>등급 관리하기</Text>
              <Text style={styles.fontStyle('B', 11, '#fff')}>{'>'}</Text>
            </TouchableOpacity>
          </SpaceView>
        </LinearGradient>

        {/* ################################################################################ 멤버십 레벨 영역 */}
        <LinearGradient
          colors={['rgba(65,25,104,0.3)', 'rgba(59,95,212,0.4)']}
          style={{ paddingHorizontal: 10, paddingVertical: 20, marginTop: 20, borderRadius: 10 }}
          start={{ x: 0.4, y: 0.4 }}
          end={{ x: 0.7, y: 0.7 }} >

          <SpaceView>
            <Text style={styles.fontStyle('EB', 19, '#fff')}>멤버십 레벨</Text>
          </SpaceView>

          <SpaceView mt={28}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <Image source={ICON.awardLeft} style={_styles.awardImgStyle} />
              <Text style={styles.fontStyle('H', 25, '#7AB0C8')}>{memberBase?.auth_acct_cnt}</Text>
              <Image source={ICON.awardRight} style={_styles.awardImgStyle} />
            </SpaceView>
            <SpaceView mt={12} viewStyle={{alignItems: 'center'}}>
              <Text style={[styles.fontStyle('EB', 15, '#fff'), {textAlign: 'center'}]}>
                {realTimeData?.auth_percent <= 20 && (
                  <>
                    멤버십 인증을 통해 <Text style={styles.fontStyle('EB', 15, '#7AB0C8')}>상위 {realTimeData?.auth_percent}%</Text>의{'\n'}
                    인증 레벨을 획득한 
                    <Text style={styles.fontStyle('EB', 15, '#7AB0C8')}>
                      {realTimeData?.auth_percent == 1 && <> 킹 오브 리프 </>}
                      {(realTimeData?.auth_percent >= 2 && realTimeData?.auth_percent <= 5) && <> VIP </>}
                      {(realTimeData?.auth_percent >= 6 && realTimeData?.auth_percent <= 10) && <> 프리미엄 </>}
                      {(realTimeData?.auth_percent >= 11 && realTimeData?.auth_percent <= 15) && <> 최상위 </>}
                      {(realTimeData?.auth_percent >= 16 && realTimeData?.auth_percent <= 20) && <> 상위 </>}
                    </Text> 
                    회원
                  </>
                )}

                {realTimeData?.auth_percent >= 21 && (
                  <>
                    {(realTimeData?.auth_percent >= 21 && realTimeData?.auth_percent <= 30) && <> 리프에서 월등한 멤버십 </>}
                    {(realTimeData?.auth_percent >= 31 && realTimeData?.auth_percent <= 50) && <> 리프에서 우월한 멤버십 인증 회원 </>}
                    {(realTimeData?.auth_percent >= 51 && realTimeData?.auth_percent <= 70) && <> 리프에서 경쟁력 있는 멤버십 인증 회원 </>}
                    {(realTimeData?.auth_percent >= 71 && realTimeData?.auth_percent <= 100) && <> 믿을 수 있는 멤버십 인증 회원 </>}
                    인증 회원
                  </>
                )}
              </Text>
            </SpaceView>

            {/* 인증 목록 영역 */}
            <SpaceView mt={15} viewStyle={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
              {authList.map((item, index) => {
                let icon = ICON.jobIcon;

                if(item.common_code == 'EDU') {
                  icon = ICON.eduIcon;
                } else if(item.common_code == 'INCOME') {
                  icon = ICON.incomeIcon;
                } else if(item.common_code == 'ASSET') {
                  if(item.auth_sub_code == 'REALTY') {
                    icon = ICON.realtyIcon;
                  } else {
                    icon = ICON.bankIcon;
                  }
                } else if(item.common_code == 'SNS') {
                  icon = ICON.snsIcon;
                } else if(item.common_code == 'VEHICLE') {
                  icon = ICON.vehicleIcon;
                }
                
                return (
                  <SpaceView viewStyle={_styles.authItemWrap}>
                    <Image source={icon} style={styles.iconSquareSize(23)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('SB', 11, '#fff')}>{item.auth_type_name}</Text></SpaceView>
                  </SpaceView>
                )
              })}
            </SpaceView>

          </SpaceView>

          {/* 마일스톤 영역 */}
          <SpaceView mt={20}>
            <SpaceView>
              <Text style={styles.fontStyle('EB', 15, '#fff')}>마일스톤</Text>
              <SpaceView mt={8}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>
                  <Text style={styles.fontStyle('SB', 11, '#7AB0C8')}>상위{realTimeData?.auth_percent}%의 프리미엄</Text> 회원이신 <Text style={styles.fontStyle('SB', 11, '#7AB0C8')}>{memberBase.nickname}</Text>님의{'\n'} 
                  멤버십 인증 과정 한눈에 보기
                </Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mt={20} viewStyle={{alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'row'}}>
              {/* <BitSwiper
                items={authList}
                itemScaleAlign={'top'}
                itemAlign={'top'}
                itemWidth="90%" // 활성 아이템의 넓이
                inactiveItemScale={0.9} // 비활성 아이템의 스케일
                inactiveItemOpacity={0.5} // 비활성 아이템의 투명도
                inactiveItemOffset={13} // 비활성 아이템 표시 넓이
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                showPaginate={false}
                onItemRender={(item, index) => (
                  <SpaceView key={index} viewStyle={_styles.mileSlideItem}>
                    <SpaceView>
                      <LinearGradient
                        colors={['rgba(64,224,208,0.6)', 'rgba(76,76,194,0.6)']}
                        style={{ paddingVertical: 3, borderRadius: 10, flexDirection: 'row', width: 40, alignItems: 'center', justifyContent: 'center' }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }} >
                        <Image source={ICON.authLevel} style={{width: 8, height: 11}} />
                        <SpaceView ml={5}><Text style={styles.fontStyle('B', 10, '#fff')}>6</Text></SpaceView>
                      </LinearGradient>
                      <SpaceView mt={10}>
                        <Text style={styles.fontStyle('EB', 15, '#fff')}>영앤리치</Text>
                      </SpaceView>
                      <SpaceView mt={5}>
                        <Text style={styles.fontStyle('SB', 10, '#fff')}>심사를 통해 50억 이상의 현금자산 자격을{'\n'}인증하셨습니다.</Text>
                      </SpaceView>
                    </SpaceView>
                    <SpaceView>
                      <Image source={ICON.authAsset} style={styles.iconSquareSize(65)} />
                    </SpaceView>
                  </SpaceView>
                )}
              /> */}

              <FlatList
                data={authList}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={true}
                decelerationRate="fast" // 스크롤 속도 설정
                pagingEnabled={true} // 한 페이지씩 스크롤
                snapToInterval={width * 0.75 + 10} // 아이템 너비 + marginHorizontal
                horizontal
                /* getItemLayout={(data, index) => (
                  {
                      length: (width - 54) / 2,
                      offset: ((width - 54) / 2) * index,
                      index
                  }
                )} */
                renderItem={({ item, index }) => {

                  let icon = ICON.jobIcon;

                  if(item.common_code == 'EDU') {
                    icon = ICON.eduIcon;
                  } else if(item.common_code == 'INCOME') {
                    icon = ICON.incomeIcon;
                  } else if(item.common_code == 'ASSET') {
                    if(item.auth_sub_code == 'REALTY') {
                      icon = ICON.realtyIcon;
                    } else {
                      icon = ICON.bankIcon;
                    }
                  } else if(item.common_code == 'SNS') {
                    icon = ICON.snsIcon;
                  } else if(item.common_code == 'VEHICLE') {
                    icon = ICON.vehicleIcon;
                  }

                  return (
                    <SpaceView key={index} viewStyle={_styles.mileSlideItem}>
                      <SpaceView viewStyle={{width: '70%'}}>
                        <LinearGradient
                          colors={['rgba(64,224,208,0.6)', 'rgba(76,76,194,0.6)']}
                          style={{ paddingVertical: 3, borderRadius: 10, flexDirection: 'row', width: 40, alignItems: 'center', justifyContent: 'center' }}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }} >
                          <Image source={ICON.authLevel} style={{width: 8, height: 11}} />
                          <SpaceView ml={5}><Text style={styles.fontStyle('B', 10, '#fff')}>{item.auth_level}</Text></SpaceView>
                        </LinearGradient>
                        <SpaceView mt={10}>
                          <Text style={styles.fontStyle('EB', 15, '#fff')}>{item.auth_type_name}</Text>
                        </SpaceView>
                        <SpaceView mt={5}>
                          <Text style={styles.fontStyle('SB', 10, '#fff')}>{item.comment}</Text>
                        </SpaceView>
                      </SpaceView>
                      <SpaceView>
                        <Image source={icon} style={styles.iconSquareSize(65)} />
                      </SpaceView>
                    </SpaceView>
                  )
                }}
              />
                
            </SpaceView>
          </SpaceView>
        </LinearGradient>

        {/* ################################################################################ 배너 영역 */}
        <SpaceView mt={20}>
          <RecommendBanner />
        </SpaceView>

        {/* ################################################################################ 마이홈 방문자 영역 */}
        <LinearGradient
          colors={['rgba(63,25,104,0.5)', 'rgba(59,95,212,0.5)']}
          style={{ paddingHorizontal: 10, paddingVertical: 20, marginTop: 30, borderRadius: 10 }}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }} >

          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.fontStyle('EB', 19, '#fff')}>마이홈 방문자</Text>
            <TouchableOpacity style={{backgroundColor: 'rgba(56,56,56,0.7)', borderRadius: 25, paddingHorizontal: 10, paddingVertical: 5}}>
              <Text style={styles.fontStyle('SB', 11, '#CBCBCB')}>전체보기</Text>
            </TouchableOpacity>
          </SpaceView>

          <SpaceView mt={20}>
            <ScrollView horizontal={true}>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
              <SpaceView viewStyle={_styles.homeVisitWrap}></SpaceView>
            </ScrollView>
          </SpaceView>

          <SpaceView mt={50} viewStyle={{alignItems: 'center'}}>
            <SpaceView>
              <Text style={styles.fontStyle('EB', 19, '#fff')}>마이 바이브</Text>
            </SpaceView>
            <SpaceView mt={15} viewStyle={{flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 25}}>
              <TouchableOpacity>
                <Text style={styles.fontStyle('SB', 12, '#8BAAFF')}>보낸 바이브</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 10}}>
                <Text style={styles.fontStyle('SB', 12, '#808080')}>받은 바이브</Text>
              </TouchableOpacity>
            </SpaceView>
            <SpaceView mt={15}>
              <Text style={[styles.fontStyle('SB', 11, '#9DC6DB'), {textAlign: 'center'}]}>짧은 눈팅에도 인상적인 바이브를 나누었던 사람들.{'\n'}그 동안 몇 번의 바이브를 주고 받았을까요?{'\n'}이 중에 나와 잘 맞는 친구가 있을거에요.</Text>
            </SpaceView>
            <SpaceView mt={15} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.peapleIcon} style={{width: 7, height: 15}} />
              <SpaceView ml={7} mb={3}><Text style={styles.fontStyle('EB', 18, '#fff')}>11</Text></SpaceView>
            </SpaceView>
            <TouchableOpacity style={_styles.storageBtn}>
              <Text style={styles.fontStyle('B', 11, '#fff')}>보관함 바로가기</Text>
              <Text style={styles.fontStyle('B', 11, '#fff')}>{'>'}</Text>
            </TouchableOpacity>
          </SpaceView>

          <SpaceView viewStyle={{flexDirection: 'row'}}>
            <LinearGradient
              colors={['rgba(122,122,122,0.5)', 'rgba(122,122,122,0.1)', 'rgba(122,122,122,0.1)']}
              style={_styles.vibeItemWrap}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }} >

              <SpaceView viewStyle={{alignItems: 'center'}}>
                <SpaceView viewStyle={{alignItems: 'center'}}>
                  <Text style={styles.fontStyle('SB', 9, '#fff')}>보낸 바이브 전체 중</Text>
                  <Text style={styles.fontStyle('H', 23, '#fff')}>45%</Text>
                </SpaceView>

                <SpaceView mt={10} viewStyle={{backgroundColor: 'rgba(0,0,0,0.3)', width: 120, paddingVertical: 7, alignItems: 'center', borderRadius: 10}}>
                  <Text style={styles.fontStyle('B', 12, '#fff')}>순두부상</Text>
                </SpaceView>                
              </SpaceView>

              <SpaceView mt={25} viewStyle={{alignItems: 'flex-start', justifyContent: 'flex-start'}}>
                <Text style={styles.fontStyle('SB', 8, '#A8A8A8')}>높은 리스펙트 등급</Text>
                <SpaceView mt={8} viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <SpaceView viewStyle={{flexDirection: 'row'}}>
                    <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                    <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                    <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                  </SpaceView>
                  <SpaceView>
                    <Text>99</Text>
                  </SpaceView>
                </SpaceView>
              </SpaceView>

            </LinearGradient>
          </SpaceView>

        </LinearGradient>        

      </LinearGradient>
    </>
  );

});


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  
  respectTabWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 5,
  },
  respectTabItem:(isOn:boolean) => {
    return {
      paddingHorizontal: 9,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: isOn ? 2 : 0,
      borderRadius: 9,
      borderColor: '#8BAAFF',
      backgroundColor: isOn ? 'rgba(171,232,255,0.3)' : 'transparent',
    };
  },
  respectText:(isOn:boolean) => {
    return {
      fontFamily: 'SUITE-Bold',
      fontSize: 11,
      color: isOn ? '#8BAAFF' : '#808080',
    };
  },
  respectTabCurrentWrap: {
    position: 'absolute',
    bottom: -13 ,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respectTabCurrentMark: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    width: 45,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respectItemWrap: {
    width: width/3.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F5E8A8',
    borderRadius: 25,
    overflow: 'hidden',
  },
  respectBtnWrap:(item:string, isOn:boolen) => {
    let _bgcr = '#46F66F';

    if(item != 'FREE') {
      if(!isOn) {
        _bgcr = '#fff';
      } else {
        _bgcr = '#888888';
      }
    }

    return {
      backgroundColor: _bgcr,
      borderRadius: 5,
      paddingVertical: 3,
      paddingHorizontal: 10,
    };
  },
  respectItemBtn:(isOn:boolean) => {
    return {
      fontFamily: 'SUITE-Bold',
      fontSize: 11,
      color: isOn ? '#fff' : '#000000',
      backgroundColor: isOn ? '#46F66F' : '#fff',
      borderRadius: 5,
      paddingVertical: 3,
    paddingHorizontal: 10,
    };
  },
  respectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 100,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  awardImgStyle: {
    width: 60,
    height: 83,
  },
  authItemWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(148,165,163,0.6)',
    borderRadius: 25,
    paddingHorizontal: 13,
    paddingVertical: 4,
    marginHorizontal: 3,
    marginVertical: 5,
  },
  bannerWrap: {
    backgroundColor: 'rgba(53,81,72,0.5)', 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  homeVisitWrap: {
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 60,
    width: 60,
    height: 60,
    marginRight: 10,
  },
  storageBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 130,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 15,
  },
  vibeItemWrap: {
    paddingHorizontal: 10, 
    paddingVertical: 20, 
    marginTop: 30, 
    borderRadius: 10,
    width: width/2.3,
  },
  mileSlideWrap: {
    height:100,
    //flex:1,
  },
  mileSlideItem: {
    width: width * 0.75,
    height: 100,
    marginRight: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    //marginLeft: -25, // 좌측 마진
    //marginRight: 25, // 우측 마진
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

});


export default Active;
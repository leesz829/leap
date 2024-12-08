import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import * as properties from 'utils/properties';
import { insert_member_inquiry } from 'api/models';
import { usePopup } from 'Context';
import { SUCCESS } from 'constants/reusltcode';
import { STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';
import { useProfileImg } from 'hooks/useProfileImg';
import { Shadow } from 'react-native-shadow-2';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import MemberMark from 'component/common/MemberMark';
import { isEmptyData, formatNowDate } from 'utils/functions';
import Active from 'component/roby/Active';
import { useSecondAth } from 'hooks/useSecondAth';
import { useDispatch } from 'react-redux';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';


/* ################################################################################################################
###################################################################################################################
###### 마이홈 방문자용 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const MyHome = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const memberBase = useUserInfo(); // 회원 기본정보
  
	const mbrProfileImgList = useProfileImg();
	const mbrProfileAuthList = useSecondAth();
  const realTimeData = '';

  const tempStoryData = [
    {
      nickname: 'Random NickName',
      contents: '게시글 내용(2줄 표기), 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13 정도 남기고 <...> 처리합니다. 게시글 제목(2줄 표기) 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13 정도 남기고 <...>',
      keyword_code: 'PLACE',
      like_cnt: '999',
      reply_cnt: '999',
    },
    {
      nickname: 'Random NickName',
      contents: '게시글 내용(2줄 표기), 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13 정도 남기고 <...> 처리합니다. 게시글 내용(2줄 표기), 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13 정도 남기고 <...> 처리합니다.',
      keyword_code: 'OTT',
      like_cnt: '9k',
      reply_cnt: '9.9k',
    },
    {
      nickname: 'Random NickName',
      contents: '게시글 제목(2줄 표기), 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13pt 정도 남기고 <...> 처리합니다. 게시글 제목(2줄 표기), 넘어가는 내용은 현재 너비에 맞춰서 여백 약 13pt 정도 남기고 <...> 처리합니다.',
      keyword_code: 'RESUME',
      like_cnt: '10m',
      reply_cnt: '1.5m',
    }
  ];

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				{/* <CommonHeader title="마이홈 방문자" /> */}
        
        <ScrollView 
					bounces={false} 
					showsVerticalScrollIndicator={false} 
					style={{flexGrow: 1, /* paddingTop: 15, marginTop: 30 */}}
				>
					<LinearGradient
						colors={['rgba(128, 128, 226, 0.0)', 'rgba(116, 116, 206, 1)', 'rgba(116, 116, 206, 0.9)', '#16112A']}
						start={{ x: 0, y: 0.3 }}
						end={{ x: 0, y: 1 }} 
						style={{paddingBottom: 250}}
					>

						{/* ################################################################################
						###### 상단 배경 영역 
						################################################################################ */}
						<SpaceView viewStyle={_styles.topBgWrap}>
							<Image source={ICON.myhomeTopBg} style={{width: width, height: width/1.2}} resizeMode={'cover'} />
						</SpaceView>

						{/* ################################################################################
						###### 컨텐츠 영역
						################################################################################ */}
						<SpaceView viewStyle={_styles.contentWrap}>

							{/* ################################################################################ 상단 영역 */}
							<SpaceView>

								{/* 메뉴, 알림 영역 */}
								<SpaceView mt={35} ml={13} mr={13} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => { navigation.goBack(); }}
                    hitSlop={commonStyle.hipSlop20}
                  >
                    <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} resizeMode={'contain'} />
                  </TouchableOpacity>
									{/* <TouchableOpacity 
										onPress={() => ( onPressAlarmMessage() )}>
										<Image source={ICON.alarm} style={styles.iconSquareSize(42)} />
									</TouchableOpacity>
									<TouchableOpacity 
										onPress={() => ( setIsVisible(true) )}
										hitSlop={commonStyle.hipSlop20}>
										<Image source={ICON.menu} style={styles.iconSquareSize(38)} />
									</TouchableOpacity> */}
                  <SpaceView />
                  <SpaceView viewStyle={[layoutStyle.rowStart]}>
                    <TouchableOpacity
                      style={{marginRight: 10}}
                    >
                      <Image source={ICON.chatIcon} style={styles.iconSquareSize(35)} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Image source={ICON.declaration} style={styles.iconSquareSize(35)} />
                    </TouchableOpacity>
                  </SpaceView>
								</SpaceView>

								{/* 닉네임, 대표 사진 영역 */}
								<SpaceView mt={30} viewStyle={{alignItems: 'center'}}>
									<SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
										{/* <SocialGrade grade={memberBase?.respect_grade} sizeType={'SMALL'} /> */}
										{isEmptyData(memberBase?.face_modifier) && ( 
											<SpaceView ml={8} viewStyle={_styles.bestFaceContainer}>
												<Text style={styles.fontStyle('SB', 9, '#fff')}>#{memberBase?.face_modifier}</Text>
											</SpaceView>
										)}
									</SpaceView>
                  <SpaceView viewStyle={layoutStyle.rowBetween}>
                    <SpaceView viewStyle={[layoutStyle.rowBetween, _styles.mmbrInfoBox, {backgroundColor: '#FFF'}]}>
                      <Image source={ICON.respectIcon} style={styles.iconSquareSize(10)} resizeMode='contain' />
                      <Text style={styles.fontStyle('B', 9, '#000')}>SILVER</Text>
                    </SpaceView>
                    <SpaceView ml={5} viewStyle={[_styles.mmbrInfoBox, {backgroundColor: '#40E0D0'}]}>
                      <Text style={styles.fontStyle('B', 9, '#FFF')}>#웃는게 예뻐요</Text>
                    </SpaceView>
                    <SpaceView mr={5} ml={5} viewStyle={[_styles.mmbrInfoBox, {backgroundColor: '#C740E0'}]}>
                      <Text style={styles.fontStyle('B', 9, '#FFF')}>높은 인증 레벨</Text>
                    </SpaceView>
                    <SpaceView viewStyle={[_styles.mmbrInfoBox, {backgroundColor: '#3875DF'}]}>
                      <Text style={styles.fontStyle('B', 9, '#FFF')}>다양한 인증</Text>
                    </SpaceView>
                  </SpaceView>
									<SpaceView mt={8} mb={20}>
										<Text style={styles.fontStyle('H', 30, '#fff')}>{memberBase?.nickname}</Text>
									</SpaceView>
									<TouchableOpacity 
										style={_styles.mstProfileImgArea}
									>
										<Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.mstProfileImgStyle} />
									</TouchableOpacity>
								</SpaceView>
							</SpaceView>

						</SpaceView>
					</LinearGradient>

					<SpaceView pl={10} pr={10} mt={-250} mb={100}>

						{/* ################################################################################ 리프 AI 영역 */}
						<SpaceView mt={45}>
							<SpaceView mb={18}>
								<Text style={styles.fontStyle('H', 38, '#fff')}>리프 AI</Text>
							</SpaceView>

							{/* ################################################################################ AI 소개글 영역 */}
							<LinearGradient
								colors={['rgba(65,25,104,0.5)', 'rgba(59,95,212,0.5)']}
								style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 18, marginBottom: 20 }}
								start={{ x: 0, y: 0.3 }}
								end={{ x: 0.9, y: 0.9 }}
							>
								<Text style={styles.fontStyle('EB', 20, '#fff')}>AI 소개글</Text>

								<SpaceView mt={8}>
									<Text style={styles.fontStyle('SB', 12, '#fff')}>"김리미"은 2018년 1월, 중견기업에서 사원으로 경력을 시작했습니다. 그 시점에서 그는 직장에서의 초기 적응과 기초적인 업무 숙련도를 쌓아가며, 자신의 아이디어와 창의성을 발휘하고자 했습니다. 이 시기의 그는 높은 에너지를 바탕으로 활발히 활동하며, 새로운 기회를 모색하고 사람들과의 네트워크를 확장하는 데 주력했습니다. 업무에 대한 접근 방식은 실용적이면서도 창의적이었으며, 팀 내에서 주도적인 역할을 자주 맡았고, 주변 동료들과의 협력을 통해 업무를 효율적으로 수행했습...</Text>
								</SpaceView>

								<SpaceView mt={20} viewStyle={layoutStyle.alignCenter}>
									<Text style={styles.fontStyle('SB', 12, '#9DC6DB')}>NickName님의 이야기가 더 궁금한가요?</Text>
								</SpaceView>

								<SpaceView mt={20} viewStyle={layoutStyle.rowCenter}>
									<TouchableOpacity>
										<LinearGradient
											colors={['#44B6E5', '#1CDE95']}
											style={{ flexDirection: 'row', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10 }}
											start={{ x: 0, y: 0.3 }}
											end={{ x: 0.9, y: 0.9 }}
										>
											<Image source={ICON.searchWhite} style={styles.iconSquareSize(18)} />
											<SpaceView ml={5}><Text style={styles.fontStyle('EB', 17, '#fff')}>전체보기</Text></SpaceView>

											<SpaceView ml={5} viewStyle={[layoutStyle.rowBetween, {backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, paddingHorizontal: 5, paddingVertical: 3,}]}>
												<Image source={ICON.cube} style={styles.iconSquareSize(13)} />
												<SpaceView ml={5}><Text style={styles.fontStyle('R', 8, '#fff')}>20개</Text></SpaceView>
											</SpaceView>
										</LinearGradient>
									</TouchableOpacity>
								</SpaceView>

								<SpaceView mt={30}>
									<Text style={styles.fontStyle('EB', 20, '#fff')}>더 알아보기</Text>
									<SpaceView mt={10} viewStyle={[layoutStyle.rowStart, {overflow: 'hidden'}]}>
										{['데이트 스타일', 'MBTI 비교하기'].map((item, index) => {

											return (
												<>
													<SpaceView mt={5} mr={10} viewStyle={_styles.aiIntroWrap}>
														<Text style={styles.fontStyle('SB', 16, '#fff')}>{item}</Text>
														<SpaceView mt={20}>
															<Text style={styles.fontStyle('R', 10, '#fff')}>영화와 카페에서 즐기는 실내 데이트? 공연, 등산같은 실외 데이트?어떤 데이트를 더 선호할까요?</Text>
														</SpaceView>
														<TouchableOpacity
                            	style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' ,borderRadius: 25, paddingHorizontal: 15, paddingVertical: 5, backgroundColor: '#44B6E5', marginTop: 20, }}
                            >
																<Image source={ICON.lockIcon} style={styles.iconSquareSize(18)} />
																<SpaceView ml={5}><Text style={styles.fontStyle('B', 16, '#fff')}>열어보기</Text></SpaceView>

																<SpaceView ml={5} viewStyle={[layoutStyle.rowBetween, {backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, paddingHorizontal: 5, paddingVertical: 3,}]}>
																	<Image source={ICON.cube} style={styles.iconSquareSize(13)} />
																	<SpaceView ml={5}><Text style={styles.fontStyle('R', 8, '#fff')}>20개</Text></SpaceView>
																</SpaceView>
														</TouchableOpacity>
													</SpaceView>
												</>
											)
										})}
									</SpaceView>
								</SpaceView>
							</LinearGradient>

              {/******************* 리프활동 *********************/}
              <SpaceView mb={18} mt={18}>
								<Text style={styles.fontStyle('H', 38, '#fff')}>리프 활동</Text>
							</SpaceView>
							<LinearGradient
								colors={['rgba(65,25,104,0.3)', 'rgba(59,95,212,0.4)']}
								style={{ paddingHorizontal: 10, paddingVertical: 20, marginTop: 20, borderRadius: 10 }}
								start={{ x: 0.4, y: 0.4 }}
								end={{ x: 0.7, y: 0.7 }} >
                
                {/* 멤버십 레벨 */}
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
												{(realTimeData?.auth_percent >= 21 && realTimeData?.auth_percent <= 30) && <> 리프에서 월등한 멤버십 인증 회원 </>}
												{(realTimeData?.auth_percent >= 31 && realTimeData?.auth_percent <= 50) && <> 리프에서 우월한 멤버십 인증 회원 </>}
												{(realTimeData?.auth_percent >= 51 && realTimeData?.auth_percent <= 70) && <> 리프에서 경쟁력 있는 멤버십 인증 회원 </>}
												{(realTimeData?.auth_percent >= 71 && realTimeData?.auth_percent <= 100) && <> 믿을 수 있는 멤버십 인증 회원 </>}
											</>
											)}
										</Text>
									</SpaceView>

									{/* 인증 목록 영역 */}
									<SpaceView mt={15} viewStyle={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
									{mbrProfileAuthList.map((item, index) => {
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
									  <Text style={styles.fontStyle('EB', 15, '#fff')}>Nickname님의 여정</Text>
									  <SpaceView mt={8}>

                      {/************** 임시 텍스트 ************/}
                      <Text style={styles.fontStyle('B', 12, '#fff')}>
                        <Text style={styles.fontStyle('B', 12, '#7AB0C8')}>
                          상위5%의 프리미엄 
                        </Text>
                        회원이신&nbsp;
                        <Text style={styles.fontStyle('B', 12, '#7AB0C8')}>
                          닉네임
                        </Text>
                        님의{'\n'}
                        멤버십 인증 과정 한눈에 보기
                      </Text>

										  <Text style={styles.fontStyle('B', 12, '#fff')}>
										  {realTimeData?.auth_percent <= 20 && (
                        <>
                          <Text style={styles.fontStyle('B', 12, '#7AB0C8')}>
                            상위{realTimeData?.auth_percent}%의 
                            {realTimeData?.auth_percent == 1 && <> 킹 오브 리프 </>}
                            {(realTimeData?.auth_percent >= 2 && realTimeData?.auth_percent <= 5) && <> VIP </>}
                            {(realTimeData?.auth_percent >= 6 && realTimeData?.auth_percent <= 10) && <> 프리미엄 </>}
                            {(realTimeData?.auth_percent >= 11 && realTimeData?.auth_percent <= 15) && <> 최상위 </>}
                            {(realTimeData?.auth_percent >= 16 && realTimeData?.auth_percent <= 20) && <> 상위 </>}
                          </Text>
                          회원이신 <Text style={styles.fontStyle('B', 12, '#7AB0C8')}>{memberBase.nickname}</Text>님의{'\n'}멤버십 인증 과정 한눈에 보기
                        </>
                      )}
										  {realTimeData?.auth_percent >= 21 && (
                        <>
                          <Text style={styles.fontStyle('SB', 11, '#7AB0C8')}>인증</Text> 회원이신 <Text style={styles.fontStyle('SB', 11, '#7AB0C8')}>{memberBase.nickname}</Text>님의{'\n'}멤버십 인증 과정 한눈에 보기
                        </>
										  )}
										  </Text>
									  </SpaceView>
									</SpaceView>

                  <SpaceView viewStyle={{flexDirection: 'row',alignItems: 'center'}}>
                    <SpaceView viewStyle={{backgroundColor: '#7AB0C8', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 50,}}>
                      <Text style={styles.fontStyle('B', 12, '#FFF')}>23.05</Text>
                    </SpaceView>
                    <SpaceView viewStyle={{backgroundColor: '#7AB0C8', height: 5,flex: 1}} />
                  </SpaceView>

									<SpaceView mt={10} viewStyle={{alignItems: 'flex-start', justifyContent: 'flex-start', flexDirection: 'row'}}>
                    <FlatList
                      data={mbrProfileAuthList}
                      keyExtractor={(item, index) => index.toString()}
                      showsHorizontalScrollIndicator={false}
                      removeClippedSubviews={true}
                      decelerationRate="fast" // 스크롤 속도 설정
                      pagingEnabled={true} // 한 페이지씩 스크롤
                      snapToInterval={width * 0.75 + 10} // 아이템 너비 + marginHorizontal
                      horizontal
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
                              <SpaceView ml={5}>
                                <Text style={styles.fontStyle('B', 10, '#fff')}>{item.auth_level}</Text>
                              </SpaceView>
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

              {/******************* 바이브 *********************/}
              <LinearGradient
                colors={['rgba(63,25,104,0.5)', 'rgba(59,95,212,0.5)']}
                style={{ paddingHorizontal: 10, paddingVertical: 40, marginTop: 30, borderRadius: 10 }}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }} >
                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
                        <Text style={styles.fontStyle('B', 12, '#fff')}>감각적인 패션</Text>
                      </SpaceView>                
                    </SpaceView>
                    <SpaceView mt={25}>
                      <Text style={styles.fontStyle('SB', 8, '#A8A8A8')}>높은 리스펙트 등급</Text>
                      <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                        <SpaceView mt={8} viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                        </SpaceView>
                        <SpaceView viewStyle={{backgroundColor: '#000', borderRadius: 50,alignItems:'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 5}}>
                          <Text style={styles.fontStyle('R', 10, '#fff')}>99+</Text>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </LinearGradient>

                  <LinearGradient
                    colors={['rgba(122,122,122,0.5)', 'rgba(122,122,122,0.1)', 'rgba(122,122,122,0.1)']}
                    style={_styles.vibeItemWrap}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 1 }} >

                    <SpaceView viewStyle={{alignItems: 'center'}}>
                      <SpaceView viewStyle={{alignItems: 'center'}}>
                        <Text style={styles.fontStyle('SB', 9, '#fff')}>받은 바이브 전체 중</Text>
                        <Text style={styles.fontStyle('H', 23, '#fff')}>63%</Text>
                      </SpaceView>

                      <SpaceView mt={10} viewStyle={{backgroundColor: 'rgba(0,0,0,0.3)', width: 120, paddingVertical: 7, alignItems: 'center', borderRadius: 10}}>
                        <Text style={styles.fontStyle('B', 12, '#fff')}>스마트한 전문성</Text>
                      </SpaceView>                
                    </SpaceView>
                    <SpaceView mt={25}>
                      <Text style={styles.fontStyle('SB', 8, '#A8A8A8')}>높은 리스펙트 등급</Text>
                      <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                        <SpaceView mt={8} viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                            <SpaceView viewStyle={{borderRadius:50, borderWidth:1, borderColor: '#A8A8A8', width: 30, height: 30,}}></SpaceView>
                        </SpaceView>
                        <SpaceView viewStyle={{backgroundColor: '#000', borderRadius: 50,alignItems:'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 5}}>
                          <Text style={styles.fontStyle('R', 10, '#fff')}>99+</Text>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </LinearGradient>
                </SpaceView>
              </LinearGradient>

              {/******************* 스토리 *********************/}
              <SpaceView mb={18} mt={30}>
								<Text style={styles.fontStyle('H', 38, '#fff')}>스토리</Text>
							</SpaceView>

              <SpaceView viewStyle={_styles.storyWrap}>
                {/* 작성한 글 / 공유한 좋아요 */}
                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <SpaceView mr={5} viewStyle={_styles.storySumCont}>
                    <SpaceView viewStyle={_styles.storySumTit}>
                      <Text style={styles.fontStyle('B', 12, '#FFF')}>작성한 글</Text>
                    </SpaceView>
                    <SpaceView viewStyle={_styles.storySumDesc}>
                      <Text style={styles.fontStyle('B', 9, '#FFF')}>Nickname님이 작성한 게시글</Text>
                      <Text style={[styles.fontStyle('H', 24, '#FFF'), {marginTop: 5}]}>45건</Text>
                      <SpaceView mt={5} viewStyle={{backgroundColor: 'rgba(0, 0, 0, .6)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 30}}>
                        <Text style={styles.fontStyle('B', 10, '#FFF')}>작성 댓글 100건</Text>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>

                  <SpaceView ml={5} viewStyle={_styles.storySumCont}>
                    <SpaceView viewStyle={_styles.storySumTit}>
                      <Text style={styles.fontStyle('B', 12, '#FFF')}>공유한 좋아요</Text>
                    </SpaceView>
                    <SpaceView viewStyle={_styles.storySumDesc}>
                      <Text style={styles.fontStyle('B', 9, '#FFF')}>Nickname님이 보낸 좋아요</Text>
                      <Text style={[styles.fontStyle('H', 24, '#FFF'), {marginTop: 5}]}>63건</Text>
                      <SpaceView mt={5} viewStyle={{backgroundColor: 'rgba(0, 0, 0, .6)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 30}}>
                        <Text style={styles.fontStyle('B', 10, '#FFF')}>받은 좋아요 200건</Text>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </SpaceView>

                {/* 스토리 목록 */}
                <SpaceView mt={30}>
                  <FlatList
                    data={tempStoryData}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews={true}
                    decelerationRate="fast"
                    pagingEnabled={true}
                    snapToInterval={width * 0.75 + 10}
                    renderItem={({ item, index }) => {
                      return (
                        <SpaceView viewStyle={_styles.storyListCont}>
                          <SpaceView viewStyle={layoutStyle.rowBetween}>
                            <Text style={styles.fontStyle('B', 16, '#000')}>{item?.nickname}</Text>
                            <SpaceView viewStyle={{backgroundColor: '#FFFF5D', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 30,}}>
                              <Text style={styles.fontStyle('B', 10, '#000')}>
                                {item?.keyword_code == 'PLACE' ? '나들이명소' 
                                  : item?.keyword_code == 'OTT' ? 'OTT뭐볼까?' 
                                  : '이력서·면접'}
                              </Text>
                            </SpaceView>
                          </SpaceView>

                          <SpaceView viewStyle={_styles.storyListDesc(item?.keyword_code == 'RESUME')}>
                            {item?.keyword_code == 'RESUME' &&
                              <SpaceView viewStyle={_styles.choicePickCont}>
                                <Text style={styles.fontStyle('B', 10, '#FF516F')}>초이스픽</Text>
                                <SpaceView ml={15} viewStyle={[layoutStyle.rowStart, {backgroundColor: '#FFF', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 30}]}>
                                  <Image source={ICON.cube} style={styles.iconSquareSize(10)} />
                                  <Text style={styles.fontStyle('B', 10, '#000')}>15</Text>
                                </SpaceView>
                              </SpaceView>
                            }

                            <Text
                              numberOfLines={2}
                              ellipsizeMode="tail" 
                              style={[styles.fontStyle('B', 12, item?.keyword_code == 'RESUME' ? '#FFF' : '#000')]}>
                              {item?.contents}
                            </Text>
                          </SpaceView>

                          <SpaceView viewStyle={layoutStyle.rowEnd}>
                            <SpaceView mr={15} viewStyle={layoutStyle.rowCenter}>
                              <Image source={ICON.story_heartBlack} style={[styles.iconSquareSize(20), {marginRight: 5}]} resizeMode='contain' />
                              <Text style={styles.fontStyle('B', 12, '#000')}>{item?.like_cnt}</Text>
                            </SpaceView>
                            <SpaceView viewStyle={layoutStyle.rowCenter}>
                              <Image source={ICON.replayBlack} style={[styles.iconSquareSize(20), {marginRight: 5}]} resizeMode='contain' />
                              <Text style={styles.fontStyle('B', 12, '#000')}>{item?.reply_cnt}</Text>
                            </SpaceView>
                          </SpaceView>
                        </SpaceView>
                      )}}
                    />
                </SpaceView>
              </SpaceView>

						</SpaceView>
					</SpaceView>
				</ScrollView>
			</SpaceView>
		</>
	);
};


const _styles = StyleSheet.create({
	wrap: {
		minHeight: height,
		backgroundColor: '#16112A',
	},
	bestFaceContainer: {
    height: 20,
    paddingHorizontal: 6,
    backgroundColor: '#40E0D0',
    borderRadius: Platform.OS == 'ios' ? 8 : 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topBgWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  mmbrInfoBox :{
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 10
  },
  contentWrap: {
    
  },
  mstProfileImgArea: {
    borderRadius: 15,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.83,
    shadowRadius: 8.0,
    elevation: 40,
    overflow: 'visible',
  },
  mstProfileImgStyle: {
    width: 130,
    height: 130,
    borderRadius: 15,
  },
  tabText: (isOn:boolean) => {
    return {
      fontFamily: 'SUITE-ExtraBold',
      fontSize: 25,
      color: isOn ? '#46F66F' : '#A6B8CF',
      borderBottomColor: '#46F66F',
      borderBottomWidth: isOn ? 2 : 0,
      paddingBottom: 3,
    };
  },
  menuItemWrap: {
    marginBottom: 30,
  },
  profileEditBtnWrap: {
    position: 'absolute',
    bottom: 3,
    right: 3,
  },
  menuBlurWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
	aiIntroWrap: {
		backgroundColor: 'rgba(52,52,52,0.5)',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: 'rgba(112,112,112,0.5)',
    width: width - 250,
		paddingHorizontal: 10,
		paddingVertical: 10,
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
  vibeItemWrap: {
    paddingHorizontal: 10, 
    paddingVertical: 20, 
    marginVertical: 20,
    borderRadius: 10,
    width: width/2.3,
  },
  storyWrap: {
    backgroundColor: '#343434',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  storySumCont: {
    flex: 1,
    backgroundColor: 'rgba(56, 56, 56, 0.6)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  storySumTit: {
    backgroundColor: '#44B6E5',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  storySumDesc: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 15,
  },
  storyListCont: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  storyListDesc: (isResume:boolean) => {
    return {
      width: !isResume && width - 120,
      marginVertical: 20,
      backgroundColor: isResume ? '#3E11F5' : 'transparent',
      padding: isResume ? 10 : '0',
      borderRadius: isResume ? 5 : 0,
    };
  },
  choicePickCont: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, .6)',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 30,
  },
});
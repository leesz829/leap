import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import React, { memo, useEffect, useState } from 'react';
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
	const { show } = usePopup(); // 공통 팝업

	const memberBase = useUserInfo(); // 회원 기본정보

	const mbrProfileImgList = useProfileImg();

	// 클릭 여부
	const [isClickable, setIsClickable] = useState(true);



	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				{/* <CommonHeader title="마이홈 방문자" /> */}
        
        <ScrollView 
					bounces={false} 
					showsVerticalScrollIndicator={false} 
					style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}
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
									{/* <TouchableOpacity 
										onPress={() => ( onPressAlarmMessage() )}>
										<Image source={ICON.alarm} style={styles.iconSquareSize(42)} />
									</TouchableOpacity>
									<TouchableOpacity 
										onPress={() => ( setIsVisible(true) )}
										hitSlop={commonStyle.hipSlop20}>
										<Image source={ICON.menu} style={styles.iconSquareSize(38)} />
									</TouchableOpacity> */}
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
								<Text style={styles.fontStyle('H', 36, '#fff')}>리프 AI</Text>
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
									<TouchableOpacity /* onPress={onAiIntroPopup} */>
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
									<SpaceView mt={10} viewStyle={[layoutStyle.rowStart]}>
										{['데이트 스타일', 'MBTI 비교하기'].map((item, index) => {

											return (
												<>
													<SpaceView mr={10} viewStyle={_styles.aiIntroWrap}>
														<Text style={styles.fontStyle('SB', 16, '#fff')}>{item}</Text>
														<SpaceView mt={10}>
															<Text style={styles.fontStyle('R', 10, '#fff')}>영화와 카페에서 즐기는 실내 데이트? 공연, 등산같은 실외 데이트? 어떤 데이트를 더 선호할까요?</Text>
														</SpaceView>
														<TouchableOpacity /* onPress={onAiIntroPopup} */>
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
												</>
											)
										})}
									</SpaceView>
								</SpaceView>
							</LinearGradient>
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
		width: 160,
		paddingHorizontal: 10,
		paddingVertical: 10,
	},

});
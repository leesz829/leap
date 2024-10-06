import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions } from 'react-native';
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




/* ################################################################################################################
###################################################################################################################
###### 추천 친구 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const RecommendMatch = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const { show } = usePopup(); // 공통 팝업

	const memberBase = useUserInfo(); // 회원 기본정보

	const mbrProfileImgList = useProfileImg();

	// 클릭 여부
	const [isClickable, setIsClickable] = useState(true);



	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				<CommonHeader title="추천 친구" />
        
        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView>
						<LinearGradient
							colors={['rgba(255,255,255,0.5)', 'rgba(106,107,105,0.5)']}
							start={{ x: 0, y: 0.1 }}
              end={{ x: 0.7, y: 0.7 }}
							style={[_styles.recommendWrap]}
						>
							<SpaceView>
								<Text style={styles.fontStyle('EB', 20, '#fff')}>리프의 추천</Text>
							</SpaceView>

							<SpaceView mt={15} mb={10} viewStyle={_styles.recommendItemWrap}>
								{[0,1].map((item, index) => {

									return (
										<>
											<SpaceView viewStyle={{width: '47%', borderRadius: 15, overflow: 'hidden'}}>
												
												{/* 리스펙트 등급 표시 */}
												<SpaceView viewStyle={_styles.gradeArea}>
													<Image source={ICON.sparkler} style={styles.iconSquareSize(14)} />
													<SpaceView ml={3}><Text style={styles.fontStyle('SB', 12, '#000')}>PLATINUM</Text></SpaceView>
												</SpaceView>

												{/* 이미지 */}
												<SpaceView>
													<Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.memberImgStyle} />
												</SpaceView>

												{/* 하단 */}
												<SpaceView viewStyle={_styles.recommendItemBottomWrap}>
													{index == 0 && (
														<TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
															<Image source={ICON.searchGreen} style={styles.iconSquareSize(20)} />
														</TouchableOpacity>
													)}

													{index == 1 && (
														<>
															<SpaceView viewStyle={layoutStyle.rowBetween}>
																<SpaceView viewStyle={[layoutStyle.rowBetween, {backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 25, paddingHorizontal: 5, paddingVertical: 3,}]}>
																	<Image source={ICON.cube} style={styles.iconSquareSize(13)} />
																	<SpaceView ml={3}><Text style={styles.fontStyle('R', 8, '#fff')}>15개</Text></SpaceView>
																</SpaceView>
																<TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
																	<Image source={ICON.arrowRight} style={styles.iconSquareSize(20)} />
																</TouchableOpacity>
															</SpaceView>
														</>
													)}
													
												</SpaceView>

												{index == 1 && (
													<BlurView 
														style={_styles.blurArea}
														blurType='light'
														blurAmount={30}
													/>
												)}
											</SpaceView>
										</>
									)
								})}

							</SpaceView>
						</LinearGradient>
					</SpaceView>

					<SpaceView mt={30}>
						<Text style={styles.fontStyle('EB', 20, '#fff')}>{memberBase?.nickname}님과{'\n'}잘 맞을 것 같은 다른 친구들</Text>

						<SpaceView mt={10} viewStyle={[layoutStyle.rowStart, {flexWrap: 'wrap'}]}>
							{['인상적 바이브', '군계일학 전문성', '공부 좀 치는 친구', '재벌집 막내 친구', '드라이브 메이트', '알파메일 친구'].map((item, index) => {
								return (
									<>
										<SpaceView mr={5} mb={10} viewStyle={{backgroundColor: index == 0 ? '#fff' : '#888888', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5}}>
											<Text style={styles.fontStyle('SB', 16, index == 0 ? '#8BAAFF' : '#fff')}>{item}</Text>
										</SpaceView>
									</>
								)
							})}
						</SpaceView>
					</SpaceView>

					<SpaceView mt={30} mb={150}>
						<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
							{[0,1,2,3].map((item, index) => {
								return (
									<>
										<SpaceView viewStyle={_styles.etcItemWrap}>
											<SpaceView viewStyle={{borderRadius: 15, overflow: 'hidden'}}>
												<Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.iconSquareSize(150)} />
											</SpaceView>
											<SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
												<SpaceView mt={10} viewStyle={{backgroundColor: '#40E0D0', borderRadius: 12, alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8}}>
													<Text style={styles.fontStyle('SB', 13, '#fff')}>#땀 흘려 가꾼 체형</Text>
												</SpaceView>
											</SpaceView>
											<SpaceView mt={20}>
												<Text style={styles.fontStyle('SB', 15, '#fff')}>어제도리프</Text>
												<SpaceView mt={10}>
													<Text style={styles.fontStyle('R', 10, '#fff')}>"한줄소개는 2줄 표기하며 최대30글자 중앙정렬 한줄소개는 2줄 표기하며 최대30글자 중앙정렬"</Text>
												</SpaceView>
											</SpaceView>
											<SpaceView mt={30}>
												<TouchableOpacity style={[layoutStyle.rowBetween, _styles.etcBtnWrap('#46F66F')]}>
													<Image source={ICON.searchWhite} style={styles.iconSquareSize(18)} />
													<Text style={styles.fontStyle('B', 15, '#fff')}>열람하기</Text>
												</TouchableOpacity>
											</SpaceView>
										</SpaceView>
									</>
								)
							})}
						</ScrollView>
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
		paddingHorizontal: 10,
		paddingTop: 30,
	},
	
	recommendWrap: {
		borderRadius: 10,
		paddingHorizontal: 13,
		paddingVertical: 10,
	},
	recommendItemWrap: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	memberImgStyle: {
		width: '100%',
		height: width/1.8,
	},
	gradeArea: {
		backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 3,
		position: 'absolute',
		top: 8,
		left: 8,
		zIndex: 1,
	},
	recommendItemBottomWrap: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 2,
		paddingHorizontal: 6,
		paddingVertical: 5,
		backgroundColor: 'rgba(96,96,96,0.5)'
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
	etcItemWrap: {
		backgroundColor: 'rgba(52,52,52,0.5)',
		borderWidth: 1,
		borderColor: 'rgba(112,112,112,0.5)',
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 13,
		marginRight: 10,
		width: width/2.4
	},
	etcBtnWrap: (bg:string) => {
    return {
      backgroundColor: bg,
			borderRadius: 25,
			paddingHorizontal: 15,
			height: 35,
    };
  },

});
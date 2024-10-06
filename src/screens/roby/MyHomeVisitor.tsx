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
import MemberMark from 'component/common/MemberMark';




/* ################################################################################################################
###################################################################################################################
###### 마이홈 방문자 전체 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const MyHomeVisitor = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const { show } = usePopup(); // 공통 팝업

	const memberBase = useUserInfo(); // 회원 기본정보

	const mbrProfileImgList = useProfileImg();

	// 클릭 여부
	const [isClickable, setIsClickable] = useState(true);



	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				<CommonHeader title="마이홈 방문자" />
        
        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView>
						{[0,1,2,3,4,5].map((item, index) => {

							return (
								<>
									<SpaceView mb={20} viewStyle={[layoutStyle.rowStart, _styles.itemWrap]}>
										<SpaceView>
											<SpaceView viewStyle={_styles.memberImgWrap}>
												<Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.memberImgStyle} />
											</SpaceView>

											{index == 0 && (
												<SpaceView viewStyle={{position: 'absolute', top: 0, left: 0}}>
													<Image source={ICON.respectIcon} style={styles.iconSquareSize(18)} />
												</SpaceView>
											)}
										</SpaceView>
										<SpaceView pl={10} viewStyle={{flex: 1}}>
											<SpaceView>
												<MemberMark 
                          sizeType={'S'} 
                          respectGrade={'DIAMOND'} 
                          bestFaceName={'웃는게 너무'}
                          highAuthYn={'Y'}
                          variousAuthYn={'Y'} />
											</SpaceView>
											<SpaceView mt={5}>
												<Text style={styles.fontStyle('B', 16, '#fff')}>{memberBase?.nickname}</Text>
											</SpaceView>
										</SpaceView>
									</SpaceView>
								</>
							)
						})}
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
	itemWrap: {

	},
	memberImgWrap: {
		borderWidth: 1,
		borderColor: '#fff',
		borderRadius: 100,
		overflow: 'hidden',
		padding: 3,
	},
	memberImgStyle: {
		width: 60,
		height: 60,
		borderRadius: 100,
		overflow: 'hidden',
	},

});
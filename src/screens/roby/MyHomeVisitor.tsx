import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import React, { memo, useEffect, useState } from 'react';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import * as properties from 'utils/properties';
import { get_myhome_visit_list } from 'api/models';
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

	const [isLoading, setIsLoading] = React.useState(false);
	const isFocus = useIsFocused();

	const memberBase = useUserInfo(); // 회원 기본정보

	const mbrProfileImgList = useProfileImg();

	// 클릭 여부
	const [isClickable, setIsClickable] = useState(true);

	const [visitList, setVisitList] = useState([]);

	// ############################################################  메시지 목록 조회
	const getVisitList = async () => {
		setIsLoading(true);

		const body = {};
		try {
			const { success, data } = await get_myhome_visit_list(body);
		  	if(success) {
					switch (data?.result_code) {
			  		case SUCCESS:
							setVisitList(data?.visit_list);
						break;
			  		default:
							show({ content: '오류입니다. 관리자에게 문의해주세요.' });
						break;
					}
		   
		  	} else {
					show({ content: '오류입니다. 관리자에게 문의해주세요.' });
		  	}
		} catch (error) {
		  console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	// ############################################################################# 최초 실행
	React.useEffect(() => {
		if(isFocus) {
			getVisitList();
		}
	}, [isFocus]);

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				<CommonHeader title="마이홈 방문자" />
        
        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView>
						{visitList.map((item, index) => {

							return (
								<>
									<SpaceView mb={20} viewStyle={[layoutStyle.rowStart, _styles.itemWrap]}>
										<SpaceView>
											<SpaceView viewStyle={_styles.memberImgWrap}>
												<Image source={findSourcePath(item?.mst_img_path)} style={_styles.memberImgStyle} />

												{(item?.respect_grade != 'PLATINUM' && item?.respect_grade != 'DIAMOND') && (
													<BlurView 
														style={_styles.visitBlurWrap}
														blurType='light'
														blurAmount={Platform.OS == 'ios' ? 3 : 7}
													/>
												)}
											</SpaceView>

											{(item?.respect_grade == 'PLATINUM' || item?.respect_grade == 'DIAMOND') && (
												<SpaceView viewStyle={{position: 'absolute', top: 0, left: 0}}>
													<Image source={ICON.respectIcon} style={styles.iconSquareSize(18)} />
												</SpaceView>
											)}
										</SpaceView>
										<SpaceView pl={10} viewStyle={{flex: 1}}>
											<SpaceView>
												<MemberMark 
                          sizeType={'S'} 
                          respectGrade={item?.respect_grade} 
                          bestFaceName={item?.best_face_name}
                          highAuthYn={item?.high_auth_yn}
                          variousAuthYn={item?.various_auth_yn} />
											</SpaceView>
											<SpaceView mt={5}>
												<Text style={styles.fontStyle('B', 16, '#fff')}>{item?.nickname}</Text>
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
		borderRadius: 60,
		overflow: 'hidden',
		width: 68,
		height: 68,
		justifyContent: 'center',
    alignItems: 'center',
	},
	memberImgStyle: {
		width: 60,
		height: 60,
		borderRadius: 100,
		overflow: 'hidden',
	},
	visitBlurWrap: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		width: '100%',
		height: '100%',
		zIndex: 2,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
},

});
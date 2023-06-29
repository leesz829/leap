import { styles } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { EventRow } from 'component/EventRow';
import * as React from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, BottomParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { SUCCESS } from 'constants/reusltcode';
import { get_member_message_list } from 'api/models';
import { usePopup } from 'Context';
import TopNavigation from 'component/TopNavigation';
import { CommonText } from 'component/CommonText';
import { ICON } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import SpaceView from 'component/SpaceView';
import { CommonBtn } from 'component/CommonBtn';
import { STACK } from 'constants/routes';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';


/* ################################################################################################################
###################################################################################################################
###### 우편함 메시지
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
	navigation: StackNavigationProp<BottomParamList, 'Message'>;
	route: RouteProp<BottomParamList, 'Message'>;
}

export const Message = (props: Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const dispatch = useDispatch();

	const [messageList, setMessageList] = React.useState<any>([]);
	const [activeIndex, setActiveIndex] = React.useState(-1);

	const isFocus = useIsFocused();
	const { show } = usePopup();  // 공통 팝업

	const toggleAccordion = (index) => {
		setActiveIndex(activeIndex === index ? -1 : index);
	};

	// ############################################################  메시지 목록 조회
	const getMessageList = async () => {
		try {
		  const { success, data } = await get_member_message_list();
		  if(success) {
			switch (data.result_code) {
			  case SUCCESS:
				setMessageList(data.message_list);
				dispatch(myProfile());
				break;
			  default:
				show({
				  content: '오류입니다. 관리자에게 문의해주세요.' ,
				  confirmCallback: function() {}
				});
				break;
			}
		   
		  } else {
			show({
			  content: '오류입니다. 관리자에게 문의해주세요.' ,
			  confirmCallback: function() {}
			});
		  }
		} catch (error) {
		  console.log(error);
		} finally {
		  
		}
	};

	// ############################################# 바로가기 이동 함수
	const goLink = async (type:any) => {
		if(type == 'MSG_TP_10' || type == 'MSG_TP_14') {
			navigation.navigate(STACK.TAB, { screen: 'Roby' });
		} else if(type == 'MSG_TP_04' || type == 'MSG_TP_05') {
			navigation.navigate(STACK.COMMON, { screen: 'SecondAuth' });
		} else if(type == 'MSG_TP_02' || type == 'MSG_TP_03' || type == 'MSG_TP_06' || type == 'MSG_TP_07') {
			navigation.navigate(STACK.COMMON, { screen: 'Profile1' });
		} else if(type == 'MSG_TP_08' || type == 'MSG_TP_09') {
			navigation.navigate(STACK.COMMON, {
				screen: 'Storage',
				params: {
				  headerType: 'common',
				  pageIndex: 0,
				},
			});
		}
	};


	// ############################################################################# 최초 실행
	React.useEffect(() => {
		if(isFocus) {
			getMessageList();
		}
	}, [isFocus]);

	return (
		<>
			<TopNavigation currentPath={''} />
			<ScrollView contentContainerStyle={styles.scrollContainer} style={{backgroundColor: '#fff'}}>
				{messageList.map(
					({
						msg_send_seq,
						msg_type_name,
						title,
						contents,
						template_type,
						reg_dt,
						msg_type,
					}: {
						msg_send_seq: any;
						msg_type_name: string;
						title: string;
						contents: string;
						template_type: string;
						reg_dt: string;
						msg_type: string;
					}) => (

						<View key={msg_send_seq} style={{marginBottom: 10}}>
							<View style={_styles.rowContainer}>
								<TouchableOpacity
									style={_styles.inner}
									onPress={() => { 
										toggleAccordion(msg_send_seq);
									}}
									activeOpacity={0.3} >
									
									<View style={[_styles.titleContainer, activeIndex === msg_send_seq && _styles.active]}>
										<CommonText textStyle={_styles.titleText} fontWeight={'500'} type={'h5'}>{title}</CommonText>
									</View>

									<View style={[_styles.iconContainer, activeIndex === msg_send_seq && _styles.activeIcon]}>
										<Image source={ICON.arrBottom} style={_styles.iconStyle} />
									</View>
								</TouchableOpacity>
							</View>

							{activeIndex === msg_send_seq && (
								<View style={_styles.descContainer}>
									<View style={_styles.descText}>
										<CommonText type={'h5'}>{contents}</CommonText>

										<View style={_styles.dateArea}>
											<CommonText textStyle={_styles.dateText} type={'h5'}>{reg_dt}</CommonText>
										</View>
									</View>

									{(
										msg_type == 'MSG_TP_02' || msg_type == 'MSG_TP_03' || msg_type == 'MSG_TP_04' || msg_type == 'MSG_TP_05' 
										|| msg_type == 'MSG_TP_06' || msg_type == 'MSG_TP_07' || msg_type == 'MSG_TP_08' || msg_type == 'MSG_TP_09'
										|| msg_type == 'MSG_TP_10' || msg_type == 'MSG_TP_14'
									) &&
										<SpaceView mt={10}>
											<CommonBtn 
												value={'바로가기'} 
												type={'gray2'}
												width={'100%'}
												height={35}
												fontSize={13}
												borderRadius={5}
												onPress={() => {
													goLink(msg_type);
												}} />
										</SpaceView>
									}
								</View>
							)}
						</View>

					),
				)}
			</ScrollView>
		</>
	);
};


const _styles = StyleSheet.create({
	iconContainer: {
		position: 'absolute',
		top: '45%',
		right: 20,
		transform: [{ rotate: '360deg' }],
	},
	activeIcon: {
	  	transform: [{ rotate: '180deg' }],
	},
	inner: {
	  	width: '100%',
	},
	labelContainer: {
	  	marginBottom: 12,
	},
	rowContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	iconStyle: {
		width: 18,
		height: 10,
	},
	titleContainer: {
		borderWidth: 1,
		borderColor: Color.grayEBE,
		borderRadius: 15,
		paddingHorizontal: 15,
		paddingVertical: 15,
	},
	titleText: {
		paddingRight: 35,
	},
	active: {
		borderBottomWidth: 0,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	descContainer: {
		//padding: 16,
		paddingHorizontal: 10,
		paddingBottom: 20,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: Color.grayEBE,
		borderBottomLeftRadius: 15,
		borderBottomRightRadius: 15,
	},
	descText: {
		backgroundColor: Color.grayF8F8,
		paddingHorizontal: 15,
		paddingVertical: 20,
	},
	dateArea: {
		marginTop: 20,
	},
	dateText: {
		textAlign: 'right',
	},
  });
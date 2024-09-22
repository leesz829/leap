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
import { ROUTES, STACK } from 'constants/routes';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';
import { CommonLoading } from 'component/CommonLoading';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';


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

	const [isLoading, setIsLoading] = React.useState(false);

	const [messageList, setMessageList] = React.useState<any>([]);
	const [activeIndex, setActiveIndex] = React.useState(-1);

	const isFocus = useIsFocused();
	const { show } = usePopup();  // 공통 팝업

  	const memberBase = useUserInfo();

	const toggleAccordion = (index) => {
		setActiveIndex(activeIndex === index ? -1 : index);
	};

	// ############################################################  메시지 목록 조회
	const getMessageList = async () => {
		setIsLoading(true);

		try {
			const { success, data } = await get_member_message_list();
		  	if(success) {
				switch (data.result_code) {
			  		case SUCCESS:
						setMessageList(data.message_list);
						dispatch(myProfile());
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

	// ############################################# 바로가기 이동 함수
	const goLink = async (item:any) => {
		const type = item.msg_type;
		const link_end_yn = item.link_end_yn;

		if(link_end_yn == 'Y') {
			show({ content: '보관함 보관 기간이 만료 되었습니다.' });
		} else {
			if(type == 'MSG_TP_14') {
				navigation.navigate(STACK.COMMON, { screen: ROUTES.SHOP_INVENTORY });
			} else if(type == 'MSG_TP_16') {
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
					  pageIndex: 'RES',
					},
				});
			} else if(type == 'MSG_TP_10') {
				navigation.navigate(STACK.COMMON, {
					screen: 'Storage',
					params: {
					  headerType: 'common',
					  loadPage: 'LIVE',
					},
				});
			} else if(type == 'MSG_TP_28') {
				navigation.navigate(STACK.COMMON, {
					screen: 'Storage',
					params: {
					  headerType: 'common',
					  loadPage: 'MATCH',
					},
				});
			} else if(type == 'MSG_TP_30' || type == 'MSG_TP_31' || type == 'MSG_TP_32' || type == 'MSG_TP_33') {
				navigation.navigate(STACK.COMMON, {
					screen: 'StoryDetail',
					params: {
						storyBoardSeq: item.story_board_seq,
					}
				});
			}
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
			{isLoading && <CommonLoading />}

			<SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="알림" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView>
						<Text style={styles.fontStyle('EB', 20, '#fff')}>{memberBase?.nickname}님에게{'\n'}전달해드리는 소식</Text>
					</SpaceView>

					<SpaceView mt={30} mb={150}>
						{messageList.map((item : any, index) => (
							<SpaceView mb={20} key={item.msg_send_seq}>
								<SpaceView viewStyle={_styles.rowContainer(activeIndex === item.msg_send_seq)}>
									<TouchableOpacity
										style={_styles.inner}
										onPress={() => { toggleAccordion(item.msg_send_seq); }}
										activeOpacity={0.3}>
					
										<View style={[_styles.titleContainer, activeIndex === item.msg_send_seq && _styles.active]}>
											<Text style={styles.fontStyle('SB', 13, '#fff')}>{item.title}</Text>
										</View>

										<View>
											<Image source={ICON.dropDown} style={styles.iconSquareSize(24)} />
										</View>
									</TouchableOpacity>
								</SpaceView>

								{activeIndex === item.msg_send_seq && (
									<SpaceView viewStyle={_styles.descContainer}>
										<SpaceView mt={10} mb={20}>
											<Text style={styles.fontStyle('R', 12, '#fff')}>{item.contents}</Text>
											{/* <View style={_styles.dateArea}>
												<CommonText fontWeight={'300'} color={'#E1DFD1'} textStyle={_styles.dateText}>{item.reg_dt}</CommonText>
											</View> */}
										</SpaceView>

										{(
											item.msg_type == 'MSG_TP_02' || item.msg_type == 'MSG_TP_03' || item.msg_type == 'MSG_TP_04' || item.msg_type == 'MSG_TP_05' 
											|| item.msg_type == 'MSG_TP_06' || item.msg_type == 'MSG_TP_07' || item.msg_type == 'MSG_TP_08' || item.msg_type == 'MSG_TP_09'
											|| item.msg_type == 'MSG_TP_10' || item.msg_type == 'MSG_TP_14' || item.msg_type == 'MSG_TP_16' || item.msg_type == 'MSG_TP_28'
											|| item.msg_type == 'MSG_TP_30' || item.msg_type == 'MSG_TP_31' || item.msg_type == 'MSG_TP_32' || item.msg_type == 'MSG_TP_33'
										) &&
											<SpaceView mt={10}>
												<TouchableOpacity 
													disabled={item.link_end_yn == 'Y' ? true : false} 
													style={_styles.btnWrap(item.link_end_yn != 'Y')}
													onPress={() => { goLink(item); }}>
													<Text style={styles.fontStyle('SB', 14, item.link_end_yn == 'Y' ? '#fff' : '#44B6E5')}>{item.link_end_yn == 'Y' ? '기간만료' : '바로가기'}</Text>
												</TouchableOpacity>
											</SpaceView>
										}
									</SpaceView>
								)}
							</SpaceView>
						))}
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
	inner: {
	  width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 13,
	},
	rowContainer: (isOn: boolean) => {
		return {
			flexDirection: 'row',
			justifyContent: 'space-between',
			backgroundColor: '#000000',
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			borderBottomLeftRadius: isOn ? 0 : 20,
			borderBottomRightRadius: isOn ? 0 : 20,
		};
	},
	titleContainer: {
		overflow: 'hidden',
		paddingVertical: 15,
	},
	active: {
		borderBottomWidth: 0,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	descContainer: {
		paddingHorizontal: 13,
		paddingBottom: 10,
		backgroundColor: 'rgba(52,52,52,0.5)',
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	btnWrap: (isOn: boolean) => {
		return {
			backgroundColor: isOn ? '#FFFF5D' : '#808080',
			borderRadius: 25,
			alignItems: 'center',
			paddingVertical: 10,
		};
	},


});
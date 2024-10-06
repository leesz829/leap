import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import React, { memo, useEffect, useState } from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as properties from 'utils/properties';
import * as hooksMember from 'hooks/member';
import { insert_member_inquiry } from 'api/models';
import { usePopup } from 'Context';
import { SUCCESS } from 'constants/reusltcode';
import { STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { useUserInfo } from 'hooks/useUserInfo';
import { Shadow } from 'react-native-shadow-2';




/* ################################################################################################################
###################################################################################################################
###### 고객문의 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const CustomerInquiry = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const { show } = usePopup(); // 공통 팝업

	const memberBase = useUserInfo(); // 회원 기본정보

	const [title,    setTitle]    = React.useState('');
	const [contents, setContents] = React.useState('');
	
	const jwtToken  = hooksMember.getJwtToken();   // 토큰
	const memberSeq = hooksMember.getMemberSeq(); // 회원번호

	// 클릭 여부
	const [isClickable, setIsClickable] = useState(true);

	const [comfirmModalVisible, setComfirmModalVisible] = useState(false);
	
	// ################### 팝업 관련 #####################
	const [customerInquiryCompletePopup, setCustomerInquiryCompletePopup] = React.useState(false); // 문의 완료 팝업

	 // 문의 저장
	const insertCustomerInquiry = async () => {

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);

			try {
				if(contents.length == 0) {
					show({ content: '내용을 입력해 주세요.' });
					return;
				}

				let genderStr = memberBase?.gender == 'M' ? '남' : '여';
				let titleValue = memberBase?.nickname + '(' + memberBase?.age + '/' + genderStr + ')' + ' / ' + memberBase?.respect_grade + ' / ' + memberBase?.auth_acct_cnt;
		
				const body = {
					//title: title,
					title:titleValue,
					contents: contents
				};

				const { success, data } = await insert_member_inquiry(body);
				if(success) {
					switch (data.result_code) {
						case SUCCESS:
							show({
								title: '문의 완료',
								content: '문의하신 내용이 접수되었습니다.\n문의 내용은 관리자 확인 후 우편함으로\n답변드릴 예정입니다.' ,
								confirmCallback: function() {
									navigation.navigate(STACK.TAB, {
										screen: 'Roby',
									});
								}
							});
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
				setIsClickable(true);
			}

		}
	};

	

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="1:1 문의" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView mb={30}>
						<Text style={styles.fontStyle('EB', 20, '#fff')}>궁금한 점, 불편한 점{'\n'}저희에게 문의하세요 : )</Text>
					</SpaceView>

					<Shadow
						style={_styles.shadow}
						distance={3}
						offset={[0, 0]}
						startColor='#8D8D8D'
					>
						<SpaceView viewStyle={_styles.contentWrap}>

							<TextInput
								style={[styles.fontStyle('B', 12, '#FFFFFF'), {height:190, width: 200}]}
								value={contents}
								onChangeText={(contents) => setContents(contents)}
								placeholder={'여기에 내용을 입력하기. '}
								placeholderTextColor={'#FFFFFF'}
								maxLength={500}
								autoCapitalize={'none'}
								textAlignVertical={'top'}
								multiline={true}
								caretHidden={true}
								// exceedCharCountColor={'#990606'}
							/>

						</SpaceView>
					</Shadow>

					<SpaceView mt={45}>
						<TouchableOpacity 
							style={_styles.btnWrap}
							onPress={() => {
								insertCustomerInquiry();
							}}>
							<Text style={styles.fontStyle('B', 14, '#fff')}>문의 전송</Text>
						</TouchableOpacity>
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
	contentWrap: {
		borderRadius: 14,
		paddingHorizontal: 10,
		paddingVertical: 5,
		width: '95%',
	},
	btnWrap: {
		backgroundColor: '#46F66F',
		borderRadius: 25,
		alignItems: 'center',
		paddingVertical: 10,
	},
	shadow: {
		width: '100%',
		borderRadius: 25,
		alignItems: 'center',
	},


});
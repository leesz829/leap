import { styles, layoutStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { useState } from 'react';
import * as React from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import SpaceView from 'component/SpaceView';
import { CommonText } from 'component/CommonText';
import { ICON } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { get_board_list, board_detail_view } from 'api/models';
import { usePopup } from 'Context';
import { CommonLoading } from 'component/CommonLoading';
import { CommonBtn } from 'component/CommonBtn';
import { STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';


/* ################################################################################################################
###################################################################################################################
###### 최근 소식
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'BoardDetail'>;
	route: RouteProp<StackParamList, 'BoardDetail'>;
}

const { width, height } = Dimensions.get('window');

export const BoardDetail = (props: Props) => {
  const boardData = props?.route?.params;
	const navigation = useNavigation<ScreenNavigationProp>();

	const [isLoading, setIsLoading] = useState(false);
	const isFocus = useIsFocused();

	// ############################################# 바로가기 이동 함수
	const goLink = async (type:any) => {
		if(type == 'EVENT') {
			navigation.navigate(STACK.COMMON, { 
				screen: 'EventDetail',
				params: {
					index: 0
				}
			});
		};
	};
	// ######################################################################################## 초기 실행 함수
	React.useEffect(() => {
		if(isFocus) {
			
		};
	  }, [isFocus]);

	return (
		<>
			{isLoading && <CommonLoading />}

			<CommonHeader title={'새소식 상세'} />
			
			<LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={{paddingHorizontal: 20, minHeight: height}}
			>		
				<ScrollView style={{marginTop: 40, marginBottom: 70}}>
          <View style={{flexDirection:'row'}}>
            {boardData?.board_type == 'EVENT' &&
              <Text style={_styles.iconType('#AFF20E')}>이벤트</Text>
            }
            {(boardData?.board_type == 'RECENT_NEWS' && boardData?.board_sub_type == 'NOTICE') &&
              <Text style={_styles.iconType('#00FFDC')}>공지사항</Text>
            }
            {(boardData?.board_type == 'RECENT_NEWS' && boardData?.board_sub_type == 'GUIDE') &&
              <Text style={_styles.iconType('#FFDD00')}>가이드</Text>
            }
          </View>

          {boardData?.board_seq && (
            <View>
              <SpaceView mt={10} viewStyle={_styles.descArea}>
                <CommonText textStyle={{fontSize: 16}} type={'h5'} color={'#D5CD9E'}>{boardData?.title}</CommonText>
              </SpaceView>
              <CommonText textStyle={_styles.dateText} type={'h6'} color={'#445561'}>{boardData?.reg_dt}</CommonText>
              <CommonText textStyle={{fontSize: 16}} type={'h5'} color={'#D5CD9E'}>{boardData?.content}</CommonText>
                
              {boardData?.board_type == 'EVENT' &&
                <SpaceView mt={20}>
                  <CommonBtn 
                    value={'바로가기'} 
                    type={'reNewGoBack'}
                    width={'100%'}
                    height={35}
                    fontSize={13}
                    borderRadius={5}
                    onPress={() => {
                      goLink('EVENT');
                  }} />
                </SpaceView>
              }
            </View>
          )}

				</ScrollView>
			</LinearGradient>
		</>
	);
};



const _styles = StyleSheet.create({
  descArea: {
    borderBottomColor: '#E1DFD1',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
	dateText: {
		textAlign: 'right',
		marginTop: 5,
	},
  iconType: (color:string) => {
		return {
			width: 50,
			fontFamily: 'Pretendard-Medium',
			fontSize: 10,
			color: '#3D4348',
			backgroundColor: color,
			textAlign: 'center',
			borderRadius: Platform.OS == 'android' ? 10 : 7,
			marginRight: 5,
			overflow: 'hidden',
			paddingVertical: 2,
		};
	},
});
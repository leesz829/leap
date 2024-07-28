import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native';
import * as React from 'react';
import { StackParamList, ScreenNavigationProp } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, CommonActions, useIsFocused } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useUserInfo } from 'hooks/useUserInfo';
import { update_setting, set_member_phone_book } from 'api/models';
import { usePopup } from 'Context';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { isEmptyData } from 'utils/functions';
import { ICON } from 'utils/imageUtils';
import Contacts from 'react-native-contacts';
import { CommonLoading } from 'component/CommonLoading';


/* ################################################################################################################
###################################################################################################################
###### 리프 설정
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'AlarmSetting'>;
  route: RouteProp<StackParamList, 'AlarmSetting'>;
}

const { width, height } = Dimensions.get('window');

export const AlarmSetting = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch();
  const isFocus = useIsFocused();

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const { show } = usePopup(); // 공통 팝업
  const memberBase = useUserInfo(); // 회원 기본정보

  const [allSelected, setAllSelected] = React.useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(memberBase?.match_yn == 'Y' ? true : false); // 프로필 공개 여부
  const [isFriendMatch, setIsFriendMatch] = React.useState(memberBase?.friend_match_yn == 'Y' ? true : false); // 아는사람 소개 여부
  const [isPushAlarm, setIsPushAlarm] = React.useState(memberBase?.push_alarm_yn == 'Y' ? true : false); // 푸시알림 받기 여부



  // ####################################################################################################### 아는 사람 소개
  const insertMemberPhoneBook = async (phone_book_arr: string, friend_match_flag:string) => {

    const body = {
      phone_book_list: phone_book_arr,
      friend_match_yn : friend_match_flag
    };

    try {
      const { success, data } = await set_member_phone_book(body);
    
      if (success) {
        console.log('data :::::: ', data);
        if (data.result_code != '0000') {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        } else {
          setIsFriendMatch(isFriendMatch ? false : true);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsClickable(true);
      setIsLoading(false);
      show({
        type: 'RESPONSIVE',
        content: isFriendMatch ? '소개 제외 대상이 업데이트 되었습니다.' : '소개 제외 대상과 상호 미노출을 해제하였습니다.',
      });
    }
  };

  // ####################################################################################################### 회원 정보 수정
  const updateMemberInfo = async (type: string, value: string) => {
    let body = {};
    /*
     * MATCH : 내 프로필 공개
     * FRIEND : 아는 사람 제외
     * PUSH : 푸시 알림 받기
     */

    // MATCH : 내 프로필 공개, PUSH : 푸시 알림 받기
    if (type == 'MATCH' || type == 'PUSH') {
      if(isClickable) {
        setIsClickable(false);
        setIsLoading(true);

        try {
          if(type == 'MATCH') {
            body = { match_yn: value, };
          } else if(type == 'PUSH') {
            body = { push_alarm_yn: value, };
          }
    
          const { success, data } = await update_setting(body);
          if (success) {
            dispatch(setPartialPrincipal({
              mbr_base : data.mbr_base
            }));
          }

        } catch {

        } finally {
          setIsClickable(true);
          setIsLoading(false);
        }
      }
    }

    // FRIEND : 아는 사람 제외
    else {
      if(isClickable) {
        let tmp_phone_book_arr: string[] = [];

        if (await grantedCheck()) {
          setIsClickable(false);
          setIsLoading(true);

          Contacts.getAll().then(contacts => {
            contacts.forEach(contact => {
              if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                console.log(contact.phoneNumbers[0].number); // 첫 번째 전화번호 가져오기
                tmp_phone_book_arr.push(contact.phoneNumbers[0].number);
              }
            });

            
            insertMemberPhoneBook(tmp_phone_book_arr.toString(), value);
          }).catch(error => {
            // 연락처 가져오기 실패
            console.log(error);
            setIsFriendMatch(true);
            insertMemberPhoneBook("", "Y");

            setIsClickable(true);
            setIsLoading(false);

          }).finally(item => {
          });
        } else {
          setIsFriendMatch(true);
          show({ title: '아는 사람 제외', content: '기기에서 연락처 접근이 거부된 상태입니다. \n기기의 앱 설정에서 연락처 접근 가능한 상태로 변경해주세요.'});
          insertMemberPhoneBook("", "Y");
        }
      }
    }
  };

  // ####################################################################################################### 권한 체크
  const grantedCheck = async () => {
    let grantedFlag = false;

    try {
      // IOS 위치 정보 수집 권한 요청
      if (Platform.OS === 'ios') {
        grantedFlag = true;
      }
      // AOS 위치 정보 수집 권한 요청
      else if (Platform.OS === 'android') {
        // Check if permission is granted
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          grantedFlag = true;
        }else{
          grantedFlag = false;
        }
      }

      return grantedFlag;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  const onSet = async (type:string, isOn:boolean) => {

    if(type == 'MATCH') {
      setIsProfileOpen(isOn);

    } else if(type == 'FRIEND') {
      setIsFriendMatch(isOn);

    } else if(type == 'PUSH') {
      setIsPushAlarm(isOn);
    }

    updateMemberInfo(type, isOn ? 'Y' : 'N');
  };



  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="리프 설정" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
          <SpaceView>

            {/* 내 프로필 공개 */}
            <SpaceView viewStyle={_styles.itemWrap}>
              <SpaceView viewStyle={layoutStyle.rowStart}>
                <Text style={styles.fontStyle('B', 14, '#fff')}>내 프로필 공개</Text>
                <SpaceView ml={10}>
                  <Text style={styles.fontStyle('SB', 10, '#fff')}>콘텐츠 메뉴에 내 프로필 공개하기</Text>
                </SpaceView>
              </SpaceView>
              <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity style={_styles.promptBtn(!isProfileOpen)} onPress={() => ( onSet('MATCH', false) )}>
                  <Image source={ICON.story_promptN} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
                <TouchableOpacity style={[_styles.promptBtn(isProfileOpen), {marginLeft: 10}]} onPress={() => ( onSet('MATCH', true) )}>
                  <Image source={ICON.story_promptY} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>

            {/* 아는 사람 소개 */}
            <SpaceView viewStyle={_styles.itemWrap}>
              <SpaceView viewStyle={layoutStyle.rowStart}>
                <Text style={styles.fontStyle('B', 14, '#fff')}>아는 사람 소개</Text>
                <SpaceView ml={10}>
                  <Text style={styles.fontStyle('SB', 10, '#fff')}>콘텐츠 메뉴에 지인 소개 피하기</Text>
                </SpaceView>
              </SpaceView>
              <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity style={_styles.promptBtn(!isFriendMatch)} onPress={() => ( onSet('FRIEND', false) )}>
                  <Image source={ICON.story_promptN} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
                <TouchableOpacity style={[_styles.promptBtn(isFriendMatch), {marginLeft: 10}]} onPress={() => ( onSet('FRIEND', true))}>
                  <Image source={ICON.story_promptY} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>

            {/* 푸시 알림 받기 */}
            <SpaceView viewStyle={[_styles.itemWrap, {borderBottomWidth: 1, borderBottomColor: '#BCBCBC',}]}>
              <SpaceView viewStyle={layoutStyle.rowStart}>
                <Text style={styles.fontStyle('B', 14, '#fff')}>푸시 알림 받기</Text>
              </SpaceView>
              <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity style={_styles.promptBtn(!isPushAlarm)} onPress={() => ( onSet('PUSH', false) )}>
                  <Image source={ICON.story_promptN} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
                <TouchableOpacity style={[_styles.promptBtn(isPushAlarm), {marginLeft: 10}]} onPress={() => ( onSet('PUSH', true) )}>
                  <Image source={ICON.story_promptY} style={styles.iconSquareSize(16)} />
                </TouchableOpacity>
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
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  itemWrap: {
    borderTopWidth: 1,
    borderTopColor: '#BCBCBC',
    height: 65,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptBtn: (isOn:boolean) => {
    return {
      backgroundColor: isOn ? '#46F66F' : '#808080',
      borderRadius: 50,
      paddingHorizontal: 5,
      paddingVertical: 5,
    }
  },


});
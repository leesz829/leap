import { ColorType, ScreenNavigationProp } from '@types';
import { Color } from 'assets/styles/Color';
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import { get_my_items, use_item, use_pass_item_all } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { usePopup } from 'Context';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ROUTES, STACK } from 'constants/routes';
import { findSourcePath } from 'utils/imageUtils';
import { CommonLoading } from 'component/CommonLoading';
import AsyncStorage from '@react-native-community/async-storage';
import { CommaFormat, formatNowDate, isEmptyData } from 'utils/functions';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { layoutStyle, styles } from 'assets/styles/Styles';

const { width, height } = Dimensions.get('window');

export default function Inventory() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);

  const [tab, setTab] = useState(categories[0]);
  const [data, setData] = useState([]);
  const [isPassHold, setIsPassHold] = useState(false);

  const { show } = usePopup();  // 공통 팝업
  const dispatch = useDispatch();


  // ########################################################################################## 데이터 조회
  const fetchData = async (item:any) => {
    const body = {
      cate_group_code: item.value
    };
    const { data, message } = await get_my_items(body);

    if(data) {
      const connectDate = await AsyncStorage.getItem('INVENTORY_CONNECT_DT') || '20230526000000';
      data?.inventory_list.map((item: any) => {
        item.connect_date = connectDate;
      });

      setData(data?.inventory_list);

      if(isEmptyData(data?.pass_hold_yn)) {
        setIsPassHold(data?.pass_hold_yn == 'Y' ? true : false);
      };

      setIsLoading(false);
    }

    await AsyncStorage.setItem('INVENTORY_CONNECT_DT', formatNowDate());
  }

  // ########################################################################################## 탭 클릭
  const onPressTab = (item:any) => {
    setTab(item);
    fetchData(item);
  };

  // ########################################################################################## 아이템 사용
  const useItem = async (item) => {
    show({
      title: '사용/획득',
      content: item.cate_name + ' 사용/획득 하시겠습니까?' ,
      cancelCallback: function() {
        
      },
      confirmCallback: async function() {
        setIsLoading(true);

        const body = {
          item_category_code: item.item_category_code,
          cate_group_code: item.cate_group_code,
          cate_common_code: item.cate_common_code,
          inventory_seq: item.inventory_seq,
        };

        try {
          const { success, data } = await use_item(body);
          if(success) {
            switch (data.result_code) {
              case SUCCESS:
                if(body.cate_common_code == 'STANDARD'){
                  // 조회된 매칭 노출 회원
                  // "profile_member_seq_list"

                  let memberSeqList = [];
                  data.profile_member_seq_list.map((item, index) => {
                    memberSeqList.push(item.member_seq);
                  });

                  navigation.navigate(STACK.COMMON, {
                    screen: 'ItemMatching',
                    params : {
                      type: 'PROFILE_CARD_ITEM',
                      memberSeqList: memberSeqList,
                    }
                  });
                };

                dispatch(myProfile());
                // navigation.navigate(STACK.TAB, { screen: 'Shop' });
                fetchData(tab);

                if(item.cate_common_code == 'WISH') {
                  show({
                    type: 'RESPONSIVE',
                    content: '찜하기 이용권 사용을 시작하였어요!',
                  });
                }

                break;
              case '3001':
                show({
                  content: '소개해드릴 회원을 찾는 중이에요. 다음에 다시 사용해주세요.' ,
                  confirmCallback: function() {}
                });
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
          console.warn(error);
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // ########################################################################################## 패스 모두 받기
  const usePassItemAll = async () => {
    // 패스 없을시 버튼 막기
    if(!isPassHold) return;

    try {
      setIsLoading(true);

      const { success, data } = await use_pass_item_all();
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            dispatch(myProfile());
            fetchData(tab);

            show({
              type: 'RESPONSIVE',
              content: '패스 아이템을 모두 획득하였습니다.',
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
      console.warn(error);
    } finally {
      setIsLoading(false);
    }
  }

  // ########################################################################################## 포커스 실행 함수
  useFocusEffect(
    React.useCallback(() => {
      async function fetch() {
        onPressTab(categories[0]);
      };
      fetch();
      return async() => {
      };
    }, []),
  );

  function ListHeaderComponent() {
    return (
      <>
        <SpaceView mt={15} mb={60} viewStyle={{width: '100%', alignItems: 'center'}}>
          <View style={_styles.categoriesContainer}>
            {categories?.map((item) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onPressTab(item)}
              >
                <Image source={item.value == tab.value ? item.imgActive : item.imgUnactive} style={_styles.categoryBtn(item.value)} />         
              </TouchableOpacity>
            ))}
          </View>
        </SpaceView>
        <SpaceView mb={15} pt={15} viewStyle={_styles.passAllBtnArea}>
          <TouchableOpacity onPress={() => usePassItemAll()}>
            <Text style={_styles.passAllBtnText(isPassHold)}>큐브 한번에 받기</Text>
          </TouchableOpacity>
        </SpaceView>
        <SpaceView viewStyle={{borderWidth: 1, borderColor: '#D1D1D1'}}></SpaceView>
      </>
    )
  };

  function renderItem({ item, index }) {
    const isNew = (typeof item.connect_date == 'undefined' || item.connect_date == null || item.connect_date < item.reg_dt) ? true : false;

    return (
      <View style={_styles.renderItem}>
        <View style={{ flexDirection: 'row' }}>
          {/* <View style={_styles.thumb}>
            <Image source={findSourcePath(item?.file_path + item?.file_name)} style={{width: '100%', height: '100%'}} resizeMode='cover' />
            {item?.item_qty > 0 && (
              <View style={_styles.qtyArea}>
                <Text style={_styles.qtyText}>{item.item_qty}개 보유</Text>
                <View style={{backgroundColor: '#000000', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.7}} />
              </View>
            )}

            <View style={_styles.qtyArea}>
              {item?.use_yn == 'N' && (
                <>
                  {item?.period > 90000 ? (
                    <Text style={_styles.qtyText('KEEP')}>영구보관</Text>
                  ) : (
                    <Text style={_styles.qtyText(item?.keep_end_type)}>
                      {item?.keep_end_num}
                      {item?.keep_end_type == 'KEEP_DAY' && '일남음'}
                      {item?.keep_end_type == 'KEEP_HOUR' && '시간남음'}
                      {item?.keep_end_type == 'KEEP_MINUTE' && '분남음'}
                    </Text>
                  )}
                </>
              )}
              <View style={{backgroundColor: '#000000', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.7}} />
            </View>

            {isNew &&
              <View style={_styles.iconArea}>
                <Text style={_styles.newText}>NEW</Text>
              </View>
            }
          </View> */}

          <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyBetween, {width: '100%'}]}>
            <SpaceView viewStyle={{width: '72%'}}>
              <Text style={_styles.title}>{item?.cate_name}</Text>
              <Text style={_styles.infoText}>{item?.cate_desc}</Text>
              <SpaceView viewStyle={_styles.cyanDot} />
            </SpaceView>
            <SpaceView viewStyle={_styles.buttonWrapper}>
              <SpaceView viewStyle={_styles.buttonImgArea}>
                <Image source={findSourcePath(item?.file_path + item?.file_name)} style={styles.iconSize32} />
              </SpaceView>
              <TouchableOpacity
                style={_styles.button(item?.use_yn == 'N' && item?.be_in_use_yn == 'N')}
                disabled={item?.use_yn == 'Y' || item?.be_in_use_yn == 'Y'}
                onPress={() => {useItem(item);}} >
                <Text style={_styles.buttonText(item?.use_yn == 'N' && item?.be_in_use_yn == 'N')}>
                  {item?.use_yn == 'N' && item?.be_in_use_yn == 'N' && '획득하기'}
                  {item?.use_yn == 'N' && item?.be_in_use_yn == 'Y' && item?.subscription_end_day + '일 후 열림'}
                  {item?.use_yn == 'Y' && '사용중('+ item?.subscription_end_day +'일남음)'}
                </Text>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>
        </View>
      </View>
    )
  };

  const renderItemEmpty = () => (
    <View style={_styles.noInvenArea}>
      <Text style={_styles.noInvenText}>보관 중인 아이템이 없습니다.</Text>
    </View>
  );
  return (
    <>
      {isLoading && <CommonLoading />}

      <CommonHeader title="선물함" />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >

      <FlatList
        style={_styles.root}
        data={data}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={renderItemEmpty}
        renderItem={renderItem}
      />

      </LinearGradient>
    </>
  );
}





{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
  },
  root: {
    flex: 1,
    marginBottom: 150,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#292F33',
    borderRadius: 20,
    width: '70%',
    paddingHorizontal: 15,
  },
  categoryBtn: (type: string) => {
    return {
      width: type == 'ALL' ? 25 : 40,
      height: type == 'ALL' ? 25 : 40,
      marginTop: type == 'ALL' ? 0 : 5,
    };
  },
  renderItem: {
    width: `100%`,
    paddingVertical: 15,
    borderBottomColor: '#707070',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#D5CD9E',
  },
  infoText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#939393',
    marginTop: 5,
  },
  buttonWrapper: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImgArea: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#32F9E4',
    borderRadius: 50,
    backgroundColor: '#292F33',
    marginBottom: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: (used) => {
    return {
      width: 90,
      height: 29,
      borderRadius: 5,
      backgroundColor: used ? '#FFDD00' : '#f2f2f2',
      flexDirection: `row`,
      alignItems: `center`,
      justifyContent: `center`,
    };
  },
  buttonText: (used) => {
    return {
      fontSize: 11,
      fontFamily: 'Pretendard-SemiBold',
      letterSpacing: 0,
      textAlign: 'left',
      color: used ? '#3D4348' : '#b5b5b5',
    };
  },
  passAllBtnArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  passAllBtnText: (type:boolean) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 11,
      color: type ? '#3D4348' : '#ABA99A',
      textAlign: 'center',
      paddingVertical: 7,
      backgroundColor: type ? '#FFDD00' : '#E1DFD1',
      borderRadius: 5,
      paddingHorizontal: 10,
      overflow: 'hidden',
      marginRight: 20,
    };
  },
  cyanDot: {
    position: 'absolute',
    left: -5,
    top: -8,
    backgroundColor: '#32F9E4',
    width: 8,
    height: 8,
    borderRadius: 50,
  },
  noInvenArea: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInvenText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#445561',
  },
  
  // thumb: {
  //   width: '30%',
  //   height: ((Dimensions.get('window').width - 32) * 8 * 0.3) / 11,
  //   borderRadius: 5,
  //   backgroundColor: '#d1d1d1',
  //   borderWidth: 1,
  //   borderColor: '#e0e0e0',
  // },
  // qtyArea: {
  //   position: 'absolute',
  //   bottom: 4,
  //   right: 4,
  //   borderRadius: 7,
  //   overflow: 'hidden',
  // },
  // qtyText: (type:string) => {
  //   return {
  //     fontFamily: 'AppleSDGothicNeoM00',
  //     fontSize: 12,
  //     textAlign: 'left',
  //     color: type == 'KEEP_MINUTE' ? '#FFC100' : '#FFF',
  //     paddingHorizontal: 6,
  //     paddingVertical: 1,
  //     zIndex: 1,
  //   };
  // },
  // iconArea: {
  //   position: 'absolute',
  //   top: 4,
  //   left: 5,
  // },
  // newText: {
  //   backgroundColor: '#FF7E8C',
  //   fontFamily: 'AppleSDGothicNeoEB00',
  //   fontSize: 11,
  //   color: ColorType.white,
  //   borderRadius: 8,
  //   paddingHorizontal: 6,
  //   paddingVertical: 2,
  //   overflow: 'hidden',
  // },
});

const categories = [
  {
    label: '전체',
    value: 'ALL',
    imgActive: ICON.dotCyan,
    imgUnactive: ICON.dotGray,
  },
  {
    label: '패스',
    value: 'PASS',
    imgActive: ICON.cubeCyan,
    imgUnactive: ICON.polygonGray,
  },
  {
    label: '부스팅',
    value: 'SUBSCRIPTION',
    imgActive: ICON.drinkCyan,
    imgUnactive: ICON.drinkGray,
  },
  {
    label: '뽑기권',
    value: 'PROFILE_DRAWING',
    imgActive: ICON.cardCyan,
    imgUnactive: ICON.cardGray,
  },
];

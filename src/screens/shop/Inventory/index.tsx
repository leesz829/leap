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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommaFormat, formatNowDate, isEmptyData } from 'utils/functions';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { layoutStyle, styles } from 'assets/styles/Styles';
import { ProfileDrawingPopup } from 'screens/commonpopup/ProfileDrawingPopup';
import { ScrollView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

export default function Inventory() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);

  const [tab, setTab] = useState(categories[0]);
  const [data, setData] = useState([]);
  const [isPassHold, setIsPassHold] = useState(false);

  const { show } = usePopup();  // 공통 팝업
  const dispatch = useDispatch();

  // 뽑기권 팝업
  const [isProfileDrawingVisible, setIsProfileDrawingVisible] = React.useState(false);
  // 뽑기권 데이터
  const [profileDrawingData, setProfileDrawingData] = useState([]);

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

        if(item?.cate_common_code == 'MBTI' || item?.cate_common_code == 'IMPRESSION') {
          setIsProfileDrawingVisible(true);
          setProfileDrawingData(item);
          setIsLoading(false);
          return false;
        }

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
        <SpaceView mt={15} viewStyle={_styles.tabWrap}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {categories?.map((item) => (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => onPressTab(item)}
                style={{marginRight: 10, alignItems: 'center'}}
              >
                <Image source={item.value == tab.value ? item.imgActive : item.imgUnactive} style={styles.iconSquareSize(60)} />
                <SpaceView mt={6}><Text style={styles.fontStyle('B', 12, (item.value == tab.value ? '#46F66F' : '#808080'))}>{item.label}</Text></SpaceView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SpaceView>

        <SpaceView pl={10} pr={10}>
          <SpaceView viewStyle={{borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)', width: '100%'}} />
        </SpaceView>

        <SpaceView mb={15} pt={15} pl={10} pr={10} viewStyle={_styles.passAllBtnArea}>
          <TouchableOpacity onPress={() => usePassItemAll()} style={_styles.passAllBtn}>
            {/* <Text style={_styles.passAllBtnText(isPassHold)}>한번에 받기</Text> */}
            <Text style={styles.fontStyle('B', 12, '#fff')}>한번에 받기</Text>
          </TouchableOpacity>
        </SpaceView>
      </>
    )
  };

  function ItemRender({ item, index }) {
    const isNew = (typeof item.connect_date == 'undefined' || item.connect_date == null || item.connect_date < item.reg_dt) ? true : false;

    let itemImg;
    let itemType;
    if(item?.cate_common_code == 'PASS') {
      itemImg = ICON.cubeCyan;
      itemType = 'Cube';
    }else if(item?.cate_common_code == 'ROYAL_PASS') {
      itemImg = ICON.megaCubeCyan;
      itemType = 'MegaCube';
    }else if(item?.cate_group_code == 'SUBSCRIPTION') {
      itemImg = ICON.drinkCyan;
      itemType = 'Subs';
    }else if(item?.cate_group_code == 'PROFILE_DRAWING') {
      itemImg = ICON.cardCyan;
      itemType = 'Prof';
    }

    return (
      <SpaceView mb={10} viewStyle={_styles.itemWrap}>
        
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

          </View> */}

        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyBetween]}>
          <SpaceView viewStyle={{flexDirection: 'row', flex: 2}}>

            {/* 아이템 이미지 */}
            <SpaceView>
              <Image source={ICON.shop_productMega} style={styles.iconSquareSize(45)} />
            </SpaceView>

            {/* 내용 */}
            <SpaceView ml={5} viewStyle={{flex: 0.93}}>
              <SpaceView mb={5} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <SpaceView mr={5} viewStyle={{backgroundColor: '#000000', borderRadius: 3, paddingHorizontal: 5, paddingVertical: 3}}>
                  <Text style={styles.fontStyle('SB', 9, '#fff')}>3일남음</Text>
                </SpaceView>
                <Text style={styles.fontStyle('EB', 12, '#383838')}>{item?.cate_name}</Text>
              </SpaceView>
              <SpaceView>
                <Text numberOfLines={2} style={styles.fontStyle('SB', 10, '#383838')}>{item?.cate_desc}</Text>
              </SpaceView>
            </SpaceView>
          </SpaceView>

          <SpaceView>
            <TouchableOpacity
              //style={_styles.button(item?.use_yn == 'N' && item?.be_in_use_yn == 'N')}
              disabled={item?.use_yn == 'Y' || item?.be_in_use_yn == 'Y'}
              onPress={() => {useItem(item);}} >
              <Image source={ICON.shop_download} style={styles.iconSquareSize(38)} />
              {/* <Text style={_styles.buttonText(item?.use_yn == 'N' && item?.be_in_use_yn == 'N')}>
                {item?.use_yn == 'N' && item?.be_in_use_yn == 'N' && '획득하기'}
                {item?.use_yn == 'N' && item?.be_in_use_yn == 'Y' && item?.subscription_end_day + '일 후 열림'}
                {item?.use_yn == 'Y' && '사용중('+ item?.subscription_end_day +'일남음)'}
              </Text> */}
            </TouchableOpacity>
          </SpaceView>


          {/* <SpaceView viewStyle={{width: '72%'}}>
            <Text style={_styles.title}>{item?.cate_name}</Text>
            <Text style={_styles.infoText}>{item?.cate_desc}</Text>
            {isNew &&
              <SpaceView viewStyle={_styles.cyanDot} />
            }
          </SpaceView> */}
          {/* <SpaceView viewStyle={_styles.buttonWrapper}>
            <SpaceView viewStyle={_styles.buttonImgArea}>
              <Image source={itemImg} style={itemType == 'Cube' ? _styles.cubeListImg : _styles.itemListImg} />
            </SpaceView>
          </SpaceView> */}
        </SpaceView>
      </SpaceView>
    )
  };

  const renderItemEmpty = () => (
    <View style={_styles.noInvenArea}>
      <Image source={ICON.shop_inventoryNoimg} style={styles.iconNoSquareSize(250, 167)} />
      <Text style={styles.fontStyle('EB', 20, '#fff')}>보관 중인 아이템이 없습니다.</Text>
    </View>
  );

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView mt={40}>
          <CommonHeader title="아이템" />
        </SpaceView>

        <ListHeaderComponent />

        <FlatList
          style={_styles.root}
          data={data}
          //ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderItemEmpty}
          renderItem={ItemRender}
        />

        <ProfileDrawingPopup
          popupVisible={isProfileDrawingVisible}
          setPopupVIsible={setIsProfileDrawingVisible}
          item={profileDrawingData}
        />
      </SpaceView>
    </>
  );
}





{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    backgroundColor: '#130C1D',
  },
  root: {
    flex: 1,
    marginBottom: 50,
  },
  itemWrap: {
    marginHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  passAllBtnArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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



  tabWrap: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
    marginHorizontal: 10,
  },
  passAllBtn: {
    backgroundColor: '#44B6E5',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

});

const categories = [
  {
    label: '전체',
    value: 'ALL',
    imgActive: ICON.shop_tabAllOn,
    imgUnactive: ICON.shop_tabAllOff,
  },
  {
    label: '큐브',
    value: 'PASS',
    imgActive: ICON.shop_tabCubeOn,
    imgUnactive: ICON.shop_tabCubeOff,
  },
  {
    label: '메가큐브',
    value: 'MEGACUBE',
    imgActive: ICON.shop_tabMegaOn,
    imgUnactive: ICON.shop_tabMegaOff,
  },
  {
    label: '프로필카드',
    value: 'PROFILE_DRAWING',
    imgActive: ICON.shop_tabCardOn,
    imgUnactive: ICON.shop_tabCardOff,
  },
  {
    label: '부스트',
    value: 'BOOST',
    imgActive: ICON.shop_tabBoostOn,
    imgUnactive: ICON.shop_tabBoostOff,
  },
  {
    label: '패키지상품',
    value: 'PACKAGE',
    imgActive: ICON.shop_tabPackageOn,
    imgUnactive: ICON.shop_tabPackageOff,
  },
];

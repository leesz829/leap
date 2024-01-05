import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Image, ScrollView, View, Platform, Alert, FlatList, TouchableOpacity, Dimensions, StyleSheet, Text } from 'react-native';
import Modal from 'react-native-modal';
import TopNavigation from 'component/TopNavigation';
import { findSourcePath, ICON } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import { ColorType, MemberBaseData, ScreenNavigationProp } from '@types';
import { initConnection, getProducts, requestPurchase, getAvailablePurchases } from 'react-native-iap';
import { get_banner_list, purchase_product, update_additional, get_shop_main, get_bm_product, get_cashback_detail_info, cashback_item_receive } from 'api/models';
import { useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Color } from 'assets/styles/Color';
import { Slider } from '@miblanchard/react-native-slider';
import RecommandProduct from './Component/RecommandProduct';
import CategoryShop from './Component/CategoryShop';
import { ROUTES, STACK } from 'constants/routes';
import BannerPannel from './Component/BannerPannel';
import { CommonLoading } from 'component/CommonLoading';
import AsyncStorage from '@react-native-community/async-storage';
import { useDispatch } from 'react-redux';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import Carousel from 'react-native-snap-carousel';
import useInterval from 'utils/useInterval';
import { isEmptyData, formatNowDate, CommaFormat } from 'utils/functions';
import { layoutStyle, styles } from 'assets/styles/Styles';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSpring, withSequence, withDelay, Easing, withRepeat, interpolate, Value, multiply, useDerivedValue, Extrapolate, cancelAnimation } from 'react-native-reanimated';
import InventoryButton from 'component/shop/InventoryButton';
import ProductModal from './Component/ProductModal';
import LinearGradient from 'react-native-linear-gradient';




interface Products {
  products: Product[];
}
interface Product {
  oneTimePurchaseOfferDetails: {
    priceAmountMicros: string;
    formattedPrice: string;
    priceCurrencyCode: string;
  };
  name: string;
  productType: string;
  description: string;
  title: string;
  productId: string;
}

const { width, height } = Dimensions.get('window');

export const Shop = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const { show } = usePopup(); // 공통 팝업
  const [isVisible, setIsVisible] = useState(false);

  const [productModalVisible, setProductModalVisible] = useState(false); // 상품 모달 VIsible
  const [targetItem, setTargetItem] = useState(null); // 타겟 아이템
  const [selectedCategoryData, setSelectedCategoryData] = useState(categoryList[0]); // 선택된 카테고리
  const [productList, setProductList] = useState<Products>([]); // 상품 목록

  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState([]);
  const [payInfo, setPayInfo] = useState({});

  const [newItemCnt, setNewItemCnt] = useState(0);
  const [tmplList, setTmplList] = useState(TMPL_LIST);
  
  // 회원 기본 데이터
  const memberBase = useUserInfo();

  const loadingFunc = (isStatus: boolean) => {
    setIsLoading(isStatus);
  };

  // 팝업 목록
  let popupList = [];
  let isPopup = true;

  // ############################################################################# 배너 목록 조회
  const getShopMain = async (isPopupShow:boolean) => {

    const { success, data } = await get_shop_main({ banner_type: 'PROD' });

    if (success) {

      // 프로모션 팝업 노출
      if(isPopupShow) {

        // 24.01.03 임시 주석
        /* if(data.popup_bas_list?.length > 0 && isEmptyData(data.popup_bas_list[0]?.popup_detail) && data.popup_bas_list[0]?.popup_detail.length > 0) {
          let endDt = await AsyncStorage.getItem('POPUP_ENDDT_PROMOTION');
          let nowDt = formatNowDate().substring(0, 8);

          if(null == endDt || endDt < nowDt) {
            show({
              type: 'PROMOTION',
              prodList: data.popup_bas_list[0]?.popup_detail,
              confirmCallback: async function(isNextChk) {
                if(isNextChk) {
                  // 팝업 종료 일시 Storage 저장
                  await AsyncStorage.setItem('POPUP_ENDDT_PROMOTION', nowDt);
                  isPopup = false;
                }
              },
              etcCallback: async function(item) {
                openProductModal(item);
              },
            });
          };
        };   */
      };

      // 이벤트 팝업 노출
      /* if(data.popup_list?.length > 0) {
        popupList = data.popup_list;

        // 튜토리얼 팝업 닫혀있는 경우 호출
        if(isPopupShow) {
          popupShow();
        }
      }; */

      setBanner(data?.banner_list);
      setNewItemCnt(data?.mbr_base?.new_item_cnt);

      if(typeof data?.pay_info != 'undefined') {
        let payInfoData = data?.pay_info?.result;
        let lettmpltName = payInfoData?.tmplt_name;
        let mbrPrice = payInfoData?.member_buy_price;
        let trgtPrice = payInfoData?.target_buy_price;
        let level = payInfoData?.tmplt_level;
        let itemName = payInfoData?.item_name;
        let eventTmpltSeq = payInfoData?.event_tmplt_seq;
        let receiveFlag = payInfoData?.receive_flag;

        let percent = (mbrPrice*100) / trgtPrice;
        if(percent > 0) {
          percent = percent / 100;
        }

        setPayInfo({
          member_buy_price: mbrPrice
          , target_buy_price: trgtPrice
          , price_persent: percent
          , tmplt_name: lettmpltName.replace(/(\s*)/g, "")
          , tmplt_level: level
          , item_name: itemName
          , event_tmplt_seq: eventTmpltSeq
          , receive_flag: receiveFlag
        });
      }

      // 회원 기본 데이터 저장
      dispatch(setPartialPrincipal({
        mbr_base : data?.mbr_base
      }));
    }
  };

  // ############################################################################# 회원 튜토리얼 노출 정보 저장
  const saveMemberTutorialInfo = async () => {
    const body = {
      tutorial_shop_yn: 'N'
    };
    const { success, data } = await update_additional(body);
    if(success) {
      if(isEmptyData(data.mbr_base)) {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  // ############################################################ 팝업 활성화
  const popupShow = async () => {
    if(popupList.length > 0 && isPopup) {
      let type = popupList[0].type;  // 팝업 유형
      let nowDt = formatNowDate().substring(0, 8);
      let endDt = await AsyncStorage.getItem('POPUP_ENDDT_' + type);

      if(null == endDt || endDt < nowDt) {
        show({
          type: 'EVENT',
          eventType: 'EVENT',
          eventPopupList: popupList,
          confirmCallback: async function(isNextChk) {
            if(isNextChk) {
              // 팝업 종료 일시 Storage 저장
              await AsyncStorage.setItem('POPUP_ENDDT_' + type, nowDt);
              isPopup = false;
            }
          },
          etcCallback: async function(pop_bas_seq, sub_img_path, index) {
            navigation.navigate(STACK.COMMON, { 
              screen: 'EventDetail',
              params: {
                index: index,
                view_type: 'BM_SHOP',
              }
            });
          },
        });
      }
    }
  };

  // ######################################################### 카테고리 선택
  const onPressCategory = async(category:any) => {
    setSelectedCategoryData(category);
    loadingFunc(true);

    const body = { item_type_code: category.value };
    const { success, data } = await get_bm_product(body);
    
    if (success) {
      let _products = data?.item_list;

      const connectDate = await AsyncStorage.getItem('SHOP_CONNECT_DT');

      _products.map((item: any) => {
        item.connect_date = connectDate;
      });

      let _tmpProducts = [];

      if(category.value == 'PASS') {
        let _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 4000
        , "item_name": "큐브 80", "item_code": "prod_cube_common_80", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 7500
        , "item_name": "큐브 150", "item_code": "prod_cube_common_150", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 14000
        , "item_name": "큐브 300", "item_code": "prod_cube_common_300", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 26000
        , "item_name": "큐브 600", "item_code": "prod_cube_common_600", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 59000
        , "item_name": "큐브 1500", "item_code": "prod_cube_common_1500", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 105000
        , "item_name": "큐브 3000", "item_code": "prod_cube_common_3000", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 179000
        , "item_name": "큐브 6000", "item_code": "prod_cube_common_6000", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 10000
        , "item_name": "메가 큐브 10", "item_code": "prod_cube_mega_10", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 19000
        , "item_name": "메가 큐브 20", "item_code": "prod_cube_mega_20", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 45000
        , "item_name": "메가 큐브 50", "item_code": "prod_cube_mega_50", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 79000
        , "item_name": "메가 큐브 100", "item_code": "prod_cube_mega_100", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 149000
        , "item_name": "메가 큐브 200", "item_code": "prod_cube_mega_200", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 249000
        , "item_name": "메가 큐브 400", "item_code": "prod_cube_mega_400", "item_contents": "이성에게 좋아요를 보낼 때 사용합니다."};
        _tmpProducts.push(_tmpProduct);

      } else if(category.value == 'SUBSCRIPTION') {

        let _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "SUBSCRIPTION", "money_type_code": "INAPP", "shop_buy_price": 5900
        , "item_name": "찜하기 이용권(30일)", "item_code": "prod_boost_marking_30", "item_contents": "부스팅 기간 동안 이성의 프로필을 보관함에 30일 동안 보관할 수 있습니다.(부스팅 만료 후 효과는 사라집니다.)"};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "SUBSCRIPTION", "money_type_code": "INAPP", "shop_buy_price": 14000
        , "item_name": "찜하기 이용권(90일)", "item_code": "prod_boost_marking_90", "item_contents": "부스팅 기간 동안 이성의 프로필을 보관함에 30일 동안 보관할 수 있습니다.(부스팅 만료 후 효과는 사라집니다.)"};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "SUBSCRIPTION", "money_type_code": "INAPP", "shop_buy_price": 19000
        , "item_name": "관심 보내기 자유이용권(3일)", "item_code": "prod_boost_likefree_3", "item_contents": "구독 기간 동안 큐브를 사용하지 않고 이성에게 관심을 보낼 수 있습니다."};
        _tmpProducts.push(_tmpProduct);

      } else if(category.value == 'PACKAGE') {
        
        let _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PACKAGE", "money_type_code": "INAPP", "shop_buy_price": 27000
        , "item_name": "스타터 패키지 ", "item_code": "prod_pack_starter00", "item_contents": "관심 보내기 자유이용권(1일) + 큐브 200. (월1회 구매 가능한 상품이며 '관심 보내기 자유이용권'의 효과는 부스팅 만료 후 사라집니다.)"};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PACKAGE", "money_type_code": "INAPP", "shop_buy_price": 19000
        , "item_name": "일반 큐브 패키지", "item_code": "prod_pack_cube_00", "item_contents": "100큐브 + 10메가 큐브를 더 효율적인 가격으로 획득하는 상품(월1회 구매 가능)"};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PACKAGE", "money_type_code": "INAPP", "shop_buy_price": 39000
        , "item_name": "고급 큐브 패키지", "item_code": "prod_pack_cube_01", "item_contents": "250큐브 + 25메가 큐브를 더 효율적인 가격으로 획득하는 상품(월1회 구매 가능)"};
        _tmpProducts.push(_tmpProduct);
        _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PACKAGE", "money_type_code": "INAPP", "shop_buy_price": 79000
        , "item_name": "특급 큐브 패키지", "item_code": "prod_pack_cube_02", "item_contents": "600큐브 + 60메가 큐브를 더 효율적인 가격으로 획득하는 상품(월1회 구매 가능)"};
        _tmpProducts.push(_tmpProduct);
      }

      setProductList(_tmpProducts);
      //setProductList(_products);

      loadingFunc(false);
    } else {
      loadingFunc(false);
    }
  };

  // ######################################################### 상품상세 팝업 열기
  const openProductModal = (item) => {
    // show({ content: '준비중입니다.' });

    setTargetItem(item);
    setProductModalVisible(true);
  };

  // ######################################################### 상품상세 팝업 닫기
  const closeProductModal = (isPayConfirm: boolean) => {
    setProductModalVisible(false);

    if(isPayConfirm) {
      onPressCategory(selectedCategoryData);
      getShopMain(false);
    }
  };

  // ######################################################### 리밋샵 이동
  const onPressLimitShop = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_Shop });
  };

  // ######################################################### 캐쉬백 정보 조회
  const getCashBackPayInfo = async (type:string) => {
    const { success, data } = await get_cashback_detail_info();

    if (success) {
      type == 'FOCUS' ? setIsVisible(false) : setIsVisible(true);
      let lettmpltName = payInfo?.tmplt_name;
      let mbrPrice = payInfo?.member_buy_price;
      let trgtPrice = payInfo?.target_buy_price;
      let level = payInfo?.tmplt_level;
      let itemName = payInfo?.item_name;
      let eventTmpltSeq = payInfo?.event_tmplt_seq;
      let receiveFlag = payInfo?.receive_flag;

      let percent = (mbrPrice*100) / trgtPrice;
      if(percent > 0) {
        percent = percent / 100; 
      }

      setTmplList(data.tmpl_list);
    }
  };

  // ######################################################### 캐쉬백 보상 받기
  const onPressGetReward = async (event_tmplt_seq: string, item_name: string) => {
    setIsLoading(true);

    const body = {
      event_tmplt_seq: event_tmplt_seq
    };
    try {
      const { success, data } = await cashback_item_receive(body);

      if(success) {
        switch (data.result_code) {
          case '0000':
            setIsLoading(false);

            show({
              title: '보상획득',
              content: '리프 포인트' + item_name + '등급 보상을 획득하셨습니다.',
              confirmCallback: function() {
                getShopMain();
              }
            });

            break;
          default:
            /* show({
              content: '오류입니다. 관리자에게 문의해주세요.' ,
              confirmCallback: function() {}
            }); */
            break;
        }
      } else {
        setIsLoading(false);
        /* show({
          content: '오류입니다. 관리자에게 문의해주세요.' ,
          confirmCallback: function() {}
        }); */
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }    
  };

  // ############################################################################# 초기 실행 실행
  useFocusEffect(
    React.useCallback(() => {
      async function fetch() {
        onPressCategory(categoryList[0]);
        await AsyncStorage.setItem('SHOP_CONNECT_DT', formatNowDate());
      };
      fetch();

      return async() => {
      };
    }, []),
  );

  useEffect(() => {
    if(isFocus) {
      let isPopupShow = true;

      // 튜토리얼 팝업 노출
      /* if(!isEmptyData(memberBase?.tutorial_shop_yn) || memberBase?.tutorial_shop_yn == 'Y') {
        isPopupShow = false;

        show({
          type: 'GUIDE',
          guideType: 'SHOP_BASIC',
          guideSlideYn: 'Y',
          guideNexBtnExpoYn: 'Y',
          confirmCallback: function(isNextChk) {
            if(isNextChk) {
              saveMemberTutorialInfo();
            }
            popupShow();
          }
        });
      }; */
      
      getCashBackPayInfo('FOCUS');
      getShopMain(isPopupShow); 
    }
  }, [isFocus]);
console.log('payINfo:::', payInfo);
  return (
    <>
      <TopNavigation currentPath={''} />

      {isLoading && <CommonLoading />}

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >
        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, {backgroundColor: '#3D4348', width: width, zIndex: 1,}]}>
          <SpaceView ml={10} viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.cubeCyan} style={styles.iconSquareSize(30)} />
              <Text style={_styles.myCubeDesc}>{CommaFormat(memberBase?.pass_has_amt)}</Text>
            </SpaceView>
            <SpaceView ml={15} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.megaCubeCyan} style={styles.iconSquareSize(33)} />
              <Text style={_styles.myCubeDesc}>{CommaFormat(memberBase?.royal_pass_has_amt)}</Text>
            </SpaceView>
          </SpaceView>

          <TouchableOpacity
            style={_styles.inventoryBtn}
            onPress={() => (navigation.navigate(STACK.COMMON, { screen: ROUTES.SHOP_INVENTORY }))}
          >
            <Image source={ICON.menuCyan} style={styles.iconSquareSize(20)} />
            <Text style={_styles.inventoryText}>보유 아이템</Text>

            {newItemCnt > 0 && (
              <SpaceView viewStyle={_styles.newInvenArea}>
                <View style={_styles.newInvenTriangle} />
                <SpaceView viewStyle={_styles.newInvenTextArea}>
                  <Text style={_styles.newInvenText}>새 아이템 도착!</Text>
                </SpaceView>
              </SpaceView>
            )}

          </TouchableOpacity>
        </SpaceView>

        {memberBase?.gender == 'M' && (
          <SpaceView viewStyle={_styles.shadowContainer}>
            <SpaceView mt={30} mb={30} viewStyle={[layoutStyle.row, layoutStyle.alignEnd, {paddingHorizontal: 15}]}>
              {(payInfo?.target_buy_price - payInfo?.member_buy_price == 0) && payInfo?.receive_flag == 'N' ? 
                <TouchableOpacity onPress={() => {onPressGetReward(payInfo?.event_tmplt_seq, payInfo?.tmplt_name);}}>
                  <Image source={ICON.circleReward} style={styles.iconSquareSize(70)} />
                </TouchableOpacity>
              :
                <Image source={
                    payInfo?.receive_flag == 'N' ?
                      payInfo?.tmplt_name == 'E' ? ICON.circleUnrank
                      : payInfo?.tmplt_name == 'D' ? ICON.circleE
                      : payInfo?.tmplt_name == 'C' ? ICON.circleD
                      : payInfo?.tmplt_name == 'B' ? ICON.circleC
                      : payInfo?.tmplt_name == 'A' ? ICON.circleB
                      : payInfo?.tmplt_name == 'S' && ICON.circleA
                    : payInfo?.receive_flag == 'Y' && payInfo?.tmplt_name !== 'S' ? ICON[`circle${payInfo?.tmplt_name}`]
                    : payInfo?.receive_flag == 'Y' && payInfo?.tmplt_name == 'S' && ICON.circleComplete
                } style={styles.iconSquareSize(70)} />
              }
              
              <SpaceView ml={10} mb={5}>
                <Text style={_styles.rewardTitle}>
                  <Text style={{color: '#F1D30E'}}>
                    {payInfo?.receive_flag == 'Y'
                      ? payInfo?.tmplt_name == 'S' ? 'S' : payInfo?.tmplt_name == 'A' ? 'S' : String.fromCharCode(payInfo?.tmplt_name.charCodeAt(0) - 1)
                      : payInfo?.tmplt_name
                    }
                  </Text>
                  {'보상은 '}
                  {isEmptyData(payInfo?.tmplt_level) && isEmptyData(tmplList) &&
                    <Text style={{color: '#32F9E4'}}>
                      {payInfo?.tmplt_name == 'S' && payInfo?.receive_flag == 'Y' ? '이미 보상은 끝'
                        : tmplList[payInfo?.receive_flag == 'Y' ? payInfo?.tmplt_level : payInfo?.tmplt_level - 1].item_name
                      }
                    </Text>
                  }
                  입니다.
                </Text>

                {(payInfo?.target_buy_price - payInfo?.member_buy_price == 0) && payInfo?.receive_flag == 'N' ?
                  <Text style={_styles.rewardDesc}>
                    {payInfo?.tmplt_name}등급 달성! 보상을 받을 수 있습니다.
                  </Text>
                :
                  payInfo?.receive_flag == 'Y' && payInfo?.tmplt_name == 'S' ?
                    <Text style={_styles.rewardDesc}>이미 보상은 끝</Text>
                  :
                    <Text style={_styles.rewardDesc}>
                      {payInfo?.receive_flag == 'N' ? payInfo?.target_buy_price - payInfo?.member_buy_price : payInfo?.target_buy_price}
                      {' 원 더 결제하면 '}
                      {payInfo?.receive_flag == 'Y'
                        ? payInfo?.tmplt_name == 'S' ? 'S' : payInfo?.tmplt_name == 'A' ? 'S' : String.fromCharCode(payInfo?.tmplt_name.charCodeAt(0) - 1)
                        : payInfo?.tmplt_name
                        }
                        등급 달성!
                      </Text> 
                  }
                  </SpaceView>
                <TouchableOpacity
                  style={_styles.rewardBtn}
                  onPress={getCashBackPayInfo}
                >
                  <Text style={_styles.rewardBtnText}>리워드 플랜</Text>
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>
          )}

          {(memberBase?.gender == 'W' || memberBase?.test_member_yn == 'Y') && (
            <LinearGradient
              colors={['#FF7B92', '#FFF7C1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{paddingHorizontal: 15, paddingVertical: 10, marginTop: 10}}
            >
              <Text style={_styles.mileageTitle}>보유 RP</Text>
              <SpaceView viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
                <Text style={_styles.mileageDesc}>{CommaFormat(memberBase?.mileage_point)}</Text>
                {memberBase?.respect_grade == 'VIP' || memberBase?.respect_grade == 'VVIP' ?
                  <TouchableOpacity style={_styles.rpStoreBtn} onPress={onPressLimitShop}>
                    <Image source={ICON.gift} style={styles.iconSquareSize(30)} />
                    <Text style={_styles.rpStoreText}>RP 스토어 입장</Text>
                  </TouchableOpacity>
                :
                  <TouchableOpacity style={_styles.rpStorePreBtn} onPress={onPressLimitShop}>
                    <Text style={_styles.rpStorePreText}>RP 스토어{'\n'}미리보기</Text>
                  </TouchableOpacity>
                }
              </SpaceView>
              <Text style={_styles.rpStoreDesc}>RP 스토어에서 교환 가능한 쓸쓸한 기프티콘 보고 가세요.</Text>
            </LinearGradient>
          )}

        {/* <ScrollView style={{marginBottom: 10}} showsVerticalScrollIndicator={false}> */}

          {/* ############################################### 카테고리별 */}
          <SpaceView mb={200}>
            <CategoryShop 
              loadingFunc={loadingFunc} 
              itemUpdateFunc={getShopMain}
              onPressCategoryFunc={onPressCategory}
              openProductModalFunc={openProductModal}
              categoryList={categoryList}
              productList={productList}
              selectedCategoryData={selectedCategoryData}
            />
          </SpaceView>
        {/* </ScrollView> */}
      </LinearGradient>

      {/* 상품 상세 팝업 */}
      <ProductModal
        isVisible={productModalVisible}
        type={'bm'}
        item={targetItem}
        closeModal={closeProductModal}
      />

      <Modal isVisible={isVisible}>
        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={_styles.container}
        >
          <View style={_styles.titleBox}>
            <Text style={_styles.titleText}>리프 캐시백 보상 플랜</Text>
          </View>
          
          <View>
            <SpaceView viewStyle={_styles.rewardDescArea}>
              <Text style={_styles.rewardAreaText}>인앱상품 구매 시 캐시백 포인트가 충전됩니다.{'\n'}캐시백 보상으로 리프에서도 스마트한 쇼핑 라이프되세요!</Text>
              <Text style={_styles.rewardTip}>TIP.캐시백 포인트는 매월 1일 초기화 됩니다.</Text>
            </SpaceView>
          </View>

          <SpaceView viewStyle={{paddingHorizontal: 15}}>
            {/* {tmplList?.map((item) => (
              <SpaceView key={item?.tmplt_level} mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
                <Image source={ICON[`circle${item.tmplt_name.trim()}`]} style={styles.iconSquareSize(40)} />
                <SpaceView>
                  <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>{item?.target_buy_price}P 충전하면</Text>
                  <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>{item?.item_name}</Text>
                </SpaceView>
              </SpaceView>
            ))} */}

            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleE} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>20000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 2</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleD} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>50000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 4</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleC} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>100000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 9</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleB} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>150000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 12</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleA} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>200000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 15</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mb={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween, layoutStyle.alignCenter]}>
              <Image source={ICON.circleS} style={styles.iconSquareSize(40)} />
              <SpaceView>
                <Text style={{fontFamily: 'Pretendard-Regular', textAlign: 'right',color: '#D5CD9E'}}>300000P 충전하면</Text>
                <Text style={{fontFamily: 'Pretendard-SemiBold', fontSize: 20, color: '#32F9E4', textAlign: 'right'}}>(캐시백 보상)메가큐브 30</Text>
              </SpaceView>
            </SpaceView>



          </SpaceView>

          <View style={_styles.bottomBox}>
            <TouchableOpacity 
              style={[_styles.allButton]} 
              onPress={() => (setIsVisible(false))}>

              <Text style={_styles.allButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>
    </>
  );
};


// 카테고리 목록
const categoryList = [
  {
    label: '추천상품',
    value: 'RECOMMENDER',
    imgActive: ICON.starCyan,
    imgUnactive: ICON.starGray,
    desc: '리프의 추천 Pick!\n가성비 좋은 상품을 만나보세요.',
  },
  {
    label: '패스상품',
    value: 'PASS',
    imgActive: ICON.polygonGreen,
    imgUnactive: ICON.polygonGray,
    desc: '큐브는 리피에서 사용하는 재화입니다.\n쓰임새가 다른 큐브와 메가큐브 2가지로 구분합니다.',
  },
  {
    label: '부스팅상품',
    value: 'SUBSCRIPTION',
    imgActive: ICON.drinkCyan,
    imgUnactive: ICON.drinkGray,
    desc: '매칭에 유리한 효과를 가진\n다양한 아이템이 준비되어 있습니다.',
  },
  {
    label: '패키지상품',
    value: 'PACKAGE',
    imgActive: ICON.cardCyan,
    imgUnactive: ICON.cardGray,
    desc: '꿀맛나는 할인율!\n구매하면 무조건 이득!',
  },
];

// 이벤트 템플릿 목록
const TMPL_LIST = [
  {
    tmplt_level: ''
    , tmplt_name: ''
    , item_name: ''
    , target_buy_price: 0
    , buy_price: 0
    , receive_flag: 'N'
  }
];


{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  wrap: {
    //paddingHorizontal: 15,
    //paddingTop: 20,
    minHeight: height,
  },
  inventoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#445561',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingLeft: 20,
    paddingRight: 10,
  },
  inventoryText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#32F9E4',
    marginLeft: 5,
    textAlign: 'center',
  },
  myCubeDesc: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#32F9E4',
    marginLeft: 2,
  },

  bannerWrapper: {
    backgroundColor: Color.white,
    width: `100%`,
    height: 250,
  },
  mileageTitle: {
    fontFamily: 'Pretendard-Regular',
    color: '#FFF',
  },
  mileageDesc: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 48,
    color: '#FFF',
  },
  rpStoreDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#FFF6BE',
  },
  rpStoreBtn: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpStorePreBtn: {
    backgroundColor: '#5A707F',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpStorePreText: {
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    color: '#D5CD9E',
  },
  rpStoreText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#F1D30E',
    marginLeft: 5,
  },
  rewardTitle: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#D5CD9E',
  },
  rewardDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#ABA99A',
  },
  rewardBtn: {
    backgroundColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  rewardBtnText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
  },

  shadowContainer: {
    backgroundColor: '#3D4348',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  container: {
    width: '100%',
    borderRadius: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#FFDD00',
  },
  rewardDescArea: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  bottomBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginRight: 10,
    marginTop: 20,
  },
  allButton: {
    backgroundColor: '#FFDD00',
    paddingVertical: 2,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  allButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#3D4348',
  },
  rpAmtText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#FFDD00',
    marginBottom: 2,
  },
  rewardAreaText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
  },
  rewardTip: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#ABA99A',
    marginBottom: 15,
  },
  newInvenArea: {
    position: 'absolute',
    left: 16,
    bottom: -20,
  },
  newInvenTextArea: {
    
  },
  newInvenText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    color: '#F1D30E',
    backgroundColor: '#fff',
    borderRadius: 3,
    overflow: 'hidden',
    textAlign: 'center',
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  newInvenTriangle: {
    marginTop: 2,
    marginLeft: 5,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '360deg' }],
  },




});

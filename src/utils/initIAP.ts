import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ActivityIndicator, Dimensions } from 'react-native';
import * as properties from 'utils/properties';
import { findSourcePath } from 'utils/imageUtils';
import {
   initConnection,
   getProducts,
   requestPurchase,
   getAvailablePurchases,
   purchaseUpdatedListener,
   purchaseErrorListener,
   validateReceiptIos,
   clearProductsIOS,
   flushFailedPurchasesCachedAsPendingAndroid,
   finishTransaction,
} from 'react-native-iap';

export async function iapConnection() {

   const inapProduct = Platform.select({
      ios: [
        'prod_cube_common_80'
        , 'prod_cube_common_150'
        , 'prod_cube_common_300'
        , 'prod_cube_common_600'
        , 'prod_cube_common_1500'
        , 'prod_cube_common_3000'
        , 'prod_cube_common_6000'
        , 'prod_cube_mega_10'
        , 'prod_cube_mega_20'
        , 'prod_cube_mega_50'
        , 'prod_cube_mega_100'
        , 'prod_cube_mega_200'
        , 'prod_cube_mega_400'
        , 'prod_boost_marking_30'
        , 'prod_boost_marking_90'
        , 'prod_boost_likefree_3'
        , 'prod_pack_cube_00'
        , 'prod_pack_cube_01'
        , 'prod_pack_cube_02'
        , 'prod_pack_starter00'
      ],
      android: [
        'prod_pass_a001'
        , 'prod_pass_a002'
        , 'prod_pass_a003'
        , 'prod_pass_a004'
        , 'prod_pass_a005'
        , 'prod_pass_a006'
        , 'prod_pass_a101'
        , 'prod_pass_b001'
        , 'prod_pass_b002'
        , 'prod_pass_b003'
        , 'prod_pass_b004'
        , 'prod_pass_b005'
        , 'prod_pass_b006'
        , 'prod_pass_b007'
        , 'prod_pass_b008'
        , 'prod_pass_b009'
        , 'prod_pack_a002'
        , 'prod_pack_a003'
        , 'prod_pack_a004'
        , 'prod_pack_a005'
        , 'prod_pack_a010'
        , 'prod_pack_a011'
        , 'prod_pack_a012'
        , 'prod_pack_a013'
        , 'prod_pack_a014'
        , 'prod_subs_a001'
        , 'prod_subs_a002'
        , 'prod_subs_a003'
        , 'prod_subs_b001'
        , 'prod_subs_b002'
        , 'prod_subs_b003'
        , 'prod_subs_b004'
        , 'prod_subs_b005'
        , 'prod_subs_e001'
        , 'prod_subs_e002'
        , 'prod_subs_e003'
        , 'prod_cube_common_80'
        , 'prod_cube_common_150'
        , 'prod_cube_common_300'
        , 'prod_cube_common_600'
        , 'prod_cube_common_1500'
        , 'prod_cube_common_3000'
        , 'prod_cube_common_6000'
        , 'prod_cube_mega_10'
        , 'prod_cube_mega_20'
        , 'prod_cube_mega_50'
        , 'prod_cube_mega_100'
        , 'prod_cube_mega_200'
        , 'prod_cube_mega_400'
        , 'prod_boost_marking_30'
        , 'prod_boost_marking_90'
        , 'prod_boost_likefree_3'
        , 'prod_pack_cube_00'
        , 'prod_pack_cube_01'
        , 'prod_pack_cube_02'
        , 'prod_pack_starter00'
      ],
   });

   // 연결 초기화
   const isConnected = await initConnection();
   const availablePurchases  = await getAvailablePurchases();
   //await flushFailedPurchasesCachedAsPendingAndroid();

   availablePurchases.forEach((purchase) => {
     finishTransaction({
       purchase: purchase
       , isConsumable: true
       , developerPayloadAndroid: undefined
     });
   });

   if(isConnected) {
     await getProducts({ skus:inapProduct });
   }
};
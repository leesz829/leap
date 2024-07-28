import { createStackNavigator } from '@react-navigation/stack';
import { StackParamList } from '@types';
import { LivePopup } from 'screens/commonpopup/LivePopup';
import { ReportPopup } from 'screens/commonpopup/ReportPopup';
import { NiceAuth } from 'screens/login/niceAuth';
import BottomNavigation from '../TabNavigation';

import { Preference } from 'screens/profile/Preference';
import { Profile } from 'screens/profile/Profile';
import { Profile1 } from 'screens/profile/Profile1';
import { TutorialSetting } from 'screens/profile/TutorialSetting';
import { AlarmSetting } from 'screens/profile/AlarmSetting';
import { CustomerInquiry } from 'screens/profile/CustomerInquiry';
import { ChangePassword } from 'screens/profile/ChangePassword';
import { Approval } from 'screens/signup/Approval';
import { Storage } from 'screens/storage/index';
import { ImagePreview } from 'screens/commonpopup/ImagePreview';

import React from 'react';
import PointReward from 'screens/shop/PointReward';
import Inventory from 'screens/shop/Inventory';
import MileageShop from 'screens/shop/MileageShop';
import MileageHistory from 'screens/shop/MileageHistory';
import LimitInfo from 'screens/shop/LimitInfo';
import AuctionDetail from 'screens/shop/AuctionDetail';
import MileageOrder from 'screens/shop/MileageOrder';
import GifticonDetail from 'screens/shop/GifticonDetail';
import ItemMatching from 'screens/matching/ItemMatching';
import MatchDetail from 'screens/matching/MatchDetail';

import EventDetail from 'screens/event/EventDetail';
import { ProfileImageSetting } from 'screens/profile/ProfileImageSetting';

import { Board } from 'screens/board';
import { BoardDetail } from 'screens/board/BoardDetail';

import StoryRegi from 'screens/story/StoryRegi';
import StoryEdit from 'screens/story/StoryEdit';
import StoryDetail from 'screens/story/StoryDetail';
import StoryActive from 'screens/story/StoryActive';

import { Profile_AddInfo } from 'screens/profile/Profile_AddInfo';
import { Profile_Auth } from 'screens/profile/Profile_Auth';
import { Profile_Interest } from 'screens/profile/Profile_Interest';
import { Profile_Introduce } from 'screens/profile/Profile_Introduce';

import {Terms} from 'screens/policy/Terms';
import {Privacy} from 'screens/policy/Privacy';

import { Chat } from 'screens/chat';
import { ChatDetail } from 'screens/chat/ChatDetail';

import { Contents } from 'screens/contents';

import { Message } from 'screens/message';


const CommonStack = createStackNavigator<StackParamList>();

const CommonNavigation = () => {
  return (
    <CommonStack.Navigator screenOptions={{ headerShown: false }}>
      <CommonStack.Screen name="Main" component={BottomNavigation} />
      <CommonStack.Screen name="ReportPopup" component={ReportPopup} />
      <CommonStack.Screen name="LivePopup" component={LivePopup} />
      <CommonStack.Screen name="Board" component={Board} />
      <CommonStack.Screen name="BoardDetail" component={BoardDetail} />
      <CommonStack.Screen name="Preference" component={Preference} />
      <CommonStack.Screen name="Profile" component={Profile} />
      <CommonStack.Screen name="Profile1" component={Profile1} />
      <CommonStack.Screen name="TutorialSetting" component={TutorialSetting} />
      <CommonStack.Screen name="AlarmSetting" component={AlarmSetting} />
      <CommonStack.Screen name="ChangePassword" component={ChangePassword} />
      <CommonStack.Screen name="CustomerInquiry" component={CustomerInquiry} />
      <CommonStack.Screen name="Approval" component={Approval} />
      <CommonStack.Screen name="NiceAuth" component={NiceAuth} />
      <CommonStack.Screen name="Storage" component={Storage} />
      <CommonStack.Screen name="PointReward" component={PointReward} />
      <CommonStack.Screen name="Inventory" component={Inventory} />
      <CommonStack.Screen name="MileageShop" component={MileageShop} />
      <CommonStack.Screen name="MileageHistory" component={MileageHistory} />
      <CommonStack.Screen name="LimitInfo" component={LimitInfo} />
      <CommonStack.Screen name="AuctionDetail" component={AuctionDetail} />
      <CommonStack.Screen name="MileageOrder" component={MileageOrder} />
      <CommonStack.Screen name="GifticonDetail" component={GifticonDetail} />
      <CommonStack.Screen name="ItemMatching" component={ItemMatching} />
      <CommonStack.Screen name="ImagePreview" component={ImagePreview} />
      <CommonStack.Screen name="MatchDetail" component={MatchDetail} />
      <CommonStack.Screen name="EventDetail" component={EventDetail} />
      <CommonStack.Screen name="ProfileImageSetting" component={ProfileImageSetting} />
      <CommonStack.Screen name="StoryRegi" component={StoryRegi} />
      <CommonStack.Screen name="StoryEdit" component={StoryEdit} />
      <CommonStack.Screen name="StoryDetail" component={StoryDetail} />
      <CommonStack.Screen name="StoryActive" component={StoryActive} />
      <CommonStack.Screen name="Profile_AddInfo" component={Profile_AddInfo} />
      <CommonStack.Screen name="Profile_Auth" component={Profile_Auth} />
      <CommonStack.Screen name="Profile_Interest" component={Profile_Interest} />
      <CommonStack.Screen name="Profile_Introduce" component={Profile_Introduce} />
      <CommonStack.Screen name="Terms" component={Terms} />
      <CommonStack.Screen name="Privacy" component={Privacy} />
      <CommonStack.Screen name="Chat" component={Chat} />
      <CommonStack.Screen name="ChatDetail" component={ChatDetail} />
      <CommonStack.Screen name="Message" component={Message} />
    </CommonStack.Navigator>
  );
};

export default CommonNavigation;

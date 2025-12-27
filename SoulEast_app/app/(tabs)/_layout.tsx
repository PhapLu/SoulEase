import { CustomBottomTab } from '../../components/navigation/CustomBottomTab';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      // Kích hoạt Custom Tab Bar
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        // Ẩn tab bar mặc định để tránh xung đột layout
        tabBarStyle: { 
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            borderTopWidth: 0,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages' }}
      />
      <Tabs.Screen
        name="personal"
        options={{ title: 'Profile' }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Notifications' }}
      />
    </Tabs>
  );
}
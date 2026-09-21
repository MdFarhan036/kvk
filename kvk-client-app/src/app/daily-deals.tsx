import { Stack } from 'expo-router';
import {
    StyleSheet,
    View,
} from 'react-native';

import CustomerPage from '@/components/CustomerPage/CustomerPage';
import { DailyDeals } from '@/components/DailyDeals/DailyDeals';

export default function DailyDealsScreen() {
  return (
    <View style={styles.container}>

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <CustomerPage>
        <DailyDeals />
      </CustomerPage>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F7',
  },
});
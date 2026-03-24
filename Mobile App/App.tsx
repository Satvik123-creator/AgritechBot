import 'react-native-gesture-handler';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AppProviders } from './src/providers/AppProviders';

export default function App() {
  useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

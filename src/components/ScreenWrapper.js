import { ScrollView } from 'react-native';
import { colors } from '../styles';

/**
 * Standard scroll container for all game screens.
 *
 * Props:
 *   centered  {boolean}  adds alignItems: 'center' to content  default: false
 *   children  {node}
 */
export default function ScreenWrapper({ children, centered = false }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        { padding: 16, paddingBottom: 40 },
        centered && { alignItems: 'center' },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

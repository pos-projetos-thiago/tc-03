import { StyleSheet, Text, View } from 'react-native';

// TODO Sprint 4: substituir por <DashboardScreen /> de src/features/dashboard
export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Sprint 4: resumo financeiro será implementado aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

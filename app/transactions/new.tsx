import { StyleSheet, Text, View } from 'react-native';

// TODO Sprint 3: substituir por <TransactionFormScreen mode="create" />
export default function NewTransactionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova transação</Text>
      <Text style={styles.subtitle}>Sprint 3: formulário de criação será implementado aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

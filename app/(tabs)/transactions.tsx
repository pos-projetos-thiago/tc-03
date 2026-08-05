import { StyleSheet, Text, View } from 'react-native';

// TODO Sprint 2: substituir por <TransactionListScreen /> de src/features/transactions
export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transações</Text>
      <Text style={styles.subtitle}>Sprint 2: lista de transações será implementada aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

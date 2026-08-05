import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// TODO Sprint 3: substituir por <TransactionFormScreen mode="edit" id={id} />
export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar transação</Text>
      <Text style={styles.subtitle}>ID: {id}</Text>
      <Text style={styles.subtitle}>Sprint 3: formulário de edição será implementado aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

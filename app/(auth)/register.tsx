import { StyleSheet, Text, View } from 'react-native';

// TODO Sprint 1: substituir por <RegisterForm /> de src/features/auth/components/register-form
export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Sprint 1: cadastro será implementado aqui</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

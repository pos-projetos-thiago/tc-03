import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import {
  attachmentTypeLabel,
  formatAttachmentSize,
  isImage,
  type SelectedAttachment,
} from '../types/selected-attachment';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AttachmentPickerProps {
  /**
   * Arquivo selecionado localmente (ainda não enviado ao Storage).
   * Null quando nenhum arquivo foi selecionado nesta sessão.
   */
  selectedAttachment: SelectedAttachment | null;
  /**
   * URL do anexo já salvo no Storage (modo edição).
   * Exibida como "Anexo existente" quando selectedAttachment é null.
   */
  existingAttachmentUrl: string | null;
  /** Chamado quando um arquivo é selecionado. */
  onSelect: (attachment: SelectedAttachment) => void;
  /** Indica se os controles devem estar desabilitados (ex: durante submit). */
  disabled?: boolean;
  /** Indica se o upload está em progresso. */
  isUploading?: boolean;
  /** Percentual de progresso do upload (0–100). */
  uploadProgress?: number | null;
  /** Mensagem de erro do upload. */
  uploadError?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Componente de seleção e visualização de anexo.
 * Suporta imagens (via galeria), PDF e TXT (via document picker).
 * Reutilizável fora do TransactionForm.
 */
export function AttachmentPicker({
  selectedAttachment,
  existingAttachmentUrl,
  onSelect,
  disabled = false,
  isUploading = false,
  uploadProgress = null,
  uploadError = null,
}: AttachmentPickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const s = makeStyles(colors);

  // -------------------------------------------------------------------------
  // Seleção via galeria (imagens)
  // -------------------------------------------------------------------------

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria nas configurações do dispositivo.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png'
        : ext === 'webp' ? 'image/webp'
          : ext === 'heic' ? 'image/heic'
            : 'image/jpeg';

      onSelect({
        uri,
        name: asset.fileName ?? `imagem.${ext}`,
        mimeType,
        size: asset.fileSize ?? null,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Seleção via document picker (PDF, TXT, imagens)
  // -------------------------------------------------------------------------

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      onSelect({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        size: asset.size ?? null,
      });
    }
  }

  // -------------------------------------------------------------------------
  // Abertura / visualização do anexo existente
  // -------------------------------------------------------------------------

  async function handleOpenExisting() {
    if (!existingAttachmentUrl) return;
    try {
      const supported = await Linking.canOpenURL(existingAttachmentUrl);
      if (supported) {
        await Linking.openURL(existingAttachmentUrl);
      } else {
        Alert.alert('Não foi possível abrir', 'Nenhum aplicativo disponível para abrir este arquivo.');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o anexo.');
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const hasExisting = existingAttachmentUrl !== null && selectedAttachment === null;
  const isInteractionDisabled = disabled || isUploading;

  return (
    <View style={s.container}>

      {/* Anexo já salvo (modo edição, sem nova seleção) */}
      {hasExisting ? (
        <View style={s.existingBadge} accessibilityRole="text">
          <Text style={s.existingIcon}>📎</Text>
          <View style={s.existingTextCol}>
            <Text style={s.existingTitle}>Anexo existente</Text>
            <Text style={s.existingHint}>Selecione um novo arquivo para substituir</Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenExisting}
            disabled={isInteractionDisabled}
            accessibilityRole="button"
            accessibilityLabel="Abrir anexo existente"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.openLink}>Abrir</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Preview do arquivo selecionado localmente */}
      {selectedAttachment ? (
        <View style={s.previewContainer}>
          {isImage(selectedAttachment) ? (
            <Image
              source={{ uri: selectedAttachment.uri }}
              style={s.imagePreview}
              accessibilityLabel="Preview do anexo selecionado"
              resizeMode="cover"
            />
          ) : (
            <View style={s.docIconContainer}>
              <Text style={s.docIcon}>
                {selectedAttachment.mimeType === 'application/pdf' ? '📄' : '📝'}
              </Text>
            </View>
          )}
          <View style={s.fileInfo}>
            <Text style={s.fileName} numberOfLines={1}>{selectedAttachment.name}</Text>
            <Text style={s.fileMeta}>
              {attachmentTypeLabel(selectedAttachment)}
              {selectedAttachment.size !== null
                ? `  ·  ${formatAttachmentSize(selectedAttachment.size)}`
                : ''}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Progresso de upload */}
      {isUploading ? (
        <View
          style={s.progressRow}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: uploadProgress ?? 0, min: 0, max: 100 }}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text style={s.progressText}>
            Enviando anexo… {uploadProgress !== null ? `${uploadProgress}%` : ''}
          </Text>
        </View>
      ) : null}

      {/* Erro de upload */}
      {uploadError ? (
        <Text style={s.errorText} accessibilityRole="alert">{uploadError}</Text>
      ) : null}

      {/* Botões de seleção */}
      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[s.button, s.buttonOutline, isInteractionDisabled && s.buttonDisabled]}
          onPress={handlePickImage}
          disabled={isInteractionDisabled}
          accessibilityRole="button"
          accessibilityLabel="Selecionar imagem da galeria">
          <Text style={[s.buttonText, s.buttonTextOutline]}>
            {selectedAttachment && isImage(selectedAttachment)
              ? 'Trocar imagem'
              : 'Imagem'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.button, s.buttonOutline, isInteractionDisabled && s.buttonDisabled]}
          onPress={handlePickDocument}
          disabled={isInteractionDisabled}
          accessibilityRole="button"
          accessibilityLabel="Selecionar documento PDF ou TXT">
          <Text style={[s.buttonText, s.buttonTextOutline]}>
            {selectedAttachment && !isImage(selectedAttachment)
              ? 'Trocar doc'
              : 'PDF / TXT'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    existingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0fdf4',
      borderWidth: 1,
      borderColor: '#86efac',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    existingIcon: {
      fontSize: 18,
    },
    existingTextCol: {
      flex: 1,
    },
    existingTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#16a34a',
    },
    existingHint: {
      fontSize: 11,
      color: '#4b7c5e',
      marginTop: 1,
    },
    openLink: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.tint,
    },
    previewContainer: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      overflow: 'hidden',
    },
    imagePreview: {
      width: '100%',
      height: 160,
      backgroundColor: '#f3f4f6',
    },
    docIconContainer: {
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
    },
    docIcon: {
      fontSize: 40,
    },
    fileInfo: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
    },
    fileName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    fileMeta: {
      fontSize: 11,
      color: colors.icon,
      marginTop: 2,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    progressText: {
      fontSize: 13,
      color: colors.icon,
    },
    errorText: {
      fontSize: 12,
      color: '#ef4444',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonOutline: {
      borderWidth: 1,
      borderColor: colors.tint,
      backgroundColor: colors.background,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    buttonTextOutline: {
      color: colors.tint,
    },
  });
}

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

interface AttachmentPickerProps {
  selectedAttachment: SelectedAttachment | null;
  existingAttachmentUrl: string | null;
  onSelect: (attachment: SelectedAttachment) => void;
  disabled?: boolean;
  isUploading?: boolean;
  uploadProgress?: number | null;
  uploadError?: string | null;
}

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

  const hasExisting = existingAttachmentUrl !== null && selectedAttachment === null;
  const isInteractionDisabled = disabled || isUploading;

  return (
    <View style={s.container}>
      {hasExisting ? (
        <View style={s.existingBadge} accessibilityRole="text">
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
              <Text style={s.docLabel}>
                {selectedAttachment.mimeType === 'application/pdf' ? 'PDF' : 'TXT'}
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

      {isUploading ? (
        <View
          style={s.progressRow}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: uploadProgress ?? 0, min: 0, max: 100 }}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text style={s.progressText}>
            Enviando… {uploadProgress !== null ? `${uploadProgress}%` : ''}
          </Text>
        </View>
      ) : null}

      {uploadError ? (
        <Text style={s.errorText} accessibilityRole="alert">{uploadError}</Text>
      ) : null}

      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[s.button, isInteractionDisabled && s.buttonDisabled]}
          onPress={handlePickImage}
          disabled={isInteractionDisabled}
          accessibilityRole="button"
          accessibilityLabel="Selecionar imagem da galeria">
          <Text style={s.buttonText}>
            {selectedAttachment && isImage(selectedAttachment) ? 'Trocar imagem' : 'Imagem'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.button, isInteractionDisabled && s.buttonDisabled]}
          onPress={handlePickDocument}
          disabled={isInteractionDisabled}
          accessibilityRole="button"
          accessibilityLabel="Selecionar documento PDF ou TXT">
          <Text style={s.buttonText}>
            {selectedAttachment && !isImage(selectedAttachment) ? 'Trocar doc' : 'PDF / TXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    existingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    existingTextCol: {
      flex: 1,
    },
    existingTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    existingHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    openLink: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tint,
    },
    previewContainer: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    imagePreview: {
      width: '100%',
      height: 160,
      backgroundColor: colors.divider,
    },
    docIconContainer: {
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    docLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    fileInfo: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surface,
    },
    fileName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    fileMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    progressText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    errorText: {
      fontSize: 12,
      color: colors.negative,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.tint,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.tint,
    },
  });
}

import * as ImagePicker from 'expo-image-picker';

export type ChatPhoto = {
  uri: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/heic';
};

export type ChatPhotoSelection =
  | { kind: 'photo'; photo: ChatPhoto }
  | { kind: 'cancelled' | 'permission' | 'invalid' | 'too_large' };

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export async function pickChatPhoto(): Promise<ChatPhotoSelection> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== 'granted') return { kind: 'permission' };

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    allowsMultipleSelection: false,
    mediaTypes: ['images'],
    quality: 1,
  });
  if (result.canceled || !result.assets[0]) return { kind: 'cancelled' };

  const asset = result.assets[0];
  if ((asset.fileSize ?? 0) > MAX_PHOTO_BYTES) return { kind: 'too_large' };

  const name = asset.fileName?.trim() || asset.uri.split('/').pop() || 'chat-photo.jpg';
  const extension = name.split('.').pop()?.toLowerCase();
  const mimeType = asset.mimeType?.toLowerCase() === 'image/png' || extension === 'png'
    ? 'image/png'
    : asset.mimeType?.toLowerCase() === 'image/heic' || asset.mimeType?.toLowerCase() === 'image/heif' || extension === 'heic' || extension === 'heif'
      ? 'image/heic'
      : asset.mimeType?.toLowerCase() === 'image/jpeg' || ['jpg', 'jpeg'].includes(extension ?? '')
        ? 'image/jpeg'
        : null;
  if (!mimeType) return { kind: 'invalid' };

  return { kind: 'photo', photo: { uri: asset.uri, fileName: name, mimeType } };
}

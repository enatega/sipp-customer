import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dulledIcon: {
    opacity: 0.38,
  },
  image: {
    height: 68,
    width: 68,
  },
  imageFallback: {
    alignItems: 'center',
    height: 68,
    justifyContent: 'center',
    width: 68,
  },
  noteField: {
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 15,
  },
  noteInput: {
    flex: 1,
    maxHeight: 112,
    minHeight: 48,
    paddingVertical: 11,
  },
  price: {
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  productDetails: {
    flex: 1,
    minWidth: 0,
  },
  productRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
  },
  quantityButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityControls: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  unavailableBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

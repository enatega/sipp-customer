import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
  },
  compactContainer: {
    width: 260,
  },
  fullWidthContainer: {
    width: '100%',
  },
  resultRowContainer: {
    alignItems: 'stretch',
    flexDirection: 'row',
    minHeight: 132,
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 156,
    overflow: 'hidden',
  },
  compactImageContainer: {
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  resultRowImageContainer: {
    height: 132,
    width: 116,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  content: {
    minHeight: 87,
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 0,
    width: '100%',
  },
  name: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  cuisine: {
    flex: 1,
  },
  location: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 18,
    overflow: 'hidden',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  rating: {
    marginLeft: 4,
  },
  reviewCount: {
    marginRight: 6,
  },
  dot: {
    fontSize: 24,
    marginHorizontal: 6,
  },
  line: {
    height: 1,
  },
  heartButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    zIndex: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 4,
    minWidth: 0,
  },
  infoText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 16,
  },
})

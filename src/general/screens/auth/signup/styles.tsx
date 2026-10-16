import { StyleSheet } from "react-native";

const useStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    centerContent: {
      gap: 18,
      padding: 16,
      paddingBottom: 24,
    },
  });

export default useStyles;

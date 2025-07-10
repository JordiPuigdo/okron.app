import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { commonStyles } from "./commonStyles";

export const theme = {
  colors,
  spacing,
  typography,
  commonStyles,
};

export type AppTheme = typeof theme;

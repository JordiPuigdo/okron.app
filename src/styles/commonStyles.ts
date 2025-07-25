import { StyleSheet } from "react-native";

import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const commonStyles = StyleSheet.create({
  fullScreenCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.m, // spacing.m = 16 (definido en spacing.ts)
    ...typography.body, // Usa la tipografía base
    color: colors.textSecondary,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 8,
    padding: spacing.m,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingBottom: 85,
  },
  formContainer: {
    gap: spacing.m,
    padding: spacing.l,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: spacing.m,
    width: "100%",
    height: 80,
    borderRadius: 6,
    ...typography.body,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.xl,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  minilogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 150,
    height: 150,
  },
  inspectionSection: {
    marginVertical: spacing.s,
    padding: spacing.m,
    backgroundColor: colors.grayBackground,
    borderRadius: 8,
    paddingBottom: 60,
  },
  headerButtonsRow: {
    flexDirection: "row",
    marginBottom: spacing.m,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.m,
    borderRadius: 8,
    alignItems: "center",
  },
  statusButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
  resetButton: {
    padding: spacing.m,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
  },
  inspectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.l,
    marginVertical: spacing.s,
    padding: spacing.m,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemDescription: {
    flex: 1,
    paddingRight: spacing.s,
    ...typography.body,
    fontSize: 20,
  },
  itemActions: {
    flexDirection: "row",
  },
  choiceButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    marginHorizontal: spacing.xs,
  },
  choiceButtonOkActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  choiceButtonNokActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  choiceText: {
    color: colors.primary,
    fontWeight: "bold",
  },
  choiceTextSelected: {
    color: colors.white,
    fontWeight: "bold",
  },
  multiSelectContainer: {
    marginBottom: spacing.l,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: spacing.xs,
    ...typography.body,
  },
  selectInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    padding: spacing.s,
    backgroundColor: colors.inputBackground,
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  placeholderText: {
    color: colors.placeholderText,
    fontSize: 16,
    flex: 1,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    flex: 1,
  },
  chip: {
    flexDirection: "row",
    backgroundColor: colors.chipBackground,
    borderRadius: 20,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    alignItems: "center",
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    color: colors.white,
    fontSize: 14,
    marginRight: spacing.xs,
  },
  dropdown: {
    marginTop: spacing.xs,
    backgroundColor: colors.dropdownBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: spacing.s,
    elevation: 4,
  },
  searchInput: {
    backgroundColor: colors.searchBackground,
    borderRadius: 8,
    padding: spacing.s,
    marginBottom: spacing.s,
    fontSize: 16,
    ...typography.body,
  },
  selectItem: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 6,
    marginBottom: spacing.xs,
    backgroundColor: colors.itemBackground,
  },
  selectItemText: {
    fontSize: 16,
    color: colors.text,
    ...typography.body,
  },
  commentItem: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentOperator: {
    fontWeight: "bold",
  },
  commentDate: {
    fontSize: 12,
    color: "#555",
  },
  commentText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 4,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#59408F",
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tabButton: {
    padding: 10,
  },
  timeTrackerContainer: {
    flex: 1,
  },
  timeTrackerHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: spacing.m,
    backgroundColor: colors.headerBackground,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  actionButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
  },
  startButton: {
    backgroundColor: colors.buttonStart,
  },
  stopButton: {
    backgroundColor: colors.buttonStop,
  },
  manualButton: {
    backgroundColor: colors.buttonManual,
  },

  listContent: {
    padding: spacing.m,
  },
  timeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 24,
    gap: spacing.xl,
  },
  timeColumn: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontWeight: "600",
    ...typography.body,
  },
  value: {
    fontWeight: "400",
    ...typography.body,
  },
  totalTime: {
    marginTop: spacing.s,
    fontWeight: "600",
    fontSize: 16,
    ...typography.body,
  },
  operatorName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: spacing.s,
    ...typography.title,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    ...typography.caption,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    ...typography.body,
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#fff",
    paddingBottom: 45,
  },
  mainContainerWithPadding: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#fff",
    padding: 10,
  },
  container: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#eee",
  },
  containerWithPadding: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#fff",
    padding: 10,
  },
  manualEntryContainer: {
    flexDirection: "column",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
    gap: 10,
  },
  iconLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#999",
  },
  rightContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  state: {
    fontWeight: "bold",
    color: "green",
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stateBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#59408F",
    alignItems: "center",
  },
  leftColumn: {
    flex: 1,
    justifyContent: "center",
  },
  centerColumn: {
    flex: 2,
    paddingHorizontal: 10,
  },
  centerColumnCentered: {
    flex: 2,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rightColumn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 18,
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },
  total: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 10 },

  timeButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff", // opcional para mayor contraste
    elevation: 2, // sombra Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dateText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 10,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#59408F",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#59408F",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  operatorItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
    backgroundColor: "#f2f2f2",
  },
  operatorItemSelected: {
    backgroundColor: "#59408F",
    borderColor: "#59408F",
  },
  operatorText: {
    color: "#333",
  },
  operatorTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1, // Permite que el texto se ajuste
  },
  content: { flex: 1, padding: 4 },
  markAllButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  markAllText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  itemText: { fontSize: 16, flex: 1, paddingRight: 10 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabHeader: {
    flexDirection: "row",
    backgroundColor: "#EEE",
  },
  tabButtonWorkOrder: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#59408F",
  },
  tabText: {
    fontWeight: "bold",
    color: "#333",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  finishButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "bold",
  },
  largeBackButton: {
    marginLeft: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)", // Fondo semitransparente
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  largeBackButtonText: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    padding: 16,
  },
  modalTitle: { fontSize: 18, marginBottom: 12 },
  textArea: {
    borderWidth: 1,
    borderColor: "#c5c5c5",
    borderRadius: 5,
    padding: 10,
    height: 100,
    marginBottom: 12,
  },
  previewRow: { marginVertical: 12 },
  previewBox: { marginRight: 10, marginTop: 10, position: "relative" },
  previewImage: { width: 120, height: 120, borderRadius: 5 },
  removeIcon: {
    position: "absolute",
    top: -0,
    right: -0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    marginHorizontal: 4,
    borderRadius: 5,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  linkText: {
    color: "#007BFF", // o cualquier azul que uses
    textDecorationLine: "underline",
  },
});

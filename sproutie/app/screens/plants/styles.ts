import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f6f8f3",
    },
    headerContainer: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        backgroundColor: "#e8f5e9",
        borderBottomWidth: 1,
        borderBottomColor: "#d0e6d7",
        justifyContent: "flex-start",
    },
    menuContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 16,
        marginHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        padding: 8,
    },
    plantContainer: {
        flex: 1,
        margin: 16,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    footerContainer: {
        height: 60,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#e8f5e9",
        borderTopWidth: 1,
        borderTopColor: "#d0e6d7",
    },
    button: {
        backgroundColor: "#2e7d32",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#cccccc",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    plantItem: {
        backgroundColor: "#f8f9fa",
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#2e7d32",
    },
    plantName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2e7d32",
    },
    plantScientificName: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#666",
    },
    plantFamily: {
        fontSize: 12,
        color: "#888",
        marginTop: 4,
    },
    plantsListContainer: {
        marginTop: 16,
    },
    plantsListTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#2e7d32",
    },
    plantsScrollView: {
        maxHeight: 400,
    },
    buttonContainer: {
        marginVertical: 16,
    },
});

export default styles;
import { Redirect, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {

    function handleLogin() {
        router.replace("/(tab)")
    }

    return (
        <View style={styles.container}>
            <Text>로그인 화면입니다.</Text>
            <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                style={styles.loginButtonBox}
            >
                <Text style={styles.text}>눌러서 로그인하기</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    loginButtonBox: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
        width: "40%",
        height: "5%",
        backgroundColor: "#7acf77",
        borderRadius: 10
    },
    text: {
        fontWeight: "700" 
    }
})
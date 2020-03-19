import { StyleSheet } from 'react-native'


export const style = StyleSheet.create({

    loginContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
    },
    logo: {
        width: 130,
        height: 130,
    },
    logoContainer: {
        alignItems: 'center'
    },
    titleFont: {
        color: '#FFF',
        width: '90%',
        textAlign: 'center',
        fontSize: 60,
        textShadowColor: 'black',
        textShadowOffset: {width: 3, height: 3},
        textShadowRadius: 1,
    },
    input: {
        height: 40,
        backgroundColor: "rgba(255,255,255,0.2)",
        marginBottom: 10,
        color: "#FFF",
        paddingHorizontal: 10,
        borderRadius: 18,
    },
    buttonContainer: {
        backgroundColor: "#004f94",
        paddingVertical: 15,
        marginBottom: 10,
        borderRadius: 18,
    },
    buttonText: {
        fontSize: 16,
        color: "#FFFFFF",
    },
    recoveryHolder: {
        paddingBottom: 10,
        paddingRight: 10,
    },
    recoveryTextHolder: {
        paddingRight: 25,
        paddingLeft: 25,
        paddingBottom: 15
    },
    smallFont: {
        fontSize: 14,
    },
    tinyFont: {
        fontSize: 10,
    },
    floatRight: {
        textAlign: "right"
    },
    centerText: {
        textAlign: "center",
    },
    formContainer: {
        paddingLeft: 40,
        paddingRight: 40,
    },
})
import { StyleSheet } from 'react-native'


export const style = StyleSheet.create({

  mainContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  scrollView: {
    marginVertical: 5,
  },
  largeText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 40,
  },
  mediumText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 35,
  },
  bold: {
    fontWeight: "bold"
  },
  smallText: {
    color: 'white',
    fontSize: 15,
  },
  tinyText: {
    color: 'white',
    fontSize: 11,

  },
  floatRight: {
    alignSelf: 'flex-end'
  },
  buttonContainer: {
    paddingVertical: 15,
    marginBottom: 30,
    borderRadius: 10,
  },
  transitionButton: {
    backgroundColor: "#004f94",
    width :'90%',
  },
  activeButton: {
    backgroundColor: "#004f94",
  },
  inactiveButton: {
    backgroundColor: "grey",
  },
  addButton: {
    minWidth: '45%'
  },
  cancelButton: {
    backgroundColor: "red",
    minWidth: '45%'
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  centerText: {
    textAlign: "center",
  },
  input: {
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 10,
    color: "#FFF",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
})
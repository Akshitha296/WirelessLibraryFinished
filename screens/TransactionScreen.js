import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, Alert, KeyboardAvoidingView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import firebase from 'firebase/app'
import db from '../config'

export default class TransactionScreen extends React.Component{

    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null,
            scanned: false,
            scannedData: '',
            buttonState: 'normal',
            scannedBookId: '',
            scannedStudentId: '',
            transactionMessage: '',
        }
    }

    getCameraPermissions = async(id) =>{

        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions: status === "granted",
            buttonState: id,
            scanned: false,
        })

    }

    handleBarcodeScan = async({type, data}) =>{
        const {buttonState} = this.state.buttonState
        if (buttonState === "Book Id"){
            this.setState({
                scanned: true,
                scannedBookId: data,
                buttonState: 'normal'
            })
        } else if (buttonState === "Student Id"){
            this.setState({
                scanned: true,
                scannedStudentId: data,
                buttonState: 'normal'
            })
        }
    }

    handleTransaction = async() =>{
        var transactionType = await this.checkBookEligibility()
        if ( !transactionType ){
            Alert.alert("The book doesn't exist in the library. Please try again.")
            console.log("The book doesn't exist in the library. Please try again.")
            this.setState({
                scannedBookId: '',
                scannedStudentId: '',
            })
        } else if(transactionType === "Issue"){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue()
            if (isStudentEligible){
                this.initiateBookIssue()
            }
        } else {
            console.log(transactionType)
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
            if (isStudentEligible){
                this.initiateBookReturn()
            }
        }
    }

    checkStudentEligibilityForBookIssue = async() => {
        const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
            isStudentEligible = false
            Alert.alert("Didn't find your student id, please check again.")
            console.log("Didn't find your student id, please check again.")
            this.setState({
                scannedBookId: '',
                scannedStudentId: '',
            })
        } else {
            studentRef.docs.map((doc) => {
                var student = doc.data()
                if(student.booksIssued < 2){
                    isStudentEligible = true
                } else {
                    isStudentEligible = false
                    Alert.alert("Maximum books signed out, try again later.")
                    console.log("Maximum books signed out, try again later.")
                    this.setState({
                        scannedBookId: '',
                        scannedStudentId: '',
                    })
                }
            })
        } return isStudentEligible
    }

    checkStudentEligibilityForBookReturn = async() => {
        const transactionRef = await db.collection("transactions").where("bookId", "==", this.state.scannedBookId).limit(1).get()
        var isStudentEligible = ""
        console.log(transactionRef.docs)
            transactionRef.docs.map((doc) => {
                var lastBookTransaction = doc.data()
                console.log(lastBookTransaction)
                if(lastBookTransaction.studentId == this.state.scannedStudentId){
                    isStudentEligible = true
                    console.log(isStudentEligible)
                } else {
                    isStudentEligible = false
                    console.log(isStudentEligible)
                    Alert.alert("Not issued by this student. Please check the book id again.")
                    console.log("Not issued by this student. Please check the book id again.")
                    this.setState({
                        scannedBookId: '',
                        scannedStudentId: '',
                    })
                }
            }) 
            return isStudentEligible
        }

    checkBookEligibility = async() => {
        const bookRef = await db.collection("books").where("bookId", "==", this.state.scannedBookId).get()
        var transactionType = ""
        if (bookRef.docs.length == 0){
            transactionType = false;
        } else{
            bookRef.docs.map((doc) => { 
                var book = doc.data()
                if (book.bookAvailability){
                    transactionType = "Issue"
                } else {
                    transactionType = "Return"
                }
            })
        }
        return transactionType
    }

    initiateBookIssue = async() => {
        db.collection("transactions").add({
            studentId: this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "Issue"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability: false
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            booksIssued: firebase.firestore.FieldValue.increment(1),
        })
        Alert.alert("Book Issued");
        this.setState({
            scannedStudentId: '',
            scannedBookId: '',
        })
    }

    initiateBookReturn = async() => {
        db.collection("transactions").add({
            studentId: this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            date: firebase.firestore.Timestamp.now().toDate(),
            transactionType: "Return"
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            bookAvailability: true
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            booksIssued: firebase.firestore.FieldValue.increment(-1),
        })
        this.setState({
            scannedStudentId: '',
            scannedBookId: '',
        })
        Alert.alert("Book Returned");
    }
    
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;

        if (buttonState !== 'normal' && hasCameraPermissions){
            return(
                <BarCodeScanner
                    onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScan}
                    style = {StyleSheet.absoluteFillObject}
                />
            )
        } else if(buttonState === 'normal'){
            return(
                <KeyboardAvoidingView  style = {styles.container}>
                    <View>
                        <Image
                            source = {require("../assets/booklogo.jpg")}
                            style = {{width: 200, height: 200}}
                        />
                        <Text style = {{textAlign:'center', fontSize:30}}>
                            WILY
                        </Text>
                    </View>
                    <View style = {styles.inputView}>
                        <TextInput
                            style = {styles.inputBox}
                            placeholder = "Book Id"
                            onChangeText = {text => this.setState({ scannedBookId: text })}
                            value = {this.state.scannedBookId}
                        />

                        <TouchableOpacity style = {styles.scanButton}
                                          onPress = {() =>{this.getCameraPermissions("Book Id")}}>
                            <Text style = {styles.buttonText}>
                                Scan
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style = {styles.inputView}>
                        <TextInput
                            style = {styles.inputBox}
                            placeholder = "Student Id"
                            onChangeText = {text => this.setState({ scannedStudentId: text })}
                            value = {this.state.scannedStudentId}
                        />

                        <TouchableOpacity style = {styles.scanButton}
                                                  onPress = {() =>{this.getCameraPermissions("Student Id")}}>
                            <Text style = {styles.buttonText}>
                                Scan
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style = {styles.submitButton} onPress = {this.handleTransaction}>
                        <Text style = {styles.submitButtonText}> Submit </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent:"center",
        alignItems: "center",
    },
    displayText:{
        fontSize: 15,
        textDecorationLine: "underline",
    },
    buttonText:{
        color: "white",
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },

    inputView:{
        flexDirection: 'row',
        margin: 20
    },

    inputBox:{
        width: 200,
        height: 40,
        borderWidth: 2,
        fontSize: 20,
    },
    scanButton:{
        backgroundColor: '#007fa7',
        width: 60,
        height: 40,
        borderWidth: 2,
    },
    submitButton:{ 
        backgroundColor: '#FBC020', 
        width: 100, height: 50, 
    },
    submitButtonText:{ 
        padding:10, 
        textAlign:'center', 
        fontSize:20, 
        fontWeight:'bold', 
        color:'white'
    },
})
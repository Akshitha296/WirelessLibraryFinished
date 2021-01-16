import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Alert, Image } from 'react-native';
import firebase from 'firebase/app'
import 'firebase/auth'

export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            emailId: '',
            password: '',
        }
    }

    login = async(email, pwd) =>{
        if(email && pwd){
            console.log(email)
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email, pwd)
                console.log(response)
                if (response){
                    console.log(response)
                    this.props.navigation.navigate('TransactionScreen')
                }
            } catch(error){
                switch(error.code){
                    case 'auth/user-not-found':
                        Alert.alert("User Doesn't Exist")
                        console.log("User Doesn't Exist")
                        break
                    case 'auth/invalid-email':
                        Alert.alert("Incorrect Email Id or Password. Try again.")
                        console.log("Incorrect Email Id or Password. Try again.")
                        break
                }
            }
        } else {
            Alert.alert("Enter an email id, or a password")
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems: 'center', marginTop: 60,}}>
              <View>

               <Image
                source = {require("../assets/booklogo.jpg")}
                style = {{width: 200, height: 200}}
               />

               <Text style = {{textAlign: 'center', fontSize: 30,}}>
                    Wily
               </Text>

               </View>

               <View>
                  <TextInput 
                    style = {styles.loginBox} 
                    placeholder = "Login Id here"
                    keyboardType = 'email-address'
                    onChangeText = {(text) => {
                        this.setState({
                            emailId: text,
                        })
                    }}/>
                  <TextInput
                  style = {styles.loginBox} 
                  placeholder = "Password"
                  secureTextEntry = {true}
                  onChangeText = {(text) => {
                      this.setState({
                          password: text,
                      })
                  }}
                  />
                </View>  

                <View>
                    <TouchableOpacity 
                        style = {styles.submitButton}
                        onPress = {() => {
                            this.login(this.state.emailId, this.state.password)
                        }}
                    >
                        <Text style = {{textAlign: 'center',}}>
                            Login
                        </Text>
                    </TouchableOpacity>
                </View>    
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    loginBox: {
        width: 300,
        height: 50,
        borderWidth: 1.5,
        fontSize: 20,
        margin: 10,
        paddingLeft: 20,
    },
    submitButton: {
        height: 40,
        width: 100,
        borderWidth: 1,
        marginTop: 20,
        paddingTop: 5,
        borderRadius: 7,
    },
})
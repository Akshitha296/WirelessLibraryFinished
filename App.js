import React from 'react';
import {Image} from 'react-native'
import SearchScreen from './screens/SearchScreen'
import TransactionScreen from './screens/TransactionScreen'
import LoginScreen from './screens/LoginScreen'

import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'

export default class App extends React.Component{
  render(){
    return(
      <AppContainer/>
    )
  }
}

const TabNavigator = createBottomTabNavigator({
  TransactionScreen: {screen: TransactionScreen},
  SearchScreen: {screen: SearchScreen},
}, 
{
  defaultNavigationOptions: ({navigation}) => ({
    tabBarIcon: ({}) => {
      const routeName = navigation.state.routeName
      console.log(routeName)
      if (routeName === 'TransactionScreen'){
        return(
          <Image
            source = {require('./assets/book.png')}
            style = {{width: 30, height: 30}}
          />
        )
      } else if (routeName === 'SearchScreen'){
          return(
            <Image
              source = {require('./assets/searchingbook.png')}
              style = {{width: 30, height: 30}}
            />
          )
        }
      }
  })
}
)

const switchNavigator = createSwitchNavigator({
  LoginScreen: {screen: LoginScreen},
  TabNavigator: {screen: TabNavigator}
})

const AppContainer = createAppContainer(switchNavigator)
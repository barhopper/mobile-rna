import {Button, Layout, Text} from '@ui-kitten/components'
import React, {useState} from 'react'
import {Dimensions, Image, StyleSheet, View} from 'react-native'
import {signOut} from '../actions/auth'
import {getAbout, getPrivacyPolicy, getTerms} from '../actions/copy'
import {ScreenContainer} from '../components/ScreenContainer'
import {useUpdateUser, useUser} from '../contexts/userContext'
import {CopyModal} from './ProfileScreens/CopyModal'
import {LinkAccountModal} from './ProfileScreens/LinkAccountModal'
import {PasswordChangeModal} from './ProfileScreens/PasswordChangeModal'
import {UpdateImageModal} from './ProfileScreens/UpdateImageModal'

export default function ProfileScreen() {
  const {width} = Dimensions.get('window')

  const [isLoading, setIsLoading] = useState(false)

  const updateUser = useUpdateUser()
  const user = useUser()

  const handleUpdateUser = user => {
    console.log('I am here', user)
    setIsLoading(true)
    updateUser(user)
    setIsLoading(false)
  }

  const isAnonymous = user && user.isAnonymous
  const email = isAnonymous ? null : user?.email

  let profileWidth = width - width * 0.2 // 10 % padding minimum
  profileWidth = profileWidth > 200 ? 200 : profileWidth

  const profileRadius = profileWidth / 2
  const userImg = user?.photoURL || null
  const userImageStyle = {
    width: profileWidth,
    height: profileWidth,
    borderRadius: profileRadius,
    marginBottom: 16,
  }

  const ProfileImage = userImg
    ? props => <Image source={{uri: userImg}} {...props} />
    : props => (
        <Image
          source={require('../assets/images/generic_profile.png')}
          {...props}
        />
      )

  if (isLoading) {
    return null
  }

  return (
    <ScreenContainer style={{backgroundColor: '#fff'}}>
      <Layout style={styles.container}>
        <View style={styles.profileMain}>
          {/* if signed in */}
          <ProfileImage style={userImageStyle} />
          {!isAnonymous && <UpdateImageModal />}

          {isAnonymous ? (
            <LinkAccountModal
              updateProfileUser={handleUpdateUser}
              buttonStyle={{width: width - 30}}
            />
          ) : (
            <Text category="h5" style={styles.profileText}>
              {email}
            </Text>
          )}
        </View>
        <View>
          {/* If signed in */}
          {/* Link to change password */}
          {!isAnonymous && <PasswordChangeModal />}
          {/* update image/name */}

          {/* always */}
          {/* link to about */}
          <CopyModal title="About" fetchFunction={getAbout} />
          {/* link to terms */}
          <CopyModal title="Terms and Conditions" fetchFunction={getTerms} />
          {/* link to privacy policy */}
          <CopyModal title="Privacy Policy" fetchFunction={getPrivacyPolicy} />
          <Button
            appearance="outline"
            onPress={() => signOut(() => updateUser(null))}
          >
            {isAnonymous ? 'Sign In Screen' : 'Log Out'}
          </Button>
        </View>
      </Layout>
    </ScreenContainer>
  )
}

ProfileScreen.navigationOptions = {
  header: null,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  contentContainer: {
    paddingTop: 30,
  },
  profileMain: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileText: {},
})

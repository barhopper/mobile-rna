import React from 'react'
import {StyleSheet, View, Image, Dimensions} from 'react-native'
import {Layout, Text, Button} from '@ui-kitten/components'

import {PasswordChangeModal} from './ProfileScreens/PasswordChangeModal'
// import {UpdateImageModal} from './ProfileScreens/UpdateImageModal'
import {CopyModal} from './ProfileScreens/CopyModal'

import {signOut} from '../actions/auth'
import {getAbout, getPrivacyPolicy, getTerms} from '../actions/copy'
import {useUpdateUser, useUser} from '../contexts/userContext'

export default function ProfileScreen() {
  const {width} = Dimensions.get('window')

  const updateUser = useUpdateUser()
  const token = useUser()

  const isAnonymous = token?.user?.isAnonymous
  const email = isAnonymous ? null : token?.user?.email

  let profileWidth = width - width * 0.2 // 10 % padding minimum
  profileWidth = profileWidth > 200 ? 200 : profileWidth

  const profileRadius = profileWidth / 2
  const userImg = isAnonymous ? null : token?.user?.photoUrl
  const userImageStyle = {
    width: profileWidth,
    height: profileWidth,
    borderRadius: profileRadius,
    marginBottom: 16,
  }

  const ProfileImage = userImg
    ? props => (
        <Image
          source={require('../assets/images/generic_profile.png')}
          {...props}
        />
      )
    : props => (
        <Image
          source={require('../assets/images/generic_profile.png')}
          {...props}
        />
      )

  return (
    <Layout style={styles.container}>
      <View style={styles.profileMain}>
        {/* if signed in */}
        <ProfileImage style={userImageStyle} />
        {/* <UpdateImageModal /> */}

        {isAnonymous ? (
          <Button style={{width: width - 30}}>Create an Account</Button>
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
          Log Out
        </Button>
      </View>
    </Layout>
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

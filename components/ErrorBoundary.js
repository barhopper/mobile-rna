import React, {Component} from 'react'
import {Text, StyleSheet, View, ScrollView} from 'react-native'
import {PropTypes} from 'prop-types'

/**
 * ErrorBoundary will act as a fall back for any errors that occur and are uncaught
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {error: null, errorInfo: null}
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {error: true, errorInfo: error}
  }

  // eslint-disable-next-line no-unused-vars
  componentDidCatch(error, errorInfo) {
    /**
     * If you wanted to hook this to bugsnag or have something else called on an error this is the place to do it
     */
  }

  render() {
    // If we have an error display this default view
    // another thing that could be done instead of a whole view we could do a popup
    if (this.state.errorInfo) {
      return (
        <View style={styles.container}>
          <View style={styles.messageWrapper}>
            <Text style={styles.headerText}>Oh No!</Text>
            <Text style={styles.subText}>
              Something happened we didnt expect.
            </Text>
          </View>
          <ScrollView style={{padding: 20, marginBottom: 80}}>
            <Text> {this.state.error.toString()} </Text>
          </ScrollView>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  headerText: {
    fontSize: 24,
  },
  subText: {
    fontSize: 20,
  },
})

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}

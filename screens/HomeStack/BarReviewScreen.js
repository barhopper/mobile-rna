import {default as React, useState, useLayoutEffect} from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Spinner, List, Input, Button} from '@ui-kitten/components'

import {useQuery} from 'react-query'
import {getQuestions} from '../../actions/bars'

import {default as theme} from '../../constants/Theme'

export default function BarReviewScreen({navigation}) {
  const [formData, setFormData] = useState({})
  const {error, status, data: questions} = useQuery('questions', getQuestions)

  useLayoutEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      navigation.setOptions({title: 'Tell us about your visit'})
    })
  }, [navigation])

  const updateFormState = value => {
    setFormData(value)
  }

  if (status === 'error') {
    throw error
  }

  return (
    <Layout style={styles.container}>
      {status === 'loading' ? (
        <Spinner status="primary" size="giant" />
      ) : (
        <>
          <List
            data={questions}
            renderItem={props => (
              <QuestionInput
                {...props}
                setFormData={updateFormState}
                formState={formData}
              />
            )}
          />
          <Button>Submit Review</Button>
        </>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: theme['color-basic-200'],
  },
})

const QuestionInput = ({item, setFormData, formState = {}}) => {
  // console.log('Item', item)
  if (!item || !setFormData || !formState) {
    return null
  }

  const value = item.id ? formState[item.id] : ''
  const handleChange = value => {
    setFormData(current => ({
      ...current,
      [item.id]: value,
    }))
  }

  return (
    <Input
      label={item.text}
      placeholder={'On a scale of 1-10'}
      size="medium"
      value={value}
      onChangeText={handleChange}
      style={{marginTop: 16}}
    />
  )
}

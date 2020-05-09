import {default as React, useState} from 'react'
import {StyleSheet} from 'react-native'
import {Layout, Text, Spinner, List, Input} from '@ui-kitten/components'

import {useQuery} from 'react-query'
import {getQuestions} from '../../actions/bars'

import {default as theme} from '../../constants/Theme'

export default function BarReviewScreen() {
  const [formData, setFormData] = useState({})
  const {error, status, data: questions} = useQuery('questions', getQuestions)

  const updateFormState = value => {
    setFormData(value)
  }

  if (status === 'error') {
    throw error
  }

  return (
    <Layout style={styles.container}>
      <Text>Tell us about your visit</Text>
      {status === 'loading' ? (
        <Spinner status="primary" size="giant" />
      ) : (
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
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: theme['color-basic-200'],
    paddingVertical: 0,
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
      placeholder={item.text}
      size="medium"
      value={value}
      onChangeText={handleChange}
    />
  )
}

import {default as React, useState, useLayoutEffect} from 'react'
import {StyleSheet} from 'react-native'
import {
  Layout,
  Spinner,
  List,
  Select,
  SelectItem,
  Button,
} from '@ui-kitten/components'

import {useQuery} from 'react-query'
import {getQuestions, submitReview} from '../../actions/bars'

import {default as theme} from '../../constants/Theme'

const outOf10 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

export default function BarReviewScreen({navigation, route}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState([])
  const {error, status, data: questions} = useQuery('questions', getQuestions)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useLayoutEffect(() => {
    navigation.addListener('focus', () => {
      // do something
      navigation.setOptions({title: 'Tell us about your visit'})
    })
  }, [navigation])

  const updateFormState = value => {
    setFormData(value)
  }

  const handleAddReview = () => {
    let sQuestions = JSON.parse(JSON.stringify(questions))
    let hasErrors = false

    for (let q of sQuestions) {
      q.response = formData[q.id]?.row + 1

      if (isNaN(q.response)) {
        setErrors(current => {
          if (current.includes(q.id)) {
            return current
          } else {
            return current.concat(q.id)
          }
        })

        hasErrors = true
      }
    }

    if (hasErrors) {
      return
    }

    const submission = {
      barId: route.params.barId,
      questions: sQuestions,
    }

    setIsSubmitting(true)
    submitReview({...submission})
      // eslint-disable-next-line no-unused-vars
      .then(bar => {
        navigation.pop()
        // TODO: Hook this as an update into reactQuery
      })
      .catch(err => {
        console.log(err)
      })
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
                errors={errors}
                setErrors={setErrors}
              />
            )}
          />
          <Button onPress={!isSubmitting && handleAddReview}>
            {isSubmitting ? (
              <Spinner status="basic" size="small" />
            ) : (
              'Submit Review'
            )}
          </Button>
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

const QuestionInput = ({
  item,
  setFormData,
  formState = {},
  errors = [],
  setErrors,
}) => {
  if (!item || !setFormData || !formState) {
    return null
  }

  const value = item.id ? formState[item.id] : ''
  const handleChange = value => {
    if (errors.includes(item.id)) {
      setErrors(current => current.filter(e => e !== item.id))
    }
    setFormData(current => ({
      ...current,
      [item.id]: value,
    }))
  }

  const hasError = errors.includes(item.id)
  return (
    <Select
      status={hasError ? 'warning' : 'primary'}
      label={item.text}
      placeholder={'On a scale of 1-10'}
      selectedIndex={value || 0}
      value={value ? `${value}` : undefined}
      onSelect={index => handleChange(index)}
      style={{marginTop: 16}}
      caption={hasError && 'please enter a value'}
    >
      {outOf10.map(n => (
        <SelectItem key={n} title={`${n}`} />
      ))}
    </Select>
  )
}

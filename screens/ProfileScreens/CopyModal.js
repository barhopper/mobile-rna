import {default as React, useState} from 'react'
import {StyleSheet, Dimensions, ScrollView} from 'react-native'
import {Text, Button, Modal} from '@ui-kitten/components'

import {useQuery} from 'react-query'

export function CopyModal({title, fetchFunction}) {
  if (!title || !fetchFunction) return null

  const {data, isFetching} = useQuery(title, fetchFunction, {
    staleTime: 99999999999,
  })

  const [isOpen, setIsOpen] = useState(false)
  const toggleModal = () => setIsOpen(current => !current)

  const {width, height} = Dimensions.get('window')
  const modalWidth = width - 32
  const maxHeight = height - 164

  return (
    <>
      <Button
        appearance="outline"
        onPress={toggleModal}
        style={{marginBottom: 12}}
      >
        {title}
      </Button>
      <Modal
        visible={isOpen}
        onBackdropPress={toggleModal}
        backdropStyle={styles.backdrop}
      >
        <ScrollView
          style={[
            styles.modalContainer,
            {width: modalWidth, height: maxHeight},
          ]}
        >
          <Text category="h5" style={[styles.marginBottom]}>
            {title}
          </Text>
          {!isFetching && data && (
            <Text category="p1" style={[styles.marginBottom]}>
              {data.content}
            </Text>
          )}
          <Button
            appearance="ghost"
            style={[styles.marginBottom, {paddingBottom: 16}]}
            onPress={toggleModal}
          >
            Exit
          </Button>
        </ScrollView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  marginBottom: {
    marginBottom: 16,
  },
  marginTop: {
    marginTop: 16,
  },
})

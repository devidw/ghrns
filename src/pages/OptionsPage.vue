<template lang="pug">
.q-pa-xl.q-gutter-md(style='max-width: 720px')
  q-input(filled, v-model='apiUrl', label='API URL')
  q-input(filled, v-model='apiKey', label='API Key')
  q-btn(@click='save', color='primary', label='Save')
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const apiUrl = ref('')
const apiKey = ref('')

if ($q.platform.is.bex) {
  $q.bex.send('storage.get', { key: 'apiUrl' }).then((res) => {
    apiUrl.value = res.data
  })
  $q.bex.send('storage.get', { key: 'apiKey' }).then((res) => {
    apiKey.value = res.data
  })
}

const save = () => {
  if (!$q.platform.is.bex) return
  $q.bex
    .send('storage.set', {
      key: 'apiUrl',
      data: apiUrl.value,
    })
    .then((res) => {
      $q.notify('Saved API URL')
    })
  $q.bex
    .send('storage.set', {
      key: 'apiKey',
      data: apiKey.value,
    })
    .then((res) => {
      $q.notify('Saved API Key')
    })
}
</script>

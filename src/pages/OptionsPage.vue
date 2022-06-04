<template lang="pug">
.q-pa-xl.q-gutter-md(style='max-width: 720px')
  q-input(
    filled,
    v-model='apiHost',
    label='API-Host',
    hint='API-Host domain without https://',
    :rules='[required]'
  )
  q-input(filled, v-model='apiKey', label='API Key', :rules='[required]')
  q-btn(@click='save', color='primary', label='Save')
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { required } from 'boot/utils'

const $q = useQuasar()
const apiHost = ref('')
const apiKey = ref('')

if ($q.platform.is.bex) {
  $q.bex.send('storage.get', { key: 'apiHost' }).then((res) => {
    apiHost.value = res.data
  })
  $q.bex.send('storage.get', { key: 'apiKey' }).then((res) => {
    apiKey.value = res.data
  })
}

const save = () => {
  if (!$q.platform.is.bex) return
  $q.bex
    .send('storage.set', {
      key: 'apiHost',
      data: apiHost.value,
    })
    .then((res) => {
      $q.notify('Saved API-Host')
    })
  $q.bex
    .send('storage.set', {
      key: 'apiKey',
      data: apiKey.value,
    })
    .then((res) => {
      $q.notify('Saved API-Key')
    })
}
</script>

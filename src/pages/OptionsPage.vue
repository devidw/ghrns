<template lang="pug">
.q-pa-xl.q-gutter-md(style='max-width: 720px')
  q-input(filled, v-model='apiKey', label='API Key', :rules='[required]')
  q-btn(@click='save', color='primary', label='Save')
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { required } from 'boot/utils'

const $q = useQuasar()
const apiKey = ref('')

if ($q.platform.is.bex) {
  $q.bex.send('storage.get', { key: 'apiKey' }).then((res) => {
    apiKey.value = res.data
  })
}

const save = async () => {
  if (!$q.platform.is.bex) {
    return
  }

  await $q.bex.send('storage.set', {
    key: 'apiKey',
    data: apiKey.value,
  })

  $q.notify('Saved API-Key')
}
</script>

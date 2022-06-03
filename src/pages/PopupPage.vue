<template lang="pug">
.q-pa-md.q-gutter-md.bg-brown-10(style='width: 250px; min-height: 150px')
  .row.justify-center.text-center(
    v-if='!suggestions.length && hasAllProvided()'
  )
    .col-12.q-mb-md Suggest namings for {{ repo }}
    .col-12
      q-btn(
        v-if='!loading',
        icon='ads_click',
        unelevated,
        round,
        color='primary',
        @click='suggest'
      )
      q-spinner-dots(v-if='loading', color='primary', size='xl')

  q-list(v-if='suggestions.length', dense, separator)
    q-item(
      v-for='suggestion in suggestions',
      :class='{ "bg-brown-9": suggestion === repo }',
      clickable,
      @click='copy(suggestion)'
    )
      q-item-section {{ suggestion }}
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const apiUrl = ref('')
const apiKey = ref('')
const user = ref('')
// const repo = ref('A')
const repo = ref('')
// const suggestions = ref(['A', 'B', 'C'])
const suggestions = ref([])
const loading = ref(false)
const hasAllProvided = () =>
  apiUrl.value && apiKey.value && user.value && repo.value

if ($q.platform.is.bex) {
  $q.bex.send('storage.get', { key: 'apiUrl' }).then((res) => {
    if (!res.data || !res.data.length) {
      $q.notify({
        type: 'negative',
        message: 'Please enter your API-URL under the options page.',
      })
      return
    }
    apiUrl.value = res.data
  })

  $q.bex.send('storage.get', { key: 'apiKey' }).then((res) => {
    if (!res.data || !res.data.length) {
      $q.notify({
        type: 'negative',
        message: 'Please enter your API-Key under the options page.',
      })
      return
    }
    apiKey.value = res.data
  })

  $q.bex.send('github.get.details', {}).then((res) => {
    if (!res.data || !res.data.user || !res.data.repo) {
      $q.notify({
        type: 'negative',
        message: 'Could not extract repo details from the URL.',
      })
      return
    }
    user.value = res.data.user
    repo.value = res.data.repo
  })
}

const suggest = () => {
  loading.value = true

  api.defaults.baseURL = apiUrl.value
  api.defaults.headers['X-API-Key'] = apiKey.value

  api
    .get(`/suggest/${user.value}/${repo.value}`)
    .then((res) => {
      console.log(res)
      loading.value = false
      suggestions.value = res.data.suggestions
    })
    .catch((err) => {
      console.error(err)
      loading.value = false
      $q.notify({
        type: 'negative',
        message: err.message,
      })
    })
}

const copy = (suggestion) => {
  copyToClipboard(suggestion)
  $q.notify({
    type: 'positive',
    message: 'Copied',
  })
}
</script>

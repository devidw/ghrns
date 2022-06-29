<template lang="pug">
.column.justify-between.wrap.bg-brown-10(style='width: 250px')
  // we are configuring request details
  div(v-if='!loading && !suggestions.length')
    q-tabs(v-model='tab', color='primary', dense)
      q-tab(label='GitHub', name='github')
      q-tab(label='Custom', name='custom')

    q-tab-panels(v-model='tab')
      q-tab-panel(name='github')
        .q-gutter-sm
          q-input(
            label='Username',
            type='text',
            v-model='user',
            filled,
            clearable
          )
          q-input(
            label='Repository',
            type='text',
            v-model='repo',
            filled,
            clearable
          )
      q-tab-panel(name='custom')
        q-input(
          label='Description',
          type='textarea',
          v-model='desc',
          filled,
          clearable
        )

    .q-px-md.q-pb-md(
      v-if='(tab === "github" && user && repo) || (tab === "custom" && desc)'
    )
      q-btn.fit(
        icon='ads_click',
        unelevated,
        color='primary',
        @click='suggest'
      )

  // we are loading
  .text-center(v-if='loading')
    q-spinner-dots(color='primary', size='xl')

  // we are showing suggestions
  div(v-if='!loading && suggestions.length')
    q-list(dense, separator)
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
import { SuggestionService } from 'boot/SuggestionService'

const $q = useQuasar()
const tab = ref('custom')
const apiKey = ref('')
const desc = ref('')
const user = ref('')
// const repo = ref('A')
const repo = ref('')
// const suggestions = ref(['A', 'B', 'C'])
const suggestions = ref([])
const loading = ref(false)
// const loading = ref(true)
const hasAllProvided = () => apiKey.value && user.value && repo.value

if ($q.platform.is.bex) {
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
      // $q.notify({
      //   type: 'negative',
      //   message: 'Could not extract repo details from the URL.',
      // })
      return
    }
    user.value = res.data.user
    repo.value = res.data.repo
    tab.value = 'github'
  })
}

function suggest() {
  loading.value = true

  api.defaults.baseURL = 'https://api.openai.com/v1'
  api.defaults.headers['Content-Type'] = 'application/json'
  api.defaults.headers['Authorization'] = `Bearer ${apiKey.value}`

  const suggestionService = new SuggestionService(api)

  function success(results) {
    loading.value = false
    suggestions.value = results
  }

  function error(err) {
    console.error(err)
    loading.value = false
    $q.notify({
      type: 'negative',
      message: err.message,
    })
  }

  if (tab.value === 'github' && user.value && repo.value) {
    suggestionService
      .getSuggestionsByUserAndRepo(user.value, repo.value)
      .then(success)
      .catch(error)
  } else if (tab.value === 'custom' && desc.value) {
    suggestionService.getSuggestions(desc.value).then(success).catch(error)
  } else {
    loading.value = false
    $q.notify({
      type: 'negative',
      message: 'Please enter all required fields.',
    })
    return
  }
}

function copy(suggestion) {
  copyToClipboard(suggestion)
  $q.notify({
    type: 'positive',
    message: 'Copied',
  })
}
</script>

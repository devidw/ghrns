class SuggestionService {
  constructor(openaiApi) {
    this.openaiApi = openaiApi
  }

  /**
   * Parse the response from OpenAI and make a list of suggestions.
   */
  parseResponse(res) {
    let suggestions

    if (res.includes(',')) {
      suggestions = res.split(',')
    } else if (res.includes('\n')) {
      suggestions = res.split('\n')
    } else {
      suggestions = [res]
    }

    suggestions = suggestions.map((s) => s.trim())

    // get rid of empty strings or strings with only whitespace
    suggestions = suggestions.filter((s) => s.length > 0)

    // if there still is a space in the list items, this is propably due to some sort of list formatting like "- ", "1. " and so one
    // In this cases, we split a the space and remove the first item
    suggestions = suggestions.map((s) => {
      if (s.includes(' ')) {
        return s.split(' ')[1]
      } else {
        return s
      }
    })

    // If the last item ends with a period, remove it
    if (suggestions[suggestions.length - 1].endsWith('.')) {
      return suggestions[suggestions.length - 1].slice(0, -1)
    }

    return suggestions
  }

  /**
   * Get suggestions for a given repo description.
   */
  async getSuggestions(desc) {
    let prompt = `
      Generate git repository names from a description.

      Description: The git repository description.
      Names: repo-sug, desc, gitsugg, GitRepo

      Description: ${desc}
      Names:
      `
      .trim() // remove opening and closing newlines
      .replace(/ {6}/g, '') // remove indentation

    const res = await this.openaiApi.post('/completions', {
      model: 'text-davinci-002',
      prompt: prompt,
      temperature: 0,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    // console.log(res)

    if (!res.data.choices.length) {
      return []
    }

    const choices = this.parseResponse(res.data.choices[0].text)

    return choices
  }

  /**
   * Get suggestions by GitHub username and repo name (translated to GitHub repo description).
   */
  async getSuggestionsByUserAndRepo(user, repo) {
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}`)
    const repoData = await res.json()

    if (!repoData.description) {
      throw new Error('No description found for this repository.')
    }

    // console.log(repoData.description)

    return this.getSuggestions(repoData.description)
  }
}

export { SuggestionService }

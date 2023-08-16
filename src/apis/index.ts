import { ofetch } from 'ofetch'

const useFetch = ofetch.create({
  baseURL: 'http://localhost:3000'
})

export default useFetch

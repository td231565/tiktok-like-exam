import { ofetch } from 'ofetch'

const useFetch = ofetch.create({
  // baseURL: 'http://localhost:3000'
  baseURL: 'https://6e41-2001-b011-2000-345c-c417-49bd-c8c-a01b.ngrok-free.app'
})

export default useFetch

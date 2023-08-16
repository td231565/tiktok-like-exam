import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:page?',
      name: 'home',
      props: (route) => {
        let page = route.params.page
        page = typeof page === 'string' ? page : ''
        if (!['follow', 'foryou'].includes(page)) {
          page = 'foryou'
        }
        return {
          page: page
        }
      },
      component: HomeView
    }
  ]
})

export default router

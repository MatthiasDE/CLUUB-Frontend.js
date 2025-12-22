import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import TimeRecording from './views/TimeRecording.vue'
import MemberManagement from './views/MemberManagement.vue'
import ListMembers from './views/ListMembers.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/time-recording'
    },
    {
      path: '/time-recording',
      name: 'TimeRecording',
      component: TimeRecording
    },
    {
      path: '/member-management',
      name: 'MemberManagement',
      component: MemberManagement
    },
    {
      path: '/list-members',
      name: 'ListMembers',
      component: ListMembers
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

<template>
  <v-snackbar
    v-if="notifications.length"
    :key="notifications[0].message"
    v-model="snackbar"
    :color="getColor(notifications[0].type)"
    :rounded="getRounded(notifications[0].type)"
    :timeout="3000"
    class="notification-snackbar"
  >
    <v-icon
      :icon="getIcon(notifications[0].type)"
      style="margin-right: 10px;"
    />
    {{ notifications[0].message }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'

import { NotificationType, useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()
const { notifications } = storeToRefs(notificationsStore)

const snackbar = ref(true)

watch(snackbar, (isOpen: boolean) => {
  // When snackbar is closing
  if (!isOpen) {
    notifications.value = notifications.value.slice(1)
    // Always stay open but don't display anything if there is no notification
    snackbar.value = true
  }
})

const getColor = (type: NotificationType): string => {
  if (type === NotificationType.success) return 'green'
  if (type === NotificationType.warning) return '#e1b12c'
  if (type === NotificationType.error) return '#e84118'
  return 'grey'
}

const getIcon = (type: NotificationType): string => {
  if (type === NotificationType.success) return 'mdi-checkbox-marked-circle'
  if (type === NotificationType.warning) return 'mdi-alert'
  if (type === NotificationType.error) return 'mdi-alert-octagon'
  return 'mdi-information-slab-box-outline'
}

const getRounded = (type: NotificationType): string => {
  return (type === NotificationType.success) ? 'pill' : 'none'
}
</script>
<style>
.notification-snackbar .v-snackbar__content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.notification-snackbar .v-snackbar__content>* {
  margin-left: 5px;
}
</style>

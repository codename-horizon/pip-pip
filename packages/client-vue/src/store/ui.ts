import { defineStore } from "pinia"
import { ref } from "vue"

export const useUiStore = defineStore("ui", () => {
    const loading = ref(false)
    const body = ref("")

    return {
        loading,
        body,
    }
})
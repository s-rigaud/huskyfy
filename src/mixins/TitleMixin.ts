import { defineComponent } from 'vue'

const TitleMixin = defineComponent({
  mounted () {
    document.title = this.title
  },
  data () {
    return {
      title: ''
    }
  }
})
export default TitleMixin

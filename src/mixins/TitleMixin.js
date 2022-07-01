const TitleMixin = {
  mounted () {
    document.title = this.title
  },
  data () {
    return {
      title: ''
    }
  }
}
export default TitleMixin

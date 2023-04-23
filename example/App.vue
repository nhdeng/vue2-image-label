<template>
  <div>
    <ImageLabel
      url="https://stbrain.kjt.zj.gov.cn/Documents/ac681331-de00-4fcb-b082-27159b32f6c5/Instruments/43%20%E7%A2%B3%E7%A1%AB%E5%88%86%E6%9E%90%E4%BB%AA.jpg"
      :container-props="{
        width: 400,
        height: 400,
      }"
      :line-props="{
        width: 4,
        color: 'yellow',
      }"
      :point-props="{
        size: 20,
        color: 'blue',
      }"
      :get-points="getPoints"
    />
    <div class="points">
      <p v-for="(item, index) in points">{{item.x}}, {{item.y}}</p>
    </div>
  </div>

</template>

<script>
import ImageLabel from 'vue2-image-label'
export default {
  components: {
    ImageLabel,
  },
  data() {
    return {
      points: [],
    }
  },
  methods: {
    getPoints(ps) {
      this.points = ps
    }
  }
}
</script>

<style>
.points {
  display: flex;

}
p {
  margin-left: 10px;
}
</style>

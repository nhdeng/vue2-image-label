<template>
  <div
    id="container"
    class="image-label__container"
    :style="{
      width: (containerProps.width || 1000) + 'px',
      height: (containerProps.height || 800) + 'px',
    }"
  >
    <div v-if="loading" class="status">
      <img :src="LoadingIcon" alt="loading icon" width="100" height="100" />
    </div>
    <canvas id="canvas" />
  </div>
</template>

<script>
import LoadingIcon from '../images/spinner.gif'
let __img_scale_ = 1
let currentSelectedPointIndex = -1
let ctx = {}
let img = null
let container = null
let canvas = null
let mouseStyleTimer = 0

export default {
  name: 'image-label',
  props: {
    url: {
      type: String,
    },
    pointProps: {
      type: Object,
    },
    lineProps: {
      type: Object,
    },
    containerProps: {
      type: Object,
    },
    getPoints: {
      type: Function,
    },
  },
  data() {
    return {
      loading: false,
      LoadingIcon: LoadingIcon,
      points: [],
    }
  },
  mounted() {
    container = document.getElementById('container')
    canvas = document.getElementById('canvas')
    this.loadPictureAndInitCanvas()
    canvas?.addEventListener('wheel', this.mouseWhell)
    canvas?.addEventListener('mousedown', this.listenMouseDown)
    canvas?.addEventListener('mousemove', this.listenMouseMove)
  },
  methods: {
    listenMouseDown(e) {
      if (!canvas) {
        return
      }
      const { clientX, clientY, offsetX, offsetY } = e
      // 画布距离原点的位置
      const spaceX = clientX - canvas.offsetLeft || 0
      const spaceY = clientY - canvas.offsetTop || 0
      const pointSize = this.pointProps?.size ? this.pointProps?.size * 2 : 20
      this.points.forEach((point, index) => {
        const scalePoint = {
          x: point.x * this.getScale(),
          y: point.y * this.getScale(),
        }
        const isSelected =
          Math.abs(offsetX - scalePoint.x) <= pointSize &&
          Math.abs(offsetY - scalePoint.y) <= pointSize
        if (isSelected) {
          currentSelectedPointIndex = index
        }
      })
      // 选中点 拖拽点
      if (currentSelectedPointIndex >= 0) {
        canvas.onmousemove = (event) => {
          this.points[currentSelectedPointIndex].x =
            event.offsetX / this.getScale()
          this.points[currentSelectedPointIndex].y =
            event.offsetY / this.getScale()
          ctx.clearRect(
            0,
            0,
            img.clientWidth * this.getScale(),
            img.clientHeight * this.getScale()
          )
          ctx.drawImage(
            img,
            0,
            0,
            img.clientWidth * this.getScale(),
            img.clientHeight * this.getScale()
          )
          this.mouseWhellDrawPointAndLine(this.getScale())
        }
      } else {
        // 未选中点 拖拽画布
        document.onmousemove = function (event) {
          if (!canvas) {
            return
          }
          const left = event.clientX - spaceX
          const top = event.clientY - spaceY
          canvas.style.left = left + 'px'
          canvas.style.top = top + 'px'
        }
      }
      document.onmouseup = function () {
        if (!canvas) {
          return
        }
        canvas?.setAttribute('class', '')
        document.onmousemove = null
        canvas.onmousemove = null
        document.onmouseup = null
        currentSelectedPointIndex = -1
      }
    },
    loadPictureAndInitCanvas() {
      ctx = canvas.getContext('2d')
      this.loading = true
      img = document.createElement('img')
      img.alt = 'trace img'
      img.id = 'img'
      img.src = this.url
      img.onload = () => {
        this.loading = false
        container = document.getElementById('container')
        console.log(img)
        container.appendChild(img)
        const { width, height } = img
        if (width > height) {
          img.style.width = '80%'
        } else {
          img.style.height = '80%'
        }
        // 容器中的图片尺寸
        const { clientWidth, clientHeight } = img
        __img_scale_ = clientWidth / width
        if (canvas) {
          canvas.style.width = clientWidth + 'px'
          canvas.style.height = clientHeight + 'px'
          canvas.width = clientWidth
          canvas.height = clientHeight
          canvas.style.left = `calc(50% - ${clientWidth / 2}px)`
          canvas.style.top = `calc(50% - ${clientHeight / 2}px)`
        }
        ctx.drawImage(img, 0, 0, clientWidth, clientHeight)
        img.style.scale = '1'
        this.initPoints(clientWidth, clientHeight)
        this.mouseWhellDrawPointAndLine(1)
      }
      // image load error
      img.onerror = function () {
        this.loading = false
      }
    },
    // 默认点加载， 默认取画布中心点80%的正方形区域
    initPoints(width, height) {
      if (this.points.length > 0) {
        return
      }
      const leftTop = { x: width * 0.2, y: height * 0.2 }
      const rightTop = { x: width * 0.8, y: height * 0.2 }
      const rightBottom = { x: width * 0.8, y: height * 0.8 }
      const leftBottom = { x: width * 0.2, y: height * 0.8 }
      this.points.push(leftTop)
      this.points.push(rightTop)
      this.points.push(rightBottom)
      this.points.push(leftBottom)
    },
    // 鼠标滚动绘制点线
    mouseWhellDrawPointAndLine(scale) {
      if (!this.points.length) {
        return
      }
      // 点
      this.points.forEach((point) => {
        ctx.beginPath()
        ctx.arc(
          point.x * scale,
          point.y * scale,
          this.pointProps?.size || 10,
          0,
          2 * Math.PI
        )
        ctx.fillStyle = this.pointProps?.color || 'red'
        ctx.fill()
        ctx.closePath()
      })
      ctx.beginPath()
      ctx.setLineDash([10, 5])
      ctx.lineWidth = this.lineProps?.width || 2
      ctx.strokeStyle = this.lineProps?.color || 'red'
      // 线
      this.points.forEach(({ x, y }) => {
        ctx.lineTo(x * scale, y * scale)
      })
      ctx.lineTo(this.points[0].x * scale, this.points[0].y * scale)
      ctx.stroke()
      // 执行获取坐标点的回调
      this.getPoints && this.getPoints(this.getOriginPoints())
    },
    getOriginPoints() {
      if (!this.points.length) {
        console.error('画布暂时没有初始化')
        return []
      }
      return this.points.map(({ x, y }) => ({
        x: Number((x / __img_scale_).toFixed(0)),
        y: Number((y / __img_scale_).toFixed(0)),
      }))
    },
    listenMouseMove(e) {
      if (!canvas) {
        return
      }
      const { offsetX, offsetY } = e
      let moveToPoint = false
      const pointSize = this.pointProps?.size ? this.pointProps?.size * 2 : 20
      this.points.forEach((point) => {
        const scalePoint = {
          x: point.x * this.getScale(),
          y: point.y * this.getScale(),
        }
        const confirm =
          Math.abs(offsetX - scalePoint.x) <= pointSize &&
          Math.abs(offsetY - scalePoint.y) <= pointSize
        if (confirm) {
          moveToPoint = true
        }
      })
      if (mouseStyleTimer) {
        clearTimeout(mouseStyleTimer)
      } else {
        setTimeout(() => {
          canvas?.setAttribute('class', moveToPoint ? 'selected' : '')
        }, 100)
      }
    },
    getScale() {
      return Number(img.style.scale)
    },
    mouseWhell(e) {
      e.preventDefault()
      this.mouseWheelDrawPicture(e)
      this.mouseWhellDrawPointAndLine(this.getScale())
    },
    mouseWheelDrawPicture(e) {
      /**
       * deltaY 正值:向下滚动 缩小; 负值:向上滚动 放大
       */
      let top = 0
      let left = 0
      // @ts-ignore
      const { deltaY, offsetX, offsetY } = e
      if (deltaY < 0 && this.getScale() < 5 && canvas) {
        img.style.scale = JSON.stringify(this.getScale() + 0.1)
        // 计算出这次放大相比于上一次调整了canvas多少的offsetTop和offsetLeft
        left =
          canvas.offsetLeft -
          ((offsetX * this.getScale()) / (this.getScale() - 0.1) - offsetX)
        top =
          canvas.offsetTop -
          ((offsetY * this.getScale()) / (this.getScale() - 0.1) - offsetY)
        canvas.style.left = left + 'px'
        canvas.style.top = top + 'px'
        canvas.style.width = img.clientWidth * this.getScale() + 'px'
        canvas.style.height = img.clientHeight * this.getScale() + 'px'
        canvas.width = img.clientWidth * this.getScale()
        canvas.height = img.clientHeight * this.getScale()
      }
      if (deltaY >= 0 && this.getScale() - 0.1 >= 0.1 && canvas) {
        img.style.scale = JSON.stringify(this.getScale() - 0.1)
        // 计算出这次缩小相比于上一次调整了canvas多少的offsetTop和offsetLeft
        left =
          canvas.offsetLeft -
          (offsetX * this.getScale()) / (this.getScale() + 0.1) +
          offsetX
        top =
          canvas.offsetTop -
          (offsetY * this.getScale()) / (this.getScale() + 0.1) +
          offsetY

        canvas.style.left = left + 'px'
        canvas.style.top = top + 'px'
        canvas.style.width = img.clientWidth * this.getScale() + 'px'
        canvas.style.height = img.clientHeight * this.getScale() + 'px'
        canvas.width = img.clientWidth * this.getScale()
        canvas.height = img.clientHeight * this.getScale()
      }

      ctx.drawImage(
        img,
        0,
        0,
        img.clientWidth * this.getScale(),
        img.clientHeight * this.getScale()
      )
    },
  },
}
</script>
<style>
.image-label__container {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
}
.image-label__container canvas {
  position: absolute;
  cursor: move;
}

.image-label__container #img {
  position: absolute;
  right: 1000000px;
  bottom: 1000000px;
}

.image-label__container .selected {
  cursor: crosshair;
}
.image-label__container .status {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

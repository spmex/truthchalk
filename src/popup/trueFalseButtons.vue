<template lang="pug">
  div#card-buttons
    el-tooltip(content="Revert" placement="bottom")
      el-button#button-save.op-buttons(
        icon='el-icon-delete' v-show='toSave'
        type="primary" @click='reset' circle
      )
    el-tooltip(content="Save" placement="bottom")
      el-button#button-save.op-buttons(
        icon='el-icon-check' v-show='toSave'
        type="success" @click='save' circle
      )
    el-button#button-true.tc-buttons(
      type='primary' round
      @click.left='toggleState(1)'
      v-bind:class="{ 'button-true-toggle': buttonTrue }"
    ) T | {{ numTrue }}
    el-button#button-false.tc-buttons(
      type='primary' round
      @click.left='toggleState(-1)'
      v-bind:class="{ 'button-false-toggle': buttonFalse }"
    ) F | {{ numFalse }}
</template>
<script>
export default {
  props: ['annotation'],
  data: () => ({
    originalState: 0,
    state: 0,
    numTrue: 0,
    numFalse: 0
  }),
  computed: {
    buttonTrue () {
      return this.state === 1
    },
    buttonFalse () {
      return this.state === -1
    },
    toSave () {
      return this.state !== this.originalState
    }
  },
  created () {
    this.reset()
  },
  methods: {
    reset () {
      this.numTrue = this.annotation.numTrue
      this.numFalse = this.annotation.numFalse
      this.originalState = this.annotation.vote
      this.state = this.annotation.vote
    },
    /*
      A table to quickly determine the increments of numTrue/numFalse
     */
    solveIncrement (state, newState) {
      const increments = {
        '0,-1': [0, 1],
        '1,-1': [-1, 1],
        '-1,0': [0, -1],
        '0,1': [1, 0],
        '-1,1': [1, -1],
        '1,0': [-1, 0]
      }
      return increments[[state, newState]]
    },
    /*
      Toggle the state of the current popbar
      * Increments table
      * * key: (the original state, the button input)
      * * value: the increments of numTrue/numFalse based on state
     */
    toggleState (v) {
      let oldState = this.state
      this.state = (v === this.state) ? 0 : v
      let increment = this.solveIncrement(oldState, this.state)
      this.numTrue += increment[0]
      this.numFalse += increment[1]
    },

    save () {
      let annotation = {
        action: 'saveAnnotation',
        test: '',
        id: this.annotation.id,
        vote: this.state,
        source: this.annotation.source,
        increment: this.solveIncrement(this.originalState, this.state)
      }
      chrome.runtime.sendMessage(annotation)
      this.originalState = this.state
    }
  }
}
</script>
<style lang="scss" scoped>
$tc-true-tint: orange;
$tc-false-tint: black;
#card-buttons{
  position: absolute;
  margin-top: 10px;
  bottom: 10px;
  right: 40px;
}
.tc-buttons{
  min-width: 50px;
  width: auto;
  height: 25px;
  padding: 0;
  border: none;
  background: none;
  color: black;
  opacity: 1
}
#button-true:hover {
  background: $tc-true-tint;
  color: $tc-false-tint;
  opacity: 1
}
#button-false:hover {
  background: $tc-false-tint;
  color: $tc-true-tint;
  opacity: 1
}
.button-true-toggle {
  color: $tc-false-tint;
  background: $tc-true-tint;
  opacity: .75
}
.button-false-toggle {
  color: $tc-true-tint;
  background: $tc-false-tint;
  opacity: .75
}
.op-buttons{
  width: 25px;
  height: 25px;
  padding: 0;
  color: black;
  border: none;
}
</style>
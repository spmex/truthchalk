<template lang="pug">
  div#tc-popbar(
    v-if = 'hasUser'
    v-show='isShow'
    v-bind:style='position'
    ref='popbar'
  )
    el-button#tc-button-true.tc-popbar.tc-button(
      type='primary'
      @click.left.stop='toggleState(1)'
      v-bind:class="{ 'tc-button-toggle': buttonTrue }"
    ) T | {{ numTrue }}
    el-button#tc-button-false.tc-popbar.tc-button(
      type='primary'
      @click.left.stop='toggleState(-1)'
      v-bind:class="{ 'tc-button-toggle': buttonFalse }"
    ) {{ numFalse }} | F
</template>
<script>
  import rangy from 'rangy/lib/rangy-core.js'
  import 'rangy/lib/rangy-classapplier'
  import 'rangy/lib/rangy-textrange'
  
  export default {
    data: () => ({
      state: 0,
      originalState: 0,
      numTrue: 0,
      numFalse: 0,
      target: null,
      range: null,
      position: {
        top: '0px',
        left: '0px'
      },
      isShow: true,
      hasUser: true
    }),
    computed: {
      buttonTrue () {
        return this.state === 1
      },
      buttonFalse () {
        return this.state === -1
      }
    },
    created () {
      rangy.init()
      document.body.addEventListener('mouseup', this.selectToShow)
      document.body.addEventListener('keyup', this.closeBar)
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if ('isLoggedIn' in request) {
          this.hasUser = request.isLoggedIn
          if (this.hasUser) {
            chrome.runtime.sendMessage({
              action: 'queryTexts', texts: this.collectAllSentences()
            }, (response) => this.highlightExistingSentences(response.texts))
          } else {
            this.removeAllHighlightSentences()
          }
        }
      })
      this.isShow = false
    },
    mounted () {
      // Check if there is a current user
      chrome.runtime.sendMessage({ action: 'isLoggedIn' }, (response) => {
        this.hasUser = response.isLoggedIn
        if (this.hasUser) {
          chrome.runtime.sendMessage({
            action: 'queryTexts', texts: this.collectAllSentences()
          }, (response) => this.highlightExistingSentences(response.texts))
        }
      })
    },
    beforeDestroy () {
      document.body.removeEventListener('mouseup', this.selectToShow)
      document.body.removeEventListener('keyup', this.closeBarByEsc)
    },
    methods: {
      resetData () {
        Object.assign(this.$data, this.$options.data.call(this))
      },

      closeBarByEsc (event) {
        // Esc keycode: 27
        if (event.keyCode === 27) this.isShow = false
        event.stopPropagation()
      },

      /*
        Select content to show/hide the popbar
        * Selection must not be empty
        * Selection must be outside of a highlighted node
        * Selection must be able to be expanded to a sentence
        */
      selectToShow (event) {
        // If there is no valid user, we don't do anything
        if (!this.hasUser) return

        let selection = rangy.getSelection()
        if (event.ctrlKey && !this.isShow) {
          // Expanded range is set up in expandSelection()
          if (selection.toString().length !== 0 &&
              this.expandSelection(selection)) {
            this.show(event.pageX, event.pageY)
            event.stopPropagation()
          }
        } else if (!this.$refs.popbar.contains(event.target)) {
          // Hide the popbar unless mouse up on the popbar
          this.hide()
        }
      },

      /*
        Click the highlighed text to show/hide popbar
        * Click on any part of the highlighted text
        * No selection is made by user
        */
      clickToShow (event) {
        if (!this.hasUser) return

        if (this.isShow) {
          this.hide()
        } else if (rangy.getSelection().toString().length === 0) {
          // If the target element is included in a tc-highlight element
          // we walk up the DOM to find the correct parent
          let current = event.target
          while (!current.classList.contains('tc-highlight')) {
            current = current.parentNode
          }
          this.target = current
          this.show(event.pageX, event.pageY, this.target)
          event.stopPropagation()
        }
      },

      show (pageX, pageY, target) {
        this.isShow = true

        // Move the popbar to mouse position
        let left = Math.max(pageX - 50, 0)
        let top = pageY - 50
        this.position.top = top.toString() + 'px'
        this.position.left = left.toString() + 'px'

        // Update data if clicked on a highlighted sentence
        if (target) {
          this.numTrue = parseInt(target.dataset['tcTrue'])
          this.numFalse = parseInt(target.dataset['tcFalse'])
          let userVote = parseInt(target.dataset['tcUser'])
          if (userVote !== 0) {
            this.state = userVote
          }
        }

        // Memorize the inital state for later comparison
        this.originalState = this.state
      },

      hide () {
        // Update popbar only when state changes
        if (this.originalState !== this.state) {
          // Construct the object to be save to the server
          let annotation = {
            action: 'saveAnnotation',
            text: '',
            id: null,
            vote: this.state,
            source: this.getUrl(),
            increment: this.solveIncrement(this.originalState, this.state)
          }
          // Determine the target element to process
          let target = this.target
          if (target && target.classList.contains('tc-highlight')) {
            // For popbar triggered by clicking on a highlighted node
            annotation.id = target.dataset['tcId']
            if (this.numTrue === 0 && this.numFalse === 0) {
              // If the total vote become zero, we remove the highlight
              this.removeHighlight(target)
            } else {
              this.applyHighlight(target, this.numTrue >= this.numFalse)
              this.updateTargetData(target)
            }
          } else {
            // For selection we just directly apply highlight
            target = this.targetFromRange(this.range)
            this.applyHighlight(target, this.state === 1)
            this.updateTargetData(target)
          }
          annotation.text = target.innerText
          // Send the annotation to background.js to save it
          chrome.runtime.sendMessage(annotation, (response) => {
            if (target) {
              target.dataset['tcId'] = response.id
            }
          })
        }
        // Reset instance data for next popup
        this.resetData()
        this.isShow = false
      },

      /*
        Get the URL of the current web page
       */
      getUrl () {
        return window.location.protocol +
          '//' + window.location.host +
          '/' + window.location.pathname +
          window.location.search
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

      /*
        Expand the selection to a full sentence.
        * The text of the PARENT node is retrived, and match sentences
        * Matching regex from: https://stackoverflow.com/questions/26184434/splitting-a-string-into-words-and-keeping-delimiter
       */
      expandSelection (selection) {
        let textNode = selection.anchorNode
        let parent = textNode.parentNode
        if (selection.toString().length === 0 ||
            textNode.nodeType !== 3 || parent === null) return false

        let range = new rangy.WrappedRange(window.getSelection().getRangeAt(0))
        let regex = /[^.!?\s][^\n.!?]*\b[^.!?\s][^\n.!?]*\b[^.!?\s][^\n.!?]*(?:[.!?](?!['"]?\s|$)[^\n.!?]*)*[.!?]?['"]?(?=\s|$)/g
        let newRange = rangy.createRange()
        let match
        while ((match = regex.exec(parent.innerText)) != null) {
          newRange.selectCharacters(parent, match.index, regex.lastIndex)
          // Only completely included range works. Overlapping doesn't work.
          if (newRange.containsRange(range)) {
            selection.removeAllRanges()
            selection.addRange(newRange)
            this.range = newRange
            return true
          }
        }
        return false
      },

      /*
        Apply highlight to a selection or target element
        * For selection, we create a target element to contain it
        * The input boolean indicate whether we apply true/false color
       */
      applyHighlight (target, isTrue) {
        let classes = ['tc-highlight-true', 'tc-highlight-false']
        let n = isTrue ? 0 : 1

        if (!target.classList.contains(classes[n])) {
          target.classList.add(classes[n])
          target.classList.remove(classes[1 - n])
        }

        target.addEventListener('click', this.clickToShow)
      },

      /*
        Remove highlight from target element
        * Create a new range to contain the children of the target
        * Insert the child before the target one by one
        * Remove the target in the end and merge the range boundary
       */
      removeHighlight (target) {
        let range = rangy.createRange()
        let parent = target.parentNode
        while (target.firstChild) {
          let child = target.firstChild
          parent.insertBefore(child, target)
          range.selectNode(child)
        }
        parent.removeChild(target)
        range.normalizeBoundaries()
      },

      updateTargetData (target, numTrue, numFalse, state) {
        target.dataset['tcTrue'] = numTrue || this.numTrue
        target.dataset['tcFalse'] = numFalse || this.numFalse
        target.dataset['tcUser'] = state || this.state
      },

      targetFromRange (range) {
        // If applied to a range from a selection, we wrap-up the target
        if (range !== null) {
          let wrapNode = document.createElement('span')
          // Split the boundaries of the range so it won't partially overlap
          range.splitBoundaries()
          wrapNode.appendChild(range.extractContents())
          range.insertNode(wrapNode)
          wrapNode.classList.add('tc-highlight')
          return wrapNode
        }
        return null
      },

      /*
        The input data object format:
        * Key: the string matched
        * Value: [numTrue, numFalse, state]
       */
      highlightExistingSentences (texts) {
        for (let str in texts) {
          let votes = texts[str].votes
          let text = texts[str].text
          let range = rangy.createRange()
          range.findText(text)

          if (!range.collapsed) {
            let target = this.targetFromRange(range)
            this.applyHighlight(target, votes[0] >= votes[1])
            this.updateTargetData(target, votes[0], votes[1], votes[2])
          }
        }
      },

      /*
        Remove all the existing highlights when user logout
       */
      removeAllHighlightSentences () {
        let elements = document.querySelectorAll('.tc-highlight')
        for (let el of elements) this.removeHighlight(el)
      },

      collectAllSentences () {
        // Use Rangy API range.text() to get the whole text as it will
        // automatically add line break between block elements.
        let range = rangy.createRange()
        range.selectNode(document.body)
        let matches = new Set(range.text().match(/[^.!?\s][^\n.!?]*\b[^.!?\s][^\n.!?]*\b[^.!?\s][^\n.!?]*(?:[.!?](?!['"]?\s|$)[^\n.!?]*)*[.!?]?['"]?(?=\s|$)/g))
        return [...matches]
      }
    }
  }
</script>
<style lang="scss">
  $tc-true: rgba(235, 196, 124, 0.5);
  $tc-false: rgba(128, 128, 128, 0.5);
  $tc-true-tint: orange;
  $tc-false-tint: black;
  $popbar-height: 35px;

  #tc-popbar {
    position: absolute;
    height: $popbar-height;
    min-width: min-content;
    line-height: $popbar-height;
    z-index: 9999
  }
  .tc-highlight:hover{
    background-color: yellow;
    transition: background-color 0.2s ease-in-out
  }
  .tc-highlight-true {
    background-color: $tc-true;
    transition: background-color 0.2s ease-in-out
  }
  .tc-highlight-false {
    background-color: $tc-false;
    transition: background-color 0.2s ease-in-out
  }
  .tc-button {
    height: $popbar-height;
    position: absolute;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 16px;
    font-family: 'Bookman Old Style', serif;
    border-color: black;
    opacity: 0.7
  }
  .tc-button:focus{
    border-color: black;
    box-shadow: 0 0 0 black
  }
  .tc-button:hover{
    border-color: black;
    opacity: 1
  }
  .tc-button-toggle {
    border-color: black;
    opacity: 1
  }
  #tc-button-true {
    right: 50%;
    border-radius: 500px 0 0 500px;
    margin-right: 0;
    background: $tc-true-tint;
    color: $tc-false-tint;
  }
  #tc-button-false {
    left: 50%;
    border-radius: 0 500px 500px 0;
    margin-left: 0;
    background: $tc-false-tint;
    color: $tc-true-tint;
  }
</style>

Vue.component("reference-list", {
  props: ["signedIn", "currentUser", "userCanEdit", "allReferences"],
  template: '#reference-list',
  data: function() {
    return {
      truncateAbstract: true,
      referenceIndexInModal: 0,
      selectedRef: {},
      showAllNotes: false,
      hasAbstract: false,
      editAbstract: false,
      showTagForm: false,
      newTag: '',
      filterKey: '',
      sortKey:'',
      sortOrders: {'age': 1, 'votes': -1},
    }
  },
  computed: {
    editsAllowed: function() {
      return this.signedIn && this.userCanEdit
    },
    showNoteSubmit: function() {
      return this.selectedRef.note_form != ''
    },
    abstractImported: function() {
      return !this.selectedRef.paper.abstract_editable && this.hasAbstract
    },
    filteredData: function () {
      var sortKey = this.sortKey
      var filterKey = this.filterKey
      var order = this.sortOrders[sortKey]
      var data = this.allReferences
      var fuseOptions = {
        tokenize: true,
        shouldSort: true,
        threshold: 0.4,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "paper.title",
          "paper.authors.full_name",
          "paper.tag_list",
          "paper.abstract"
        ]
      };
      if(filterKey) {
        var fuse = new Fuse(data, fuseOptions);
        data = fuse.search(this.filterKey);
      }
      if (sortKey) {
        data = data.slice().sort(function (a, b) {
          if(sortKey == 'age'){
            a = a.paper['published_at']
            b = b.paper['published_at']
          } else {
            a = a[sortKey]
            b = b[sortKey]
          }
          return (a === b ? 0 : a > b ? 1 : -1) * order
        })
      }
      return data
    }
  },
  mounted: function() {
    this.allReferences.forEach(function(reference) {
      Vue.set(reference, 'abstract_form', reference.paper.abstract)
      Vue.set(reference, 'note_form', '')
      reference.notes.forEach(function(note) {
        Vue.set(note, 'editNote', false)
        Vue.set(note, 'edit_form', note.content)
      })
    })
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    },
    addToFilter: function(add) {
      if(this.filterKey) {
          this.filterKey += ' ' + add
      } else {
          this.filterKey = add
      }
    },
    selectReference: function(index) {
      this.referenceIndexInModal = index;
      this.selectedRef = this.allReferences[index];
      this.hasAbstract = this.selectedRef.paper.abstract != null;
      this.editAbstract = false;
      this.showTagForm = false;
    },
    cancelAbstractForm: function() {
      this.editAbstract = false
      this.selectedRef.abstract_form = this.selectedRef.abstract
    },
    submitAbstract: function(reference) {
      var self = this;
      var paper = reference.paper
      var params = {
        paper: {
          abstract: reference.abstract_form
        }
      };
      $.ajax({
        url: "/papers/" + paper.id  + ".json",
        type: 'PATCH',
        data: params
      })
      .done(function(){
        self.hasAbstract = true
        self.editAbstract = false
        reference.paper.abstract = reference.abstract_form
      })
    },
    submitTags: function() {
      var tag_list = this.selectedRef.paper.tag_list
      if(this.selectedRef.paper.tag_list.length == 0){ tag_list =[""]}

      var params = {
        paper: {
          tag_list: tag_list
        }
      };
      $.ajax({
        url: "/papers/" + this.selectedRef.paper.id  + ".json",
        type: 'PATCH',
        data: params
      })
      .done(function(){
      })
    },
    addTag: function() {
      if(this.newTag != '') {
        this.selectedRef.paper.tag_list.push(this.newTag)
        this.newTag = ''
        this.submitTags()
      }
    },
    removeTag: function(index){
      this.selectedRef.paper.tag_list.splice(index,1)
      this.submitTags()
    },
    submitNote: function() {
      var self = this
      var params = {
        comment: {
          content: this.selectedRef.note_form,
          commentable_type: 'Reference',
          commentable_id: this.selectedRef.id
        }
      };
      $.ajax({
        url: "/comments.json",
        type: 'POST',
        data: params
      })
      .done(function(newNote){
        self.selectedRef.note_form = ''
        newNote.voted = false
        newNote.votes = 0
        newNote.type ="comment"
        newNote.vote_path = "/comments/" + newNote.id + "/vote"
        newNote.time_ago = "now"
        newNote.user = self.currentUser
        newNote.edit_form = newNote.content
        newNote.editNote = false
        self.selectedRef.notes.unshift(newNote)
      })
    },
    deleteNote: function(note,index) {
      var self = this
      $.ajax({
        url: "/comments/" + note.id + ".json",
        type: 'DELETE'
      })
      .done(function(res){
        self.selectedRef.notes.splice(index,1)
      })
    },
    cancelEditNote: function(note) {
      note.edit_form = note.content
      note.editNote = false
    },
    updateNote: function(note) {
      var self = this
      var params = {
        comment: {
          content: note.edit_form,
          commentable_type: 'Reference'
        }
      };
      $.ajax({
        url: "/comments/" + note.id + ".json",
        type: 'PATCH',
        data: params
      })
      .done(function(res){
        note.content = note.edit_form
        note.editNote = false
      })
    }
  }
});
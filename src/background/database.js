import Parse from 'parse'

let ANNOTATIONS_TABLE = 'Annotations'
let USER_ANNOTATION_TABLE = 'UserAnnotations'

export default {
  /*
    Query an annotation with text and ID. The input:
    * text: Sentence text
    * ID: the objectId in database for this annotation
    If ID is not undefined in the input, we direclty use it to query.
    Otherwise we try to find the annotation with matched text
   */
  queryAnnotation (text, id) {
    const Annotation = Parse.Object.extend(ANNOTATIONS_TABLE)
    const query = new Parse.Query(Annotation)
    if (id) {
      query.equalTo('objectId', id)
    } else {
      query.equalTo('text', text)
    }
    return query.first()
  },

  /*
    Update the number of true/false of an annotation. Input:
    * annotation: the annotation object (from the query or Parse API)
    * increment: an array with the increments of the number of true/false.
    * * Index 0: number of true
    * * Index 1: number of false
   */
  updateAnnotation (annotation, increment) {
    annotation.increment('numTrue', increment[0])
    annotation.increment('numFalse', increment[1])
    return annotation.save()
  },

  /*
    Create an annotation object. Input:
    * text: the text of the sentence to be saved
    * increment: an array with the increments of the number of true/false.
    * * Index 0: number of true
    * * Index 1: number of false
   */
  createAnnotation (text, increment) {
    const Annotation = Parse.Object.extend(ANNOTATIONS_TABLE)
    let annotation = new Annotation()
    annotation.set('text', text)
    annotation.set('numTrue', 0)
    annotation.set('numFalse', 0)
    return this.updateAnnotation(annotation, increment)
  },

  async saveAnnotation (text, id, increment) {
    try {
      let annotation = await this.queryAnnotation(text, id)
      return await annotation
        ? this.updateAnnotation(annotation, increment)
        : this.createAnnotation(text, increment)
    } catch (error) {
      console.log(error)
    }
  },

  queryAllAnnotations (texts) {
    const Annotation = Parse.Object.extend(ANNOTATIONS_TABLE)
    const query = new Parse.Query(Annotation)
    query.containedIn('text', texts)
    return query.find()
  },

  queryUserAnnotation (user, annotation) {
    const UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE)
    const query = new Parse.Query(UserAnnotation)
    query.equalTo('user', user)
    query.equalTo('annotation', annotation)
    return query.first()
  },

  queryMultipleUserAnnotations (user, annotations) {
    const UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE)
    const query = new Parse.Query(UserAnnotation)
    query.equalTo('user', user)
    query.containedIn('annotation', annotations)
    return query.find()
  },

  updateUserAnnotation (userAnnotation, vote, source) {
    userAnnotation.set('vote', vote)
    userAnnotation.set('source', source)
    return userAnnotation.save()
  },

  createUserAnnotation (user, annotation, vote, source) {
    const UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE)
    let userAnnotation = new UserAnnotation()
    userAnnotation.set('user', user)
    userAnnotation.set('annotation', annotation)
    userAnnotation.set('vote', 0)
    return this.updateUserAnnotation(userAnnotation, vote, source)
  },

  async saveUserAnnotation (user, annotation, vote, source) {
    let userAnnotation = await this.queryUserAnnotation(user, annotation)
    if (userAnnotation) {
      if (vote === 0) {
        return userAnnotation.destroy()
      } else {
        return this.updateUserAnnotation(userAnnotation, vote, source)
      }
    } else {
      return this.createUserAnnotation(user, annotation, vote, source)
    }
  },

  /*
    Query all the annotations made by User. Input
    * User: the user object (from database of Parse.User.current())
   */
  queryAllAnnotationsByUser (user) {
    const UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE)
    const query = new Parse.Query(UserAnnotation)
    query.equalTo('user', user)
    return query.find()
  }
}

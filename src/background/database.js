import Parse from 'parse'

let ANNOTATIONS_TABLE = 'Annotations'
let USER_ANNOTATION_TABLE = 'UserAnnotations'

export default {
  /*
    Save a new annotation. The input entry:
    * text: Sentence text
    * vote: Vote value (1 or -1)
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

  updateAnnotation (annotation, increment) {
    annotation.increment('numTrue', increment[0])
    annotation.increment('numFalse', increment[1])
    return annotation.save()
  },

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
  }
}

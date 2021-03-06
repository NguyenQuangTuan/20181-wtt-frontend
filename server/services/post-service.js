const unirest = require('unirest')
const { api_url } = require('../config/index')
const _ = require('lodash')

module.exports = class PostService {
  constructor() {
    this.autocomplete = this.autocomplete.bind(this)
    this.find_all = this.find_all.bind(this)
    this.find_one = this.find_one.bind(this)
    this.create = this.create.bind(this)
    this.like = this.like.bind(this)
    this.check_like = this.check_like.bind(this)
  }

  autocomplete(condition = {}, callback) {
    let { title, content } = condition
    let query = {}
    let list = Object.assign({}, { title, content })
    let list_key = Object.keys(list)
    list_key.map(key => {
      if (list[key]) Object.assign(query, { [key]: list[key] })
    })

    let url = `${api_url}/posts/autocomplete`

    let req = unirest.get(url)
      .query(Object.assign({}, query))

    req.end(res => {
      return callback(res.error, res.body.posts)
    })
  }

  find_all(condition = {}, select = null, offset = 0, limit = 10, sort = {}, callback) {
    let { post_ids, title, content, user_id, tags } = condition
    if (post_ids) post_ids = post_ids.join(',')
    if (tags) tags = tags.join(',')

    let query = {}
    let list = Object.assign({}, { post_ids, title, content, user_id, tags })
    let list_key = Object.keys(list)
    list_key.map(key => {
      if (list[key]) Object.assign(query, { [key]: list[key] })
    })

    // Handle sort
    let new_sort = []
    Object.keys(sort).map(key => {
      if (sort[key] == 1) new_sort.push(`${(key)}`)
      if (sort[key] == -1) new_sort.push(`-${(key)}`)
    })
    sort = new_sort.join(',')
    let url = `${api_url}/posts`

    let req = unirest.get(url)
      .query(Object.assign({}, query, { fields: select, offset, limit, sort }))

    req.end(res => {
      if(res.error){
        return callback(res.error, null)
      }
      return callback(null, res.body.posts)
    })
  }

  find_one(post_id, callback) {
    let url = `${api_url}/posts/${post_id}`
    let req = unirest.get(url)

    req.end(res => {
      return callback(res.error, res.body.post)
    })
  }

  create(authorization, post, callback) {
    console.log(post)

    let url = `${api_url}/posts/`
    let req = unirest.post(url)
      .headers({ authorization })
      .type('json')
      .send({ post })
    req.end(res => {
      console.log(res.body);
      return callback(res.error, res.body.post)
    })
  }

  like(authorization, data, callback) {
    let url = `${api_url}/favorites/`
    let req = unirest.put(url)
      .headers({ authorization })
      .type('json')
      .send(data)
    req.end(res => {
      console.log(res.body);
      return callback(res.error, res.body.updated)
    })
  }

  check_like(authorization, post_id, callback) {

    let url = `${api_url}/favorites/`
    let req = unirest.get(url)
      .headers({ authorization })
      .type('json')

    req.end(res => {
      console.log(res.body);
      let { post_ids } = res.body;
      if (!post_ids || !_.isArray(post_ids)) {
        return callback(res.error, false)
      }
      return callback(res.error, post_ids.indexOf(post_id) >= 0)
    })
  }
}
